import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Common } from "../helper/common";
import { Op } from "sequelize";
import CategoriesModel from "../models/categories";
import CitiesModel from "../models/cities";
import CountriesModel from "../models/countries";
import Favorite_servicesModel from "../models/favorite_services";
import ServicesModel from "../models/services";
import Services_userModel from "../models/services_user";
import Service_imageModel from "../models/service_images";
import State_servicesModel from "../models/state_services";
import UsersModel from "../models/users";

export class Controller {

    async getAll(req: any, res: Response, next: any) {
        var user:any = req.userTokenInfo.user
        try {
            const results = await Favorite_servicesModel().findAll({
                where: {
                    userId: user.id
                },
                include: [{
                    model: Services_userModel(),
                    include: [{
                        association: Services_userModel().hasMany(Service_imageModel(), { sourceKey:'id', foreignKey: 'serviceId', as: 'user_images'}),
                    },{
                        association:  Services_userModel().hasOne(UsersModel(), { sourceKey:'userId', foreignKey: 'id', as: 'User'}),
                        attributes: { exclude: ['pass'] },
                    },{
                        model: ServicesModel(),
                    },{
                        model: State_servicesModel(),
                    },{
                        model: CategoriesModel(),
                        as: 'Categories'
                    }]
                }]
            });
            
            res.status(200).json({Favorite_services: results});
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async get(req: Request, res: Response, next: any) {
        try {

            const { id } = req.params;
            const reg = await Favorite_servicesModel().findByPk(id);

            if(!reg){
                res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id}`
                })
            }
            
            res.status(200).json({Favorite_services: reg});

        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async add(req: any, res: Response, next: any) {
        var user:any = req.userTokenInfo.user
        const { body } = req;

        try {
            body.userId = user.id

            const service = await Services_userModel().findOne({
                where: {
                    id: body.serviceUserId
                }
            })

            if (service == null) {
                return res.status(400).json({message: 'servicio de usuario no existe'})
            }

            const error = await Controller.validatorFavorite(body);
            if (error) {
                return res.status(400).json({ message: 'El servicio de usuario ya se encuentra registrado'})
            }

            const reg:any = await Favorite_servicesModel().create(body);

            const results = await Favorite_servicesModel().findAll({
                where: {
                    id: reg.id
                },
                include: [{
                    model: Services_userModel(),
                    include: [{
                        association: Services_userModel().hasMany(Service_imageModel(), { sourceKey:'id', foreignKey: 'serviceId', as: 'user_images'}),
                    },{
                        association:  Services_userModel().hasOne(UsersModel(), { sourceKey:'userId', foreignKey: 'id', as: 'user'}),
                        attributes: { exclude: ['pass'] },
                        include: [{
                            model: CitiesModel()
                        },{
                            model: CountriesModel()
                        }]
                    },{
                        model: ServicesModel(),
                    },{
                        model: State_servicesModel(),
                    },{
                        model: CategoriesModel(),
                        as: 'Categories'
                    }]
                }]
            });

            res.status(200).json({Favorite_services: results});
        
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async update(req: Request, res: Response, next: any) {

        var id  = req.params.id;
        const { body } = req;

        try {

            const reg = await Favorite_servicesModel().findByPk(id);
            if( !reg ){
                return res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id}`
                });
            }

            await reg.update( body, {
                where: {
                    id
                }
            } );

            res.json(reg);
        
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }

    }

    async delete(req: any, res: Response, next: any) {
        var user:any = req.userTokenInfo.user
        const { id } = req.query;
        console.log(user)
        try {

            const reg= await Favorite_servicesModel().findOne({
                where: {
                    [Op.and]: [{
                        serviceUserId: id,
                    },{
                        userId: user.id
                    }]
                }
            });
            if( !reg ){
                return res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id}`
                });
            }

            await reg.destroy();

            res.json({
                message: `El registro con el ID ${id} ha sido eliminado`
            })

        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    static validatorFavorite(body: any) {
        try {
            return Favorite_servicesModel().findOne({where: {
                userId: body.userId,
                serviceUserId: body.serviceUserId
            }})
        } catch (error) {
            throw new Error(`Unable to connect to the database.`)
        }
    }

    async serviceFavorite(req: any, res: Response, next: any) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            var err:any = errors.array()
            return res.status(400).json({
                message: err[1].msg
            });
        }
        var user:any = req.userTokenInfo;
        const { body } = req;
        try {

            const resultFavoriteService:any = await Favorite_servicesModel().findOne({
                where: {
                    serviceUserId: body.serviceUserId,
                    userId: user.user.id
                }
            });
            
            if (resultFavoriteService == null) {
                return res.status(200).json({
                    service: false
                })
            }

            res.status(200).json({service: true})
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }
}

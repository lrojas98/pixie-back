import { Request, Response } from "express";
import { validationResult } from "express-validator";
import moment from "moment-timezone";
import { DATE, Op,Sequelize } from "sequelize";
import { Common } from "../helper/common";
import CategoriesModel from "../models/categories";
import CitiesModel from "../models/cities";
import CountriesModel from "../models/countries";
import ServicesModel from "../models/services";
import Services_userModel from "../models/services_user";
import Service_categoriesModel from "../models/service_categories";
import Service_imageModel from "../models/service_images";
import State_servicesModel from "../models/state_services";
import UsersModel from "../models/users";
import User_imagesModel from "../models/user_images";

export class Controller {

    async getAll(req: Request, res: Response, next: any) {
        try {
            let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
            let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
            let offset = (page - 1) * limit;

            const resultsServicesUsers = await Services_userModel().findAndCountAll({
                offset,
                limit,
                include:[{
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
                }],
            });

            let data = {
                results: resultsServicesUsers.rows,
                meta: {
                    total: resultsServicesUsers.count,
                    page
                }
            }

            res.status(200).json({...data});
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
            const reg = await Services_userModel().findOne({
                where:{id: id},
                include:[{
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
                }],
            });

            if(!reg){
                res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id}`
                })
            }
            
            res.json(reg);

        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async add(req: any, res: Response, next: any) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            var err:any = errors.array()
            return res.status(422).json({
                message: err[1].msg
            });
        }
        
        var user:any = req.userTokenInfo;
        const { body } = req;

        try {

            let value = 0
            let reference:any  = await Services_userModel().findOne({
                limit: 1,
                order:  [
                ['reference_payment', 'DESC'],
                ]
            })
            if (reference == null){
                value  = 1
            } else {
                value = reference.reference_payment + 1
            }
            
            body.userId = user.user.id

            var categoryId = body.categoriesId

            if(body.dateService != null){

                let datetime = new Date();

                let dateNow = moment(datetime)
                .tz("America/Bogota")
                .format("YYYY-MM-DD HH:mm:ss");

            
                if (body.dateService < dateNow) {
                 return res.status(400).json({message: 'La fecha y hora no puede ser menor a la actual'})
                }

                let Date2:any = moment(body.dateService)
                .tz("America/Bogota")
                .add(1,'hour')
                .format("YYYY-MM-DD HH:mm:ss");
            
                
                const validateService:any = await Services_userModel().findAll({
                    where: {
                        dateService: {
                            [Op.between]: [body.dateService, Date2]
                        }
                    }
                })

                if (validateService.length > 0){
                    return res.status(400).json({message: 'Ya cuentas con un servicio registrado para esta fecha y hora'})
                }
            }

            const servicesUser:any = await Services_userModel().create({
                userId: body.userId,
                stateServiceId: body.stateServiceId,
                services_id: body.services_id,
                value: body.value,
                status: 1,
                description: body.description,
                dateService: body.dateService,
                reference_payment: value
            });

            for (let i = 0; i < categoryId.length; i++) {
                await CategoriesModel().findOne({
                    where: {id: categoryId[i]}
                }).then(async function(services) {
                    if (!services) {
                        res.status(400).json({message: `No se encuentra el recurso solicitado con el id ${categoryId[i]}`})
                    }
                    await Service_categoriesModel().create({
                        serviceId: servicesUser.id,
                        categoryId: categoryId[i]
                    })
                }
            )}

            const data = await Controller.getService(servicesUser.id);
            
            res.status(200).json({servicesUser: data})

        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async update(req: any, res: Response, next: any) {
        var user:any = req.userTokenInfo;
        var id = req.query.id;
        const { body } = req;

        try {

            const reg = await Services_userModel().findOne({
                where: {
                    id: id,
                    userId: user.user.id
                }
            });
            if( !reg ){
                return res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id} para el usuario ${user.user.name}`
                });
            }

            await reg.update( body, {
                where: {
                    id: id,
                    userId: user.user.id
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

    async delete(req: Request, res: Response, next: any) {

        const { id } = req.params;

        try {

            const reg= await Services_userModel().findByPk(id);
            if( !reg ){
                return res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id}`
                });
            }

            // Eliminación fisica
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

    async getServicesUsers(req: any, res: Response, next: any) {
        var user:any = req.userTokenInfo;
        const { body } = req;
        let date = Date.now()
        let order:any = []
        try {

            let where  = {
            }

            const dataUser:any = await UsersModel().findOne({where: {
                id: user.user.id
            }})

            const expressService = await ServicesModel().findOne({
                where:{
                    id: body.service_id
                }
            })

            if ( user.user.rol == 'SALESMAN' ) {

                if ((expressService as any).name == 'CITA EXPRESS') {
                    where = {
                        [Op.and]: [{
                            userId: user.user.id,
                            services_id: body.service_id,
                            status: {
                                [Op.in]: [1,2]
                            },
                            dateService: {
                                [Op.gte]: date
                            }
                        }]
                    }
    
                    order = [
                        [Sequelize.literal('createdAt DESC')],
                    ]
                } else {
                    where = {
                        [Op.and]: [{
                            userId: user.user.id,
                            services_id: body.service_id,
                            status: {
                                [Op.in]: [1,2]
                            }
                        }]
                    }
    
                    order = [
                        [Sequelize.literal('createdAt DESC')],
                    ]
                }

            }

            if ( body.type != '' && user.user.rol == 'CUSTOMER' ) {

                if ((expressService as any).name == 'CITA EXPRESS') {
                    console.log(date)
                    where = {
                        [Op.and]:[
                            {services_id: body.service_id},
                            {status: 1},
                            {dateService: {
                                [Op.gte]: date
                            }}
                        ]
                    }
                    
                    order = [
                       [Sequelize.literal('RAND()')]
                    ]
                } else {
                    where = {
                        [Op.and]:[
                            {services_id: body.service_id},
                            {status: 1}
                        ]
                    }
                    
                    order = [
                       [Sequelize.literal('RAND()')]
                    ]
                }
           }

            const resultsServicesUsers:any = await Services_userModel().findAll({
                where,
                include:[{
                    association: Services_userModel().hasMany(Service_imageModel(), { sourceKey:'id', foreignKey: 'serviceId', as: 'user_images'}),
                },{
                    association:  Services_userModel().hasOne(UsersModel(), { sourceKey:'userId', foreignKey: 'id', as: 'user'}),
                    include: [{
                        model: CitiesModel()
                    },{
                        model: CountriesModel()
                    },{
                        association:  UsersModel().hasMany(User_imagesModel(), { sourceKey:'id', foreignKey: 'userId', as: 'user_images'}),
                    }],
                },{
                    model:  CategoriesModel(),
                    as: 'Categories'
                }],
                order
            });
            
            if (resultsServicesUsers == '') {
                return res.status(400).json({
                    message: `No hay usuarios prestadores de servicio, para tus intereses`
                })
            }

            let data = []

            for (const services of resultsServicesUsers){
                for  (const interest of services.user.interest.list){
                    if (dataUser.interest.list[0].id == interest.id  ){
                        data.push(services)
                    }
                }
            }

            res.status(200).json({ servicesUser: data});
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async addImage(req: any, res: Response, next: any) {
        var files: any = req.files;
        try {
            res.status(200).json({link: process.env.PATH_IMAGE + files.myImage[0].filename})
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async activeService(req: any, res: Response, next: any) {
        var user:any = req.userTokenInfo;
        const { body } = req;
        try { 

            const expressService = await ServicesModel().findOne({
                where:{
                    name: 'CITA EXPRESS'
                }
            })

            const services = await Services_userModel().findAll({
                where: {
                    userId: user.user.id,
                    services_id: (expressService as any).id,
                    status: {
                        [Op.not]: 3
                    }
                }
            })

            let status

            if(body.active){
                status = 1
            } else {
                status = 0
            }

            for(const service of (services as any)){
                service.dataValues.status = status

                await service.update( service, {
                    where: {
                        id: service.dataValues.id,
                        userId: user.user.id
                    }
                } );
            }

            res.status(200).json({data: services})
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    static async getService(serviceId: string) {
        try {
            return  await Services_userModel().findOne({
                where: {
                    id: serviceId
                },
                include:[{
                    association: Services_userModel().hasMany(Service_imageModel(), { sourceKey:'id', foreignKey: 'serviceId', as: 'user_images'}),
                },{
                    association:  Services_userModel().hasOne(UsersModel(), { sourceKey:'userId', foreignKey: 'id', as: 'user'}),
                    include: [{
                        model: CitiesModel()
                    },{
                        model: CountriesModel()
                    },{
                        association:  UsersModel().hasMany(User_imagesModel(), { sourceKey:'id', foreignKey: 'userId', as: 'user_images'}),
                    }]
                },{
                    model:  CategoriesModel(),
                    as: 'Categories'
                }]
            });
        } catch (error) {
            throw new Error(`Unable to connect to the database.`)
        }
    }

}

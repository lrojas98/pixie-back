import { Request, response, Response } from "express";
import { Common } from "../helper/common";
import { Op } from "sequelize";
import UsersModel from "../models/users";
import bcrypt from 'crypto';
import CitiesModel from "../models/cities";
import CountriesModel from "../models/countries";
import Services_userModel from "../models/services_user";
import RolesModel from "../models/roles";
import { validationResult } from "express-validator";

export class Controller {

    async getAll(req: Request, res: Response, next: any) {
        try {
            let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
            let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
            let offset = (page - 1) * limit;

            var statusParam = req.query.status

            let where  = {
                    [Op.or]:{}
                }

            if (statusParam != '') {
                where[Op.or] = {
                    [Op.or]: [{status: statusParam}]
                }
            } else {
                where[Op.or] = {
                    id:{
                        [Op.ne]: null
                    }
                } 
            }
            
            const resultUsers = await UsersModel().findAndCountAll({
                limit,
                offset
            });

            let data = {
                results: resultUsers.rows,
                meta: {
                    total: resultUsers.count,
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
            const reg = await UsersModel().findOne({
                where: {id: id}, 
                include: [{
                    model: CitiesModel(),
                },{
                    model: CountriesModel(),
                },{
                    model:  Services_userModel(),
                    as: 'servicesUser',
                },{
                    model:  RolesModel(),
                    as: 'Roles'
                }]
            });

            if(!reg){
                res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id}`
                })
            }
            
            res.status(200).json({results: reg});

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
        
        const { body } = req;

        try {
            var encrypt = bcrypt.createHmac('sha256',body.password).update('piuts').digest('base64');
            body.password = encrypt
            
            const validator = await Controller.validatorEmail(body.email);
            if (validator) {
                return res.status(400).json({ message: 'Email diligenciado ya existe'})
            }
                
                await UsersModel().create(body)

                return res.status(200).json({ message: 'Usuario registrado correctamente, por favor verifica tu email.'})

            
            
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async update(req: any, res: Response, next: any) {
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

            const reg = await UsersModel().findByPk(user.user.id);
            if( !reg ){
                return res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${user.user.id}`
                });
            }

            await reg.update( body, {
                where: { id: user.user.id }
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

            const reg= await UsersModel().findByPk(id);
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


    static validatorEmail(email: string) {
        try {
            return UsersModel().findOne({where: {
                email: email
            }})
        } catch (error) {
            throw new Error(`Unable to connect to the database.`)
        }
    }

}


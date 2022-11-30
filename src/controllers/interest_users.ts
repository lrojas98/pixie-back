import { Request, Response } from "express";
import { Common } from "../helper/common";
import InterestModel from "../models/interest";
import Interest_usersModel from "../models/interest_users";
import UsersModel from "../models/users";

export class Controller {

    async getAll(req: Request, res: Response, next: any) {
        try {
            let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
            let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
            let offset = (page - 1) * limit;
            
            const resultsInterestUsers = await Interest_usersModel().findAndCountAll({
                limit,
                offset,
                include:[{
                    model: InterestModel(),
                },{
                    association:  Interest_usersModel().hasOne(UsersModel(), { sourceKey:'users_id', foreignKey: 'id', as: 'User'}),
                    attributes: { exclude: ['pass'] },
                }]
            });

            let data = {
                results: resultsInterestUsers.rows,
                meta: {
                    total: resultsInterestUsers.count,
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
            const reg = await Interest_usersModel().findOne({
                where: {id: id}, 
                include:[{
                    model: InterestModel(),
                },{
                    association:  Interest_usersModel().hasOne(UsersModel(), { sourceKey:'users_id', foreignKey: 'id', as: 'User'}),
                    attributes: { exclude: ['pass'] },
                }]
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

    async add(req: Request, res: Response, next: any) {

        const { body } = req;

        try {
        
            const reg = await Interest_usersModel().create(body);
            res.json(reg);
        
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async update(req: Request, res: Response, next: any) {

        const { id } = req.params;
        const { body } = req;

        try {

            const reg = await Interest_usersModel().findByPk(id);
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

    async delete(req: Request, res: Response, next: any) {

        const { id } = req.params;

        try {

            const reg= await Interest_usersModel().findByPk(id);
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
}

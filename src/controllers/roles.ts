import { Request, Response } from "express";
import { Op } from "sequelize";
import { Common } from "../helper/common";
import RolesModel from "../models/roles";

export class Controller {

    async getAll(req: Request, res: Response, next: any) {
        try {
            const results = await RolesModel().findAll({where: {
                name: {
                    [Op.not]: "SUPERADMIN"
                },
                status: 1
            }});
            res.status(200).json({roles: results});
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async getAllAdmin(req: Request, res: Response, next: any) {
        try {
            const results = await RolesModel().findAll();

            return res.status(200).json({roles: results});
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
            const reg = await RolesModel().findByPk(id);

            if(!reg){
                return res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id}`
                })
            }
            
            return res.status(200).json({roles: reg});

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
        
            const reg = await RolesModel().create(body);

            return res.status(200).json({roles: reg});
        
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

            const reg = await RolesModel().findByPk(id);
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

            return res.status(200).json({roles: reg});
        
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

            const reg= await RolesModel().findByPk(id);
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

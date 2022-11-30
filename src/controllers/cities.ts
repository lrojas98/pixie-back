import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Op,Sequelize } from "sequelize";
import { Common } from "../helper/common";
import CitiesModel from "../models/cities";
import CountriesModel from "../models/countries";

export class Controller {

    async getAll(req: Request, res: Response, next: any) {
        try {
            const results = await CitiesModel().findAll();
            res.status(200).json({cities: results});
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async getAllByCountry(req: Request, res: Response, next: any) {
        try {

            let where  = {
                [Op.or]:{}
            }

            if (req.query.id)

            where[Op.or] = {
                [Op.or]: [{countriesId: req.query.id }]
            }
            
            const results = await CitiesModel().findAll({
                where
            });
            res.status(200).json({cities: results});
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
            const reg = await CitiesModel().findByPk(id);

            if(!reg){
                res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id}`
                })
            }
            
            res.status(200).json({cities: reg});

        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async add(req: Request, res: Response, next: any) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
        }
        const { body } = req;

        try {

            if(body.code.length > 5) {
                return res.status(400).json({message: 'El codigo no puede ser mayor a digitos'})
            }

            const code:any = await Controller.validatorCode(body.code);

            if (code) {
                return res.status(400).json({ message: 'El codigo de ciudad ya se encuentra registrado'})
            }

            const country:any = await Controller.validatorCountry(body.countriesId);

            if (!country) {
                return res.status(400).json({ message: 'El pais enviado no existe'})
            }
        
            const reg:any = await CitiesModel().create(body)

            return res.status(200).json({cities: reg});
        
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

            const reg = await CitiesModel().findByPk(id);
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

            res.status(200).json({cities: reg});
        
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

            const reg= await CitiesModel().findByPk(id);
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

    static validatorCode(code: string) {
        try {
            return CitiesModel().findOne({where: {
                code: code,
            }})
        } catch (error) {
            throw new Error(`Unable to connect to the database.`)
        }
    }

    static validatorCountry(id: string) {
        try {
            return CountriesModel().findOne({where: {
                id: id,
            }})
        } catch (error) {
            throw new Error(`Unable to connect to the database.`)
        }
    }
}

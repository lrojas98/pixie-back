import { Request, Response } from "express";
import { Common } from "../helper/common";
import ServicesModel from "../models/services";
import user_services_salesmanModel from "../models/user_services_salesman";
import User_services_salesmanModel from "../models/user_services_salesman";

export class Controller {

    async getAll(req: Request, res: Response, next: any) {
        try {
            let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
            let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
            let offset = (page - 1) * limit;

            const resultsServicesSalesman = await User_services_salesmanModel().findAndCountAll({
                limit,
                offset
            });
            
            let data = {
                results: resultsServicesSalesman.rows,
                meta: {
                    total: resultsServicesSalesman.count,
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

    async add(req: any, res: Response, next: any) {
        var user:any = req.userTokenInfo;
        const { body } = req;

        try {
            body.userId = user.user.id

            var serviceId = body.serviceId
            
            console.log(serviceId)

            for (let i = 0; i < serviceId.length; i++) {
                
                await ServicesModel().findOne({
                    where: {id: serviceId[i]}
                }).then(async function(services) {
                    if (!services) {
                        return res.status(400).json({message: `No se encuentra el recurso solicitado con el id ${serviceId[i]}`})
                    }

                    await user_services_salesmanModel().findOrCreate({
                        where: { 
                            servicesId: serviceId[i],
                            userId: body.userId
                        },
                        defaults: {
                            userId: body.userId,
                            servicesId: serviceId[i]
                        }
                    });
                 });
            }

            res.status(200).json({message: 'Servicios de usuario registrados correctamente'})
        
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

            const reg = await User_services_salesmanModel().findByPk(id);
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

    async getServicesByUser(req:any, res: Response, next: any) {
        var user:any = req.userTokenInfo;
        try {

            if (user.user.rol == 'SALESMAN') {
                var [results, metadata]: any = await ServicesModel().sequelize?.
                query(`select s.* from user_services_salesmans uss 
                            inner join services s on uss.servicesId = s.id 
                        where userId=:user`,{
                    replacements: {user: user.user.id}
                } )
    
                res.status(200).json({Services: results});
            }

            if (user.user.rol == 'CUSTOMER') {
                var results:any = await ServicesModel().findAll()
    
                res.status(200).json({Services: results});
            }
            
            res.status(400).json({message: 'Rol de usuario no es correspondiente para esta consulta'});

        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

}

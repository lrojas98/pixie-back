import { Request, Response } from "express";
import UsersModel from "../models/users";

export class Controller {

    async getNearbyUsers(req: Request, res: Response, next:any){

        const {body} = req;

        try {
            
            var [results, metadata]: any = await UsersModel().sequelize?.query(`select ST_Distance_Sphere(
                point(body.longitude, body.latitude),
                point(longitude, latitude)),* from users 
            where ST_Distance_Sphere(point(:longitude, :latitude),point(longitude, latitude)) <= 2000`,{
                replacements: {longitude: body.longitude, latitude: body.latitude}
            } )

            if(results!='') {
                res.status(200).json({
                    user: results,
                    message: `Proceso Satisfactorio`,
                })     
            } else {
                res.status(400).json({
                    user: results,
                    message: `No hay usuarios disponibles en tu direccion`,
                })  
            }

        } catch (error) {
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }
}

import { Request, Response } from "express";
import { Common } from "../helper/common";
import User_imagesModel from "../models/user_images";

export class Controller {

    async getAll(req: Request, res: Response, next: any) {
        try {
            let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
            let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
            let offset = (page - 1) * limit;

            const resultsImages = await User_imagesModel().findAndCountAll({
                limit,
                offset
            });
            
            let data = {
                results: resultsImages.rows,
                meta: {
                    total: resultsImages.count,
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
            const reg = await User_imagesModel().findByPk(id);

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
        var user:any = req.userTokenInfo;
        const { body } = req;

        try {

            body.userId = user.user.id
            var urlImages = body.images

            for (let i = 0; i < urlImages.length; i++) {
                body.url = urlImages[i]
                body.valid = 1

                await User_imagesModel().create(body).
                catch(function(error) {
                    res.status(400).json({ message:error})
                })
            }

            const userImage = await User_imagesModel().findAll({
                where: {
                    userId: user.user.id
                }
            })

            res.status(200).json({User_imagesModel: userImage})
        
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

            const reg = await User_imagesModel().findByPk(id);
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

        const { body } = req;

        try {

            var imagesId = body.images

            for (let i = 0; i < imagesId.length; i++) {

                const reg =  await User_imagesModel().findByPk(imagesId[i])
                if( !reg ){
                    return res.status(404).json({
                        message: `No se encuentra el recurso solicitado con el id ${imagesId[i]}`
                    });
                }

                await reg.destroy();
            }
            res.json({
                message: `Los registros se han eliminado satisfactoriamente`
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

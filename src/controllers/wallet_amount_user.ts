import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Common } from "../helper/common";
import UsersModel from "../models/users";
import Wallet_amount_userModel from "../models/wallet_amount_user";
import Wallet_user_transactionsModel from "../models/wallet_user_transactions";

export class Controller {

    async getAll(req: any, res: Response, next: any) {
        var token:any = req.userTokenInfo.user;
        try {
            const results = await Wallet_amount_userModel().findAll({
                where: {
                    userId: token.id
                },
                include:[{
                    model: Wallet_user_transactionsModel()
                }]
            });
            res.status(200).json({wallet: results});
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async getAllAdmin(req: any, res: Response, next: any) {
        try {
            const results = await Wallet_amount_userModel().findAll({
                include:[{
                    model: UsersModel()
                },{
                    model: Wallet_user_transactionsModel()
                }]
            });
            res.status(200).json({wallet: results});
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
            const reg = await Wallet_amount_userModel().findOne({
                where:{
                    id: id,
                },
                include:[{
                    model: UsersModel()
                },{
                    model: Wallet_user_transactionsModel()
                }]
            });

            if(!reg){
                res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id}`
                })
            }
            
            res.status(200).json({wallet: reg});

        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async add(req: any, res: Response, next: any) {
        var token:any = req.userTokenInfo.user;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array(),
            });
        }

        const { body } = req;

        try {

            const user = await Controller.validatorWalletUser(token.id);
            if (user) {
                return res.status(400).json({ message: 'El usuario ya cuenta con su billetera'})
            }

            body.userId = token.id
            const reg = await Wallet_amount_userModel().create(body);

            res.status(200).json({wallet: reg});
        
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

            const reg = await Wallet_amount_userModel().findByPk(id);
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

            res.status(200).json({wallet: reg});
        
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

            const reg= await Wallet_amount_userModel().findByPk(id);
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

    static validatorWalletUser(userId: string) {
        try {
            return Wallet_amount_userModel().findOne({where: {
                userId: userId,
            }})
        } catch (error) {
            throw new Error(`Unable to connect to the database.`)
        }
    }
}

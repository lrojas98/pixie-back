import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Common } from "../helper/common";
import ServicesModel from "../models/services";
import Services_userModel from "../models/services_user";
import UsersModel from "../models/users";
import Wallet_amount_userModel from "../models/wallet_amount_user";
import Wallet_user_transactionsModel from "../models/wallet_user_transactions";

export class Controller {

    async getAll(req: any, res: Response, next: any) {
        try {
            let type: string = req.query.type ? (req.query.type as string) : 'PENDING';
            const results = await Wallet_user_transactionsModel().findAll({
                where: {
                    status: type
                },
                include: [{
                    attributes: {exclude: ['password','coordinates','createdAt','updatedAt',
                    'cityId','countryId','tokenGoogle','tokenFacebook','validatedAt','interest','latitude','longitude']},
                    model: UsersModel()
                },{
                    model: Services_userModel(),
                    include: [{
                        model: ServicesModel()
                    }]
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
            const reg = await Wallet_user_transactionsModel().findOne({
                where: {
                    id: id
                },
                include: [{
                    attributes: {exclude: ['password','coordinates','createdAt','updatedAt',
                    'cityId','countryId','tokenGoogle','tokenFacebook','validatedAt','interest','latitude','longitude']},
                    model: UsersModel()
                },{
                    model: Services_userModel(),
                    include: [{
                        model: ServicesModel()
                    }]
                }]
            });

            if(!reg){
                return res.status(404).json({
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

    async getUser(req: Request, res: Response, next: any) {
        try {

            const { userId } = req.params;

            const reg = await Wallet_user_transactionsModel().findAll({
                where:{
                    userId: userId,
                },
                include: [{
                    attributes: {exclude: ['password','coordinates','createdAt','updatedAt',
                    'cityId','countryId','tokenGoogle','tokenFacebook','validatedAt','interest','latitude','longitude']},
                    model: UsersModel()
                },{
                    model: Services_userModel(),
                    include: [{
                        model: ServicesModel()
                    }]
                }]
            });

            if(!reg){
                return res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${userId}`
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

            const wallet = await Controller.validatorWalletUser(token.id);
            if (!wallet) {
                return res.status(400).json({ message: 'El usuario no cuenta con una billetera, por favor registrar'})
            }

            if ((wallet as any).balance < body.amount) {
                return res.status(400).json({message: `el saldo a solicitar es mayor a tu balance total ${(wallet as any).balance }`})
            }

            let remaining = ((wallet as any).balance) - body.amount

            await wallet.update( {balance:remaining }, {
                where: {
                    id: (wallet as any).id
                }
            } );

            body.amount = (body.amount)*-1
            body.userId = token.id
            body.status = 'PENDING'

            const reg = await Wallet_user_transactionsModel().create(body);

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
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array(),
            });
        }
        const { id } = req.params;
        const { body } = req;

        try {

            const reg = await Wallet_user_transactionsModel().findByPk(id);
            if( !reg ){
                return res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id}`
                });
            }

            if((reg as any).status != 'PENDING'){
                return res.status(400).json({message: 'Esta solicitud ya fue resuelta'})
            }

            if (body.status == 'APPROVED') {
                await reg.update( {status: body.status, description: body.description }, {
                    where: {
                        id
                    }
                } );
            }

            if (body.status == 'REJECTED') {
                await reg.update( {status: body.status, description: body.description }, {
                    where: {
                        id
                    }
                } );

                const wallet = await Wallet_amount_userModel().findOne({
                    where:{
                        userId: (reg as any).userId
                    }
                })

                let remaining = ((wallet as any).balance) + ((reg as any).amount * -1 )
                console.log(remaining)

                await Wallet_amount_userModel().update( {balance:remaining }, {
                    where: {
                        id: (wallet as any).id
                    }
                } );

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

    async delete(req: Request, res: Response, next: any) {

        const { id } = req.params;

        try {

            const reg= await Wallet_user_transactionsModel().findByPk(id);
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

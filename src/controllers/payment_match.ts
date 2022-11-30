import { Request, Response } from "express";
import { Common } from "../helper/common";
import Credit_cardsModel from "../models/credit_cards";
import Services_userModel from "../models/services_user";
import UsersModel from "../models/users";
import request from "request";
import TransactionsModel from "../models/transactions";
import MatchsModel from "../models/matchs";
import Payment_matchModel from "../models/payment_match";
import User_notificationModel from "../models/user_notification";
import Users_talksModel from "../models/users_talks";
import Payment_settingsModel from "../models/payment_settings";
import Wallet_user_transactionsModel from "../models/wallet_user_transactions";
import Wallet_amount_userModel from "../models/wallet_amount_user";
const urlPath = "https://webpay3gint.transbank.cl/rswebpaytransaction/api/oneclick/v1.2/transactions"
export class Controller {

    async getAll(req: any, res: Response, next: any) {
        var token:any = req.userTokenInfo.user
        try {
            let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
            let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
            let offset = (page - 1) * limit;

            const resultsModel = await Payment_matchModel().findAndCountAll({
                where: {
                    receiverId: token.id
                },
                offset,
                limit,
                include:[{
                    model: UsersModel(),
                },{
                    model: MatchsModel(),
                }],
            });
            let data = {
                results: resultsModel.rows,
                meta: {
                    total: resultsModel.count,
                    page
                }
            }

            return res.status(200).json({...data});
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
            const reg = await Payment_matchModel().findOne({
                where: {id: id}, 
                include:[{
                    model: UsersModel(),
                },{
                    model: MatchsModel(),
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

    async add(req:any, res: Response, next: any) {
        var token:any = req.userTokenInfo.user

        const { body } = req;
        body.userId =  token.id

        try { 

            const matchValidator:any = await Payment_matchModel().findOne({
                where: {
                    matchId: body.matchId
                }
            })

            if (matchValidator != null){
                return res.status(200).json({message: 'Este servicio ya se encuentra pagado'})
            }

            const settings:any = await Payment_settingsModel().findOne({
                where: {
                    status: true
                }
            })

            const cards:any = await Credit_cardsModel().findOne({
                where: {
                    id: body.cardId
                }
            })

            const user:any = await UsersModel().findOne({
                where: {
                    id: token.id
                }
            })

            const match:any = await MatchsModel().findOne({
                where:{
                    id: body.matchId
                },
                include:[{
                    model: UsersModel(),
                    as: 'User',
                },{
                    model: Services_userModel(),
                    as: 'ServiceMatch',
                }],
            });


            const service:any = await Services_userModel().findOne({
                where: {
                    id: body.serviceId
                },
                include:[{
                    association:  Services_userModel().hasOne(UsersModel(), { sourceKey:'userId', foreignKey: 'id', as: 'User'}),
                    attributes: { exclude: ['pass'] },
                }]
            })

            let options: any;  

            //  Options object for consumption TBK
            options = {
                url: urlPath,
                // @Tbk-Api-Key-Id: Trade Code
                // @Tbk-Api-Key-Secret: Trade Secret Key
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                    "Tbk-Api-Key-Id": settings.TBK_API_KEY,
                    "Tbk-Api-Key-Secret": settings.TBK_API_KEY_SECRET
                },
                json: true,
                //Request Object 
                // @buy_order: payment identifier  {String}
                // @session_id: tbk session key  {String}
                // @amount: total payment  {Decimal}
                // @return_url: return url when making the transaction  {String}
                body: {
                    username:user.name,
                    tbk_user:cards.token,
                    buy_order: service.reference_payment,
                    details:[{
                        commerce_code: "597055555542",
                        buy_order: service.reference_payment,
                        amount: body.amount,
                        installments_number: body.installments
                    }]
                },
            };

            
            request.post(options, async (error: any, response: any) => {
                if (error) {
                    return error.toString()
                }
                
                var data = response.body
                    
                //Object body for create Transaction
                body.userId = token.id
                body.payInfo = data
                body.status = data.details[0].status
                body.total = data.details[0].amount
                body.paymentAt = data.transaction_date
                body.reference_services = service.reference_payment
                body.token = cards.token
                body.key = data.details[0].payment_type_code
                body.paymentTypeId = cards.paymentTypeId

                const transaction:any = await TransactionsModel().create(body)

                if( transaction != null && data.details[0].status == 'AUTHORIZED')  {

                    body.receiverId = service.userId
                    body.amount = data.details[0].amount
                    body.transactionId = transaction.id
                    body.matchId = match.id

                    let price = data.details[0].amount;
                    let discount = settings.commission

                    var amount = price - (price * parseFloat(discount)/100);

                    let createTransactionWallet = {
                        userId: service.userId,
                        amount: amount,
                        serviceId: service.id,
                        status: 'CONFIRMED',
                        description: 'NUEVO PAGO DE SERVICIO'
                    }

                    await Wallet_user_transactionsModel().create(createTransactionWallet)
                    .then( async function(wallet) {

                        const walletBalance:any = await Wallet_amount_userModel().findOne({
                            where: {
                                userId: (wallet as any).userId
                            }
                        })

                        let balance = walletBalance.balance + amount

                        await walletBalance.update({balance: balance} , {
                            where: {
                                id: walletBalance.id
                            }
                        } );

                    }).catch(function(error) {
                        res.status(400).json({ message:error})
                    })

                    await Payment_matchModel().create(body).then( async function(dataPayment){

                        let tokenfcm = service.User.token_fcm
                        let name = service.User.name
                        let receiverId = service.User.id
                        let options: any;

                        options = {
                            url: urlPath,
                            headers: {
                                accept: "application/json",
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${process.env.FB_API_KEY}`,
                            },
                            json: true,
                            body: {
                                to: tokenfcm,
                                notification:{
                                    title: `Hola ${name}, tu match a sido pagado`,
                                    body: 'Revisa tus match'
                                },
                                priority: "high",
                                data:{
                                    event: "new_match_status_0 ",
                                    title: `Hola ${name}, tu match a sido pagado`,
                                    description: "Revisa tus match"
                                }
                            },
                        };

                        request.post(options, async (error: any, response: any) => {
                            if (error) {
                                return error
                            }
                            
                            const bodyNotification = {
                                key: 'APPOINTMENT_PAID',  
                                tittle: options.body.notification.title,
                                body: options.body.notification.body,
                                userId: user.id,
                                receiverId: receiverId,
                                status: 0,
                                tokenfcm: tokenfcm,
                                matchId: body.matchId
                            }
        
                            await User_notificationModel().create(bodyNotification).then(async function() {

                                const bodyTalksModel = {
                                    userId: token.id,
                                    userServiceId: receiverId,
                                    paymentMatchId: ( dataPayment as any).id,
                                    status: 1
                                }

                                await Users_talksModel().create(bodyTalksModel).then(async function() {
                                    return res.status(200).json({ 
                                        match:dataPayment, 
                                    });
                                })
                            }).catch(function(error) {
                                return res.status(400).json({ message:error})
                            })
                        })
                    }).catch(function(error) {
                       return res.status(400).json({ message:error})
                    })
                }
            });
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

            const reg = await Payment_matchModel().findByPk(id);
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

            const reg= await Payment_matchModel().findByPk(id);
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

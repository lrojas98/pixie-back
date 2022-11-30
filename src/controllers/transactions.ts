import { Request, Response } from "express";
import { Common } from "../helper/common";
import Payment_typesModel from "../models/payment_types";
import ServicesModel from "../models/services";
import Services_userModel from "../models/services_user";
import TransactionsModel from "../models/transactions";
import UsersModel from "../models/users";
import request from "request";
import Credit_cardsModel from "../models/credit_cards";

const urlPath = "https://webpay3gint.transbank.cl/rswebpaytransaction/api/oneclick/v1.2/transactions"
const urlInscription = "https://webpay3gint.transbank.cl/rswebpaytransaction/api/oneclick/v1.2/inscriptions"

export class Controller {

    async getAll(req: Request, res: Response, next: any) {
        try {
            let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
            let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
            let offset = (page - 1) * limit;

            const resultsTransactions = await TransactionsModel().findAndCountAll({
                limit,
                offset,
                include:[{
                    attributes: { exclude: ['userID', 'stateServiceId'] },
                    model: Services_userModel(),
                    include:[{
                        model: ServicesModel(),
                    }],
                },{
                    model: Payment_typesModel(),
                },{
                    association:  TransactionsModel().hasOne(UsersModel(), { sourceKey:'userId', foreignKey: 'id', as: 'User'}),
                    attributes: { exclude: ['pass'] },
                }],
            });
            
            let data = {
                results: resultsTransactions.rows,
                meta: {
                    total: resultsTransactions.count,
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
            const reg = await TransactionsModel().findOne({
                where: {id: id}, 
                include:[{
                    attributes: { exclude: ['userID', 'stateServiceId'] },
                    model: Services_userModel(),
                    include:[{
                        model: ServicesModel(),
                    }],
                },{
                    model: Payment_typesModel(),
                },{
                    association:  TransactionsModel().hasOne(UsersModel(), { sourceKey:'userId', foreignKey: 'id', as: 'User'}),
                    attributes: { exclude: ['pass'] },
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

    async add(req: any, res: Response, next: any) {
        var token:any = req.userTokenInfo;
        let options: any;
        const { body } = req;

        try {
        
            const service:any = await Services_userModel().findOne({
                where: {
                    id: body.serviceId
                }
            })

            const cards:any = await Credit_cardsModel().findOne({
                where: {
                    users_id: token.user.id
                }
            })

            const user:any = await UsersModel().findOne({
                where: {
                    id: token.user.id
                }
            })
            //  Options object for consumption TBK
            options = {
                url: urlPath,
                // @Tbk-Api-Key-Id: Trade Code
                // @Tbk-Api-Key-Secret: Trade Secret Key
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                    "Tbk-Api-Key-Id": process.env.TBK_API_KEY_ID,
                    "Tbk-Api-Key-Secret": process.env.TBK_API_KEY_SECRET
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
                        buy_order: 'orden12423',
                        amount: body.amount,
                        installments_number: 5
                    }]
                },
            };

            // Response TBK
            // @error: err
            // @response: {
            //      @token: token registered by TBK  {String}
            //      @url: consumption url with the token  {String}
            //  }
            request.post(options, async (error: any, response: any) => {
                if (error) {
                    res.json({ error: error.toString() });
                }

                
                var data = response.body
                    
                //Object body for create Transaction
                body.userId = token.user.id
                body.payInfo = data
                body.status = data.details[0].status
                body.total = data.details[0].amount
                body.paymentAt = data.transaction_date
                body.reference_services = service.reference_payment
                body.token = cards.token
                    
                await TransactionsModel().create(body).then(async function(responseTransaction) {
                    res.status(200).json({ 
                        post:response.body, 
                        transaction: responseTransaction,
                    });
                }).catch(function(error) {
                    res.status(400).json({ message:error})
                })
            });
        } catch (error: any) {
            res.json({ message: error.toString(), data: options });
        }
    }

    async update(req: Request, res: Response, next: any) {

        const { token } = req.params;
        try {
            console.log(token)
            let options
             //  Options object for consumption TBK
             options = {
                url: `${urlPath}${token}`,
                // @Tbk-Api-Key-Id: Trade Code
                // @Tbk-Api-Key-Secret: Trade Secret Key
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                    "Tbk-Api-Key-Id": process.env.TBK_API_KEY_ID,
                    "Tbk-Api-Key-Secret": process.env.TBK_API_KEY_SECRET
                },
            };

            var data
            var dataResponse:any

            // Response TBK
                // @error: err
                /* @response: {
                        @vci: Authentication result  {String}
                        @amount: Transaction amount  {Decimal}
                        @status: Transaction status  {String}
                        @buy_order: Store Purchase Order  {String}
                        @session_id: Session identifier  {String}
                        @card_detail: Credit card details  {Object}
                        @card_detail.card_number: last 4 card numbers  {String}
                        @accounting_date: Authorization date  {String}
                        @transaction_date: Authorization date and time  {String}
                        @authorization_code: Transaction authorization code  {String}
                        @payment_type_code: Transaction payment type  {String}
                        @response_code: Authorization response code  {String}
                        @installments_amount: Amount of installments  {String}
                        @installments_number: Amount of fees  {String}
                    }
                */
            await request.put(options, async (error: any, response: any) => {
                if (error) {
                    return error
                }

                data = response.body
                dataResponse = JSON.parse(data)

                res.status(200).json({ 
                    put:dataResponse,
                });
            });

            /*
            const reg = await TransactionsModel().findByPk(id);
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
            */
        
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

            const reg= await TransactionsModel().findByPk(id);
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

    async inscriptionUser(req: any, res: Response, next: any) {
        var token:any = req.userTokenInfo;
        let options: any;

        try {
        
            const user:any = await UsersModel().findOne({
                where: {
                    id: token.user.id
                }
            })

            //  Options object for consumption TBK
            options = {
                url: urlInscription,
                // @Tbk-Api-Key-Id: Trade Code
                // @Tbk-Api-Key-Secret: Trade Secret Key
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                    "Tbk-Api-Key-Id": process.env.TBK_API_KEY_ID,
                    "Tbk-Api-Key-Secret": process.env.TBK_API_KEY_SECRET
                },
                json: true,
                //Request Object 
                // @username: user name by token {String}
                // @email: email by user token  {String}
                // @return_url: return url when making the transaction  {String}
                body: {
                    username: user.name,
                    email: user.email,
                    response_url: `${process.env.URL_RETURN}`
                },
            };

            // Response TBK
            // @error: err
            // @response: {
            //      @token: Token unique registered by inscription TBK  {String}
            //      @url: One click URL to start the registration.  {String}
            //  }
            request.post(options, async (error: any, response: any) => {
                if (error) {
                    res.json({ error: error.toString() });
                }


                response.body.url_return = 'https://apidev.tools.antpack.co/piuts'

                res.status(200).json({data: response.body})
            });
        } catch (error: any) {
            res.json({ message: error.toString(), data: options });
        }
    }

    async confirmInscriptionUser(req: any, res: Response, next: any) {
        var token:any = req.userTokenInfo;
        let options: any;
        const { body } = req;
        try {
            //  Options object for consumption TBK
            options = {
                url: `${urlInscription}/${body.token}`,
                // @Tbk-Api-Key-Id: Trade Code
                // @Tbk-Api-Key-Secret: Trade Secret Key
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                    "Tbk-Api-Key-Id": process.env.TBK_API_KEY_ID,
                    "Tbk-Api-Key-Secret": process.env.TBK_API_KEY_SECRET
                },
            };

            // Response confirm inscription TBK
            // @error: err
            // @response: {
            //      @response_code: Authorization response code TBK  {Number}
            //      @tbk_user: Token user TBK  {String}
            //      @authorization_code: Code that identifies the registration authorization. {String}
            //      @card_type: Indicates the type of card registered by the customer {cardType}
            //      @card_number: Last 4 digits of the card {String}
            //  }
            request.put(options, async (error: any, response: any) => {
                if (error) {
                    res.json({ error: error.toString() });
                }

                var data = response.body
                var tbk_response = JSON.parse(data)

                if (tbk_response.response_code == 0) {
                    
                    var bodyCards = {
                        users_id: token.user.id,
                        token: tbk_response.tbk_user,
                        status: tbk_response.response_code,
                        card_type: tbk_response.card_type,
                        card_number: tbk_response.card_number,
                        paymentTypeId: 'f7b42d4d-bbaf-4ebb-9870-77fcbde937ac'
                    }

                    const cardUser = await Controller.validatorCards(tbk_response.card_number,token.user.id);
                    if (cardUser) {
                        return res.status(400).json({ message: 'Este numero de tarjeta ya se encuentra registrado'})
                    } else {
                        await Credit_cardsModel().create(bodyCards).then(async function(responseCreditCards) {
                            res.status(200).json({
                                credit_cards: responseCreditCards,
                            });
                        }).catch(function(error) {
                            res.status(400).json({ message:error})
                        })
                    }
                }else {
                    return res.status(400).json({message: tbk_response})
                }
            });
        } catch (error: any) {
            res.json({ message: error.toString(), data: options })
        }
    }

    static validatorCards(card: string, user:string) {
        try {
            return Credit_cardsModel().findOne({where: {
                users_id: user,
                card_number:card
            }})
        } catch (error) {
            throw new Error(`Unable to connect to the database.`)
        }
    }
}

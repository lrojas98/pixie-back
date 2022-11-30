import { Request, Response } from "express";
import { Common } from "../helper/common";
import Credit_cardsModel from "../models/credit_cards";
import OffersModel from "../models/offers";
import ServicesModel from "../models/services";
import Services_userModel from "../models/services_user";
import UsersModel from "../models/users";
import request from "request";
import TransactionsModel from "../models/transactions";
const urlPath = "https://webpay3gint.transbank.cl/rswebpaytransaction/api/oneclick/v1.2/transactions"
export class Controller {

    async getAll(req: Request, res: Response, next: any) {
        try {
            let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
            let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
            let offset = (page - 1) * limit;

            const resultsOffers = await OffersModel().findAndCountAll({
                offset,
                limit,
                include:[{
                    model: UsersModel(),
                },{
                    model: Services_userModel(),
                    include: [{
                        model: ServicesModel()
                    }]
                }],
            });
            let data = {
                results: resultsOffers.rows,
                meta: {
                    total: resultsOffers.count,
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
            const reg = await OffersModel().findOne({
                where: {id: id}, 
                include:[{
                    model: UsersModel(),
                },{
                    model: Services_userModel(),
                    include: [{
                        model: ServicesModel()
                    }]
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

            const offers:any = await  OffersModel().findOne({
                where: {
                    serviceId: body.serviceId
                },
                order: [
                    ['value', 'DESC'],
                ],
                limit: 1
            })

            let value = 0
            
            if (offers != null) {
                value = offers.value
            }

            if (body.amount <= value) {
                return res.status(400).json({message: `El valor enviado no puede ser menor a la ultima puja ${offers.value}`})
            }
            
            let options: any;        
            const service:any = await Services_userModel().findOne({
                where: {
                    id: body.serviceId
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

            if (body.amount <= service.value ) {
                return res.status(400).json({message: `El valor enviado no puede ser menor al servicio ${service.value}`})
            }

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
                    return error.toString()
                }

                console.log(response.body)
                
                var data = response.body
                    
                //Object body for create Transaction
                body.userId = token.id
                body.payInfo = data
                body.status = data.details[0].status
                body.total = data.details[0].amount
                body.paymentAt = data.transaction_date
                body.reference_services = service.reference_payment
                body.token = cards.token
                body.paymentTypeId = cards.paymentTypeId
                body.key = data.details[0].payment_type_code

                const transaction:any = await TransactionsModel().create(body)

                if( transaction != null) {

                    body.value = data.details[0].amount
                    const reg:any = await OffersModel().create(body);

                    return res.status(200).json({ 
                        offers: reg,
                    });
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

            const reg = await OffersModel().findByPk(id);
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

            const reg= await OffersModel().findByPk(id);
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

   async getOffersByUser(req: any, res: Response, next: any) {
    const { body } = req;
    
    try {

        const resultMatchUsers:any = await OffersModel().findAll({
            where:{
                serviceId: body.service_id,
                status: 0
            },
            include:[{
                attributes: {exclude: ['id','password','age','email','mobilePhone','coordinates','cityId',
            'countryId','tokenGoogle','tokenFacebook','status','validatedAt','description','createdAt',
            'updatedAt','latitude','longitude','interest']},
                model: UsersModel(),
            }],
            order: [
                ['value', 'DESC'],
            ],
        });

        if (resultMatchUsers == '') {
            res.status(400).json({
                message: `No hay usuarios interesados en tus servicios `
            })
        }
        res.status(200).json({ offerUsers: resultMatchUsers});
    } catch (error) {
        new Common().showLogMessage('Error controlado', error, 'error');
        next({
            message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
            error
        });
    }       
   }
   static offersById(id: string) {
        try {
            return OffersModel().findOne({
                where: {
                    id: id
                },
                include:[{
                    attributes: {exclude: ['id','password','age','email','mobilePhone','coordinates','cityId',
                'countryId','tokenGoogle','tokenFacebook','status','validatedAt','description','createdAt',
                'updatedAt','latitude','longitude','interest']},
                    model: UsersModel(),
                }],
            })
        } catch (error) {
            throw new Error(`Unable to connect to the database.`)
        }
    }
    static async createTransaction(body:any, token:any ){
        let options: any;

        try {
        
            const service:any = await Services_userModel().findOne({
                where: {
                    id: body.serviceId
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

                const transaction:any = await TransactionsModel().create(body)

                const dataReturn:any = await TransactionsModel().findOne({
                    where: {
                        id: transaction.id
                    }
                })
                return dataReturn
            });
        } catch (error: any) {
            return error.toString()
        }
    }
}

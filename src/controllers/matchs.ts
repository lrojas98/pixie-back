import { Request, Response } from "express";
import { Op } from "sequelize";
import { Common } from "../helper/common";
import { validationResult } from "express-validator";
import moment from "moment";
import CategoriesModel from "../models/categories";
import CitiesModel from "../models/cities";
import CountriesModel from "../models/countries";
import MatchsModel from "../models/matchs";
import Services_userModel from "../models/services_user";
import Service_imageModel from "../models/service_images";
import UsersModel from "../models/users";
import User_imagesModel from "../models/user_images";
import request from "request";
import User_notificationModel from "../models/user_notification";
import ServicesModel from "../models/services";
const urlPath = 'https://fcm.googleapis.com/fcm/send'
export class Controller {
    static notificationUsers: any;

    async getAll(req: Request, res: Response, next: any) {
        try {
            let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
            let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
            let offset = (page - 1) * limit;

            const resultMatches = await MatchsModel().findAndCountAll({
                offset,
                limit,
                include:[{
                    model: UsersModel(),
                    as: 'User',
                },{
                    model: Services_userModel(),
                    as: 'ServiceMatch',
                    include: [{
                        model: ServicesModel()
                    }]
                }],
            });

            let data = {
                results: resultMatches.rows,
                meta: {
                    total: resultMatches.count,
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

            const { id,idNotification } = req.query;
            const reg = await MatchsModel().findOne({
                where: {id: id}, 
                include:[{
                    model: UsersModel(),
                    as: 'User',
                    include:[{
                        model: CitiesModel()
                    },{
                        model: CountriesModel()
                    }]
                },{
                    model: Services_userModel(),
                    as: 'ServiceMatch',
                    include:[{
                        model:  CategoriesModel(),
                        as: 'Categories'
                    },{
                        model: ServicesModel()
                    },{
                        association: Services_userModel().hasMany(Service_imageModel(), { sourceKey:'id', foreignKey: 'serviceId', as: 'user_images'}),
                    },{
                        association:  Services_userModel().hasOne(UsersModel(), { sourceKey:'userId', foreignKey: 'id', as: 'user'}),
                        include: [{
                            model: CitiesModel()
                        },{
                            model: CountriesModel()
                        },{
                            association:  UsersModel().hasMany(User_imagesModel(), { sourceKey:'id', foreignKey: 'userId', as: 'user_images'}),
                        }]
                    }]
                }],
            });

            await User_notificationModel().update(
                { status: 1},
                { where: {
                    id: idNotification
                }}).then(async function() {
                    return res.status(200).json({match: reg});
                }).catch(function(error) {
                    return res.status(400).json({ message:error})
                })

            if(!reg){
                return res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id}`
                })
            }
            

        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async add(req: any, res: Response, next: any) {
        var user:any = req.userTokenInfo.user
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
        }
        const { body } = req;
        body.userId =  user.id
        body.matchedAt = moment.now()
        
        try {

            const serviceUser:any = await Services_userModel().findOne({
                where: {
                    id: body.serviceUserId,
                },
                include:[{
                    association:  Services_userModel().hasOne(UsersModel(), { sourceKey:'userId', foreignKey: 'id', as: 'User'}),
                    attributes: { exclude: ['pass'] },
                }]
            })


            const reg:any = await MatchsModel().create(body);

            if (body.matched == 0 ){

                let tokenfcm = serviceUser.User.token_fcm
                let name = serviceUser.User.name
                let receiverId = serviceUser.User.id
                
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
                            title: `Hola ${name}, tienes un nuevo match`,
                            body: 'Revisa tus match'
                        },
                        priority: "high",
                        data:{
                            event: "new_match_status_0 ",
                            title: `Hola ${name}, tienes un nuevo match`,
                            description: "Revisa tus match"
                        }
                    },
                };

                request.post(options, async (error: any, response: any) => {
                    if (error) {
                        return error
                    }

                    const bodyNotification = {
                        key: 'APPOINTMENT_REQUEST',  
                        tittle: options.body.notification.title,
                        body: options.body.notification.body,
                        userId: user.id,
                        receiverId: receiverId,
                        status: 0,
                        tokenfcm: tokenfcm,
                        matchId: reg.id
                    }

                    await User_notificationModel().create(bodyNotification).then(async function() {
                        res.status(200).json({ 
                            match:reg, 
                        });
                    }).catch(function(error) {
                        res.status(400).json({ message:error})
                    })
                })
            }   
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }

    async update(req: any, res: Response, next: any) {
        var user:any = req.userTokenInfo.user
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
        }
        
        const { body } = req;
        body.userId =  user.id
        body.matchedAt = moment.now()

        try {

            const reg:any = await MatchsModel().findOne({
                where:{
                    id: body.id
                },
                include:[{
                    model: UsersModel(),
                    as: 'User',
                },{
                    model: Services_userModel(),
                    as: 'ServiceMatch',
                }],
            });
            if( !reg ){
                return res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${body.id}`
                });
            }

            await reg.update({matched: body.matched} , {
                where: {
                    id: reg.id
                }
            } );

            if (body.matched == 1 ){

                let tokenfcm = reg.User.token_fcm
                let name = reg.User.name
                let receiverId = reg.User.id
                
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
                            title: `Hola ${name}, tu match a sido aceptado por favor procede a pagarlo`,
                            body: 'Revisa tus match'
                        },
                        priority: "high",
                        data:{
                            event: "new_match_status_0 ",
                            title: `Hola ${name}, tu match a sido aceptado por favor procede a pagarlo`,
                            description: "Revisa tus match"
                        }
                    },
                };

                request.post(options, async (error: any, response: any) => {
                    if (error) {
                        return error
                    }

                    const bodyNotification = {
                        key: 'APPOINTMENT_ACCEPTED',
                        tittle: options.body.notification.title,
                        body: options.body.notification.body,
                        userId: user.id,
                        receiverId: receiverId,
                        status: 0,
                        tokenfcm: tokenfcm,
                        matchId: body.id
                    }

                    await User_notificationModel().create(bodyNotification).then(async function() {
                        return res.status(200).json({ 
                            match:reg, 
                        });
                    }).catch(function(error) {
                        return res.status(400).json({ message:error})
                    })
                })
            }  

            if (body.matched == 2 ){

                let tokenfcm = reg.User.token_fcm
                let name = reg.User.name
                let receiverId = reg.User.id
                
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
                            title: `Hola ${name}, tu match a sido rechazado.`,
                            body: 'Revisa tus match'
                        },
                        priority: "high",
                        data:{
                            event: "new_match_status_0 ",
                            title: `Hola ${name}, tu match a sido rechazado`,
                            description: "Revisa tus match"
                        }
                    },
                };

                request.post(options, async (error: any, response: any) => {
                    if (error) {
                        return error
                    }

                    const bodyNotification = {
                        key: 'APPOINTMENT_REJECTED',
                        tittle: options.body.notification.title,
                        body: options.body.notification.body,
                        userId: user.id,
                        receiverId: receiverId,
                        status: 0,
                        tokenfcm: tokenfcm,
                        matchId: body.id
                    }

                    await User_notificationModel().create(bodyNotification).then(async function() {
                        return res.status(200).json({ 
                            match:reg, 
                        });
                    }).catch(function(error) {
                        return res.status(400).json({ message:error})
                    })
                })
            }
        
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

            const reg= await MatchsModel().findByPk(id);
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

    async getUsersByMatch(req: any, res: Response, next: any) {
        var user:any = req.userTokenInfo;
        const { body } = req;
        try {

            console.log(body)
            let where  = {
                [Op.and]:{}
            }

            let userId

            const dataUser:any = await UsersModel().findOne({where: {
                id: user.user.id
            }})

            if ( user.user.rol == 'SALESMAN' ) {
                where = {
                    [Op.and]: [{userId: dataUser.id},{services_id: body.service_id}],
                }
            }

            if ( user.user.rol == 'CUSTOMER' ) {
                userId = dataUser.id
                where = {
                    [Op.and]: [{services_id: body.service_id}],
                }

                const resultMatchUsers:any = await MatchsModel().findAll({
                    include:[{
                        model: Services_userModel(),
                        as: 'ServiceMatch',
                        where,
                        include: [{
                            association:  Services_userModel().hasOne(UsersModel(), { sourceKey:'userId', foreignKey: 'id', as: 'user'}),
                            include: [{
                                model: CitiesModel()
                            },{
                                model: CountriesModel()
                            }],
                        },{
                            association: Services_userModel().hasMany(Service_imageModel(), { sourceKey:'id', foreignKey: 'serviceId', as: 'user_images'}),
                        },{
                            model:  CategoriesModel(),
                            as: 'Categories'
                        }]
                    },{
                        model: UsersModel(),
                        as: 'User',
                        where:{
                            [Op.and]: {id: userId}
                        },
                        include: [{
                            model: CitiesModel()
                        },{
                            model: CountriesModel()
                        },{
                            model: User_imagesModel()
                        }],
                    }]
                });
    
                if (resultMatchUsers == '') {
                    return res.status(400).json({
                        message: `No cuentas con matchs disponibles`
                    })
                }
                return res.status(200).json({ matchUsers: resultMatchUsers});
            }

            const resultMatchUsers:any = await MatchsModel().findAll({
                include:[{
                    model: Services_userModel(),
                    as: 'ServiceMatch',
                    where,
                    include: [{
                        association:  Services_userModel().hasOne(UsersModel(), { sourceKey:'userId', foreignKey: 'id', as: 'user'}),
                    },{
                        association: Services_userModel().hasMany(Service_imageModel(), { sourceKey:'id', foreignKey: 'serviceId', as: 'user_images'}),
                    },{
                        model:  CategoriesModel(),
                        as: 'Categories'
                    }]
                },{
                    model: UsersModel(),
                    as: 'User',
                    include: [{
                        model: CitiesModel()
                    },{
                        model: CountriesModel()
                    },{
                        model: User_imagesModel()
                    }],
                }]
            });

            if (resultMatchUsers == '') {
                res.status(400).json({
                    message: `No hay usuarios interesados en tus servicios`
                })
            }
            res.status(200).json({ matchUsers: resultMatchUsers});
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }
    
    async notificationUsers(token:any,name:any, userId:any, receiverId:any){
        let options: any;
        try {
            options = {
                url: urlPath,
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.FB_API_KEY}`,
                },
                json: true,
                body: {
                    to: token,
                    notification:{
                        title: `Hola ${name}, tienes un nuevo match`,
                        body: 'prueba'
                    },
                    priority: "high",
                    data:{
                        event: "new_match_status_0 ",
                        title: `Hola ${name}, tienes un nuevo match`,
                        description: "prueba"
                    }
                },
            };

            request.post(options, (error: any, response: any) => {
                if (error) {
                    return error
                }

                const bodyNotification = {
                    tittle: options.body.notification.title,
                    body: options.body.notification.body,
                    userId: userId,
                    receiverId: receiverId,
                    status: 1,
                    tokenfcm: token,
                }

                console.log(bodyNotification)

                User_notificationModel().create(bodyNotification)

            })

        } catch (error: any) {
            return error.toString()
        }
    }
    
    async getCalendar(req: any, res: Response, next: any) {
        var user:any = req.userTokenInfo.user;
        try {

            const resultMatches = await MatchsModel().findAll({
                where: {
                    matched: 1
                },
                include:[{
                    model: Services_userModel(),
                    as: 'ServiceMatch',
                    where: {
                        userId: user.id
                    },
                    include: [{
                        association:  Services_userModel().hasOne(UsersModel(), { sourceKey:'userId', foreignKey: 'id', as: 'user'}),
                        include: [{
                            model: CitiesModel()
                        },{
                            model: CountriesModel()
                        }],
                    },{
                        association: Services_userModel().hasMany(Service_imageModel(), { sourceKey:'id', foreignKey: 'serviceId', as: 'user_images'}),
                    },{
                        model:  CategoriesModel(),
                        as: 'Categories'
                    }]
                },{
                    model: UsersModel(),
                    as: 'User',
                    include: [{
                        model: CitiesModel()
                    },{
                        model: CountriesModel()
                    },{
                        model: User_imagesModel()
                    }],
                }]
            });

            if ( (resultMatches as any) == '') {
                return res.status(400).json({
                    message: `No cuentas con citas activas`
                })
            }
            res.status(200).json({ matchUsers: resultMatches});
        } catch (error) {
            new Common().showLogMessage('Error controlado', error, 'error');
            next({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error
            });
        }
    }
}

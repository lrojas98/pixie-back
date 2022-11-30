import { Request, Response } from "express";
import { Op,Sequelize } from "sequelize";
import { Common } from "../helper/common";
import CategoriesModel from "../models/categories";
import CitiesModel from "../models/cities";
import CountriesModel from "../models/countries";
import MatchsModel from "../models/matchs";
import Rating_usersModel from "../models/rating_users";
import Services_userModel from "../models/services_user";
import Service_imageModel from "../models/service_images";
import UsersModel from "../models/users";
import User_imagesModel from "../models/user_images";
const urlPath = 'https://fcm.googleapis.com/fcm/send'
import request from "request";
import User_notificationModel from "../models/user_notification";
import { validationResult } from "express-validator";
import { Where } from "sequelize/types/lib/utils";

export class Controller {

    async getAll(req: Request, res: Response, next: any) {
        try {
            const results = await Rating_usersModel().findAll();
            res.status(200).json({rating: results});
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
            const reg = await Rating_usersModel().findByPk(id);

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
        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            var err:any = errors.array()

            return res.status(400).json({
                message: err[1].msg
            });
        }

        const { body } = req;

        try {

            body.calificatorId = user.user.id

            const match:any = await Rating_usersModel().findOne({
                where: {
                    matchId: body.matchId
                }
            })

            if (match != null){
                return res.status(200).json({message: 'Este servicio ya se encuentra calificado'})
            }
        
            await Rating_usersModel().create(body).then(async function(data){
                let ratings =  await Rating_usersModel().findAll({
                    where: {
                        userId: (data as any).userId
                    }
                })

                let userRatings = 0

                for (const sum of ratings){
                    userRatings = userRatings + (sum as any).qualification
                }

                userRatings = userRatings / ratings.length

                userRatings = parseFloat(userRatings.toFixed(1))

                await UsersModel().update({rating: userRatings},
                    { where: {
                        id: body.userId
                    }}
                )

                return res.status(200).json({rating: body}); 
            })
        
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

            const reg = await Rating_usersModel().findByPk(id);
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

            const reg= await Rating_usersModel().findByPk(id);
            if( !reg ){
                return res.status(404).json({
                    message: `No se encuentra el recurso solicitado con el id ${id}`
                });
            }

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

    async pendingQualificationMatch() {
        var date = new Date();

        var [results, metadata]: any = await MatchsModel().sequelize?.query(`select * from matchs 
            where matched = 1 and date_format(matchedAt,'%d/%m/%Y') = :date`,{
                replacements: {date: date.toLocaleDateString('en-GB')}
            } )

        for (let index = 0; index < results.length; index++) {
            console.log(results)
          this.sendPushQualificationMatch(results[index].id)
        }
        
    }

    async sendPushQualificationMatch(matchId: string){
        const reg:any = await MatchsModel().findOne({
            where: {id: matchId}, 
            include:[{
                model: UsersModel(),
                as: 'User',
            },{
                model: Services_userModel(),
                as: 'ServiceMatch',
                include:[{
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
                },{
                    model:  CategoriesModel(),
                    as: 'Categories'
                }]
            }],
        });
        
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
                    to: reg.User.token_fcm,
                    notification:{
                        title: `Hola ${reg.User.name}, califica tu cita`,
                        body: 'prueba'
                    },
                    priority: "high",
                    data:{
                        event: "new_match_status_0 ",
                        title: `Hola ${reg.User.name}, califica tu cita`,
                        description: "prueba"
                    }
                },
            };

            request.post(options, async (error: any, response: any) => {
                if (error) {
                    return error
                }   

                const bodyNotification = {
                    key: 'RATE_QUOTE',
                    tittle: options.body.notification.title,
                    body: options.body.notification.body,
                    userId: reg.ServiceMatch.user.id,
                    receiverId: reg.User.id,
                    status: 0,
                    tokenfcm: reg.User.token_fcm,
                    matchId: matchId
                }

                await User_notificationModel().create(bodyNotification)

            })

        } catch (error: any) {
            return error.toString()
        }
    }

}

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Common } from "../helper/common";
import jwt from 'jsonwebtoken';
import bcrypt from 'crypto';
import User from '../models/users';
import RolesModel from "../models/roles";
import ServicesModel from "../models/services";
import CitiesModel from "../models/cities";
import CountriesModel from "../models/countries";
import User_imagesModel from "../models/user_images";
import UsersModel from "../models/users";
import random from "string-random"
import { EmailMiddleware } from "../middleware/emailHanlder";
import { EmailConfig } from "../config/mail.config";
import Authentication_codesModel from "../models/authentication_codes";

export class Controller {
    
    async signin(req: Request, res: Response, next: any) {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
        }

        const { body } = req; 
        const header:any = req.headers

        var encrypt = bcrypt.createHmac('sha256',body.password).update('piuts').digest('base64');
        
        const user:any = await Controller.searchUserByEmail(body.email);

        try {
            if(!user){
                res.status(400).json({message: "Usuario no existe "})
            } else {
                    var data = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        rol: user.Roles[0].name
                    }

                    if ( user.status != 1 ){
                        return res.status(400).json({message: 'Usuario inactivo, por favor valida tu correo'})
                    }
                    if (user.password == encrypt){
                        let token = jwt.sign({
                            user: data
                        }, 'piuts-api',{ expiresIn: '20d' });

                        await UsersModel().update(
                            { token_fcm: header.tokenfcm },
                            { where: {
                                id: user.id
                            }}).then(async function() {

                                const req:any = await Controller.searchUserByEmail(user.email);

                                res.status(200).header({ "Authorization": token }).json({
                                    user: req,
                                    token: token,
                                    message: `Proceso Satisfactorio`,
                                })
                            }).catch(function(error) {
                                res.status(400).json({ message:error})
                            })
                    } else {
                        res.status(400).json({
                            message: "El usuario no ha podido iniciar sesión correctamente"
                        })
                    }
            }     
        } catch (error: any) {
            new Common().showLogMessage("Error controlado", error, "error");

            if (error.message) res.status(500).json(error);
            else
                res.status(500).json({
                message:
                    "Ha ocurrido un error en nuestro sistema, intenta nuevamente",
                error,
                code: 10,
            });
        }
    }

    async tokenInfo(req: any, res: Response, next: any) {
        var user:any = req.userTokenInfo;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
        }

        try {

            var user:any = await User().findOne({
                where: { id: user.user.id },
                include: [{
                    model:  RolesModel(),
                    as: 'Roles'
                },{
                    model:  ServicesModel(),
                    as: 'Services'
                },{
                    model: CitiesModel()
                },{
                    model: CountriesModel()
                },{
                    association:  User().hasMany(User_imagesModel(), { sourceKey:'id', foreignKey: 'userId', as: 'user_images'}),
                }]
            })

            if(!user){
                res.status(400).json({message: "Usuario no existe "})
            } else {
                res.status(200).json({
                    user: user,
                    message: `Proceso Satisfactorio`,
                    })
            }     
        } catch (error: any) {
            new Common().showLogMessage("Error controlado", error, "error");

            if (error.message) res.status(500).json(error);
            else
                res.status(500).json({
                message:
                    "Ha ocurrido un error en nuestro sistema, intenta nuevamente",
                error,
                code: 10,
            });
        }
    }

    async forgotPassword(req: Request, res: Response, next: any){
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
        }

        const { email } = req.body;

        try {
            
            let user: any = await UsersModel().findOne({
              where: {
                email
              }
            });
      
            
            if (!user) {
              return res.status(400).json({
                message: 'El email diligenciado no se encuentra registrado',
              });
            }
      
            var number = random(6,{letters: false})

            const template = new EmailConfig().getTemplateForgotPassword(email,number)
            const subject = 'Restablece tu contraseña de Piuts !!'

            await new EmailConfig().sendEmail(email,subject, template)

            const authentication = {
                userId: user.id,
                email: user.email,
                code: number
            }

            await Authentication_codesModel().create(authentication)

            res.status(200).json({message: 'Se ha enviado un codigo de restablecimiento a tu correo.'})
      
          } catch (error: any) {
            new Common().showLogMessage('Error controlado', error, 'error');
      
            if (error.message)
              res.status(500).json(error);
            else
              res.status(500).json({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error, code: 10
              });
          }

    }

    async verifyCode(req: Request, res: Response, next: any){
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
        }

        const { code } = req.body;

        try {
            
            const verify: any = await Authentication_codesModel().findOne({
              where: {
                code: code,
              }
            });
      
            
            if (!verify) {
              return res.status(400).json({
                message: 'El codigo de verificacion es incorrecto',
              });
            }

            if (verify.use) {
                return res.status(400).json({
                  message: 'El codigo de verificacion ya a sido utilizado',
                });
              }

            res.status(200).json({data: {
                email: verify.email,
                code: verify.code,
                status: 'Ok'
            }})
      
          } catch (error: any) {
            new Common().showLogMessage('Error controlado', error, 'error');
      
            if (error.message)
              res.status(500).json(error);
            else
              res.status(500).json({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error, code: 10
              });
          }
    }

    async updatePassword(req: Request, res: Response, next: any){
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
        }

        const { body } = req;

        try {
            
            const verify = await Authentication_codesModel().findOne({
              where: {
                code: body.code,
                email: body.email
              }
            });
      
            
            if (!verify) {
              return res.status(400).json({
                message: 'El codigo de verificacion es incorrecto',
              });
            }

            if ((verify as any).use) {
                return res.status(400).json({
                  message: 'El codigo de verificacion ya a sido utilizado',
                });
              }

            if (body.password) {

                var newEncrypt = bcrypt.createHmac('sha256',body.password).update('piuts').digest('base64');
                
                await UsersModel().update(
                    { password: newEncrypt},
                    { where: {
                        id: (verify as any).userId
                    }}).then(async function() {

                        await verify.update({use:true}, {
                            where: {
                              id: (verify as any).id
                            }
                        });

                        res.status(200).json({
                            message: `Proceso Satisfactorio`,
                        })
                    }).catch(function(error) {
                        return res.status(400).json({ message:error})
                    })
            }
      
          } catch (error: any) {
            new Common().showLogMessage('Error controlado', error, 'error');
      
            if (error.message)
              res.status(500).json(error);
            else
              res.status(500).json({
                message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
                error, code: 10
              });
          }
    }

    static searchUserByEmail(email: string) {
        try {
            return User().findOne({
                where: { email: email },
                include: [{
                    model:  RolesModel(),
                    as: 'Roles'
                },{
                    model:  ServicesModel(),
                    as: 'Services'
                },{
                    model: CitiesModel()
                },{
                    model: CountriesModel()
                },{
                    association:  User().hasMany(User_imagesModel(), { sourceKey:'id', foreignKey: 'userId', as: 'user_images'}),
                }]
            })
        } catch (error) {
            throw new Error(`Unable to connect to the database.`)
        }
    }
}
import * as jwt from "jsonwebtoken";
import { Response } from "express";

var secret = 'piuts-api';

export class AuthMiddleware {
    
    public authHandler = function( req: any, res: Response, next: any) {
        if (!req.headers.authorization) {
            return res.status(403).json({message: "La peticion no tiene la autorizacion"})
        }
    
        var token = req.headers.authorization.replace(/['"]+/g, '');
    
        try{
          var payload: any = jwt.verify(token, secret);
          
          req.userTokenInfo = payload;

          next();
        } catch (error) {
            return res.status(401).json({
                message: "El token no es valido",
                error
            })
        }
      }
}
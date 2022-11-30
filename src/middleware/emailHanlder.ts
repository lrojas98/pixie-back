import * as jwt from "jsonwebtoken";

var secret = 'piuts-api';


export class EmailMiddleware {

    public emailHandler = ( data:any ) => {
        return jwt.sign({
            data: data
        }, secret, { expiresIn: '1h' });
    }

    public getTokenData = (token:any) => {
        let data = null;
        jwt.verify(token, secret, (err: any, decoded: any) => {
            if(err) {
                console.log('Error al obtener data del token');
            } else {
                data = decoded;
            }
        });

        return data;
    }
}
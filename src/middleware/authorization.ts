import { Response, NextFunction } from "express";

export class AuthorizationMiddleware {

  public authorize(roles: string[] = []) {
    return (req: any, res: Response, next: NextFunction) => {

      let roleUser = typeof (req.userTokenInfo.user.rol) == 'string' ? [req.userTokenInfo.user.rol] : req.userTokenInfo.user.rol;
      let validate = false;

      if (roleUser) {
        for (let i of roleUser) {
          validate = roles.includes(i);
          if (validate) break;
        }
      }
      else {
        validate = !roles || !roles.length;
      }

      if (!validate)
        return res.status(403).json({
          message: "Permiso denegado"
        });

      next();
    };
  }
}
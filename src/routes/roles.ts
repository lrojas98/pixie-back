import { Router } from "express";
import { Controller } from "../controllers/roles";
import { Roles } from "../helper/roles";
import { AuthMiddleware } from "../middleware/authHandler";
import { AuthorizationMiddleware } from "../middleware/authorization";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();
const AuthorizationRol = new AuthorizationMiddleware();

router.get('/',         controller.getAll)
router.get('/admin/',     
    authMid.authHandler,
    AuthorizationRol.authorize([Roles.ADMIN]),  
controller.getAllAdmin)
router.get('/:id',   
    authMid.authHandler,
    AuthorizationRol.authorize([Roles.ADMIN]),     
controller.get)
router.post('/',     
    authMid.authHandler,
    AuthorizationRol.authorize([Roles.ADMIN]),   
controller.add)
router.put('/:id',      
    authMid.authHandler,
    AuthorizationRol.authorize([Roles.ADMIN]),   
controller.update)
router.delete('/:id', 
    authMid.authHandler,
    AuthorizationRol.authorize([Roles.ADMIN]),     
    controller.delete)

export default router;
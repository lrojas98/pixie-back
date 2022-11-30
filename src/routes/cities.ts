import { Router } from "express";
import { check } from "express-validator";
import { Controller } from "../controllers/cities";
import { Roles } from "../helper/roles";
import { AuthMiddleware } from "../middleware/authHandler";
import { AuthorizationMiddleware } from "../middleware/authorization";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();
const AuthorizationRol = new AuthorizationMiddleware();

router.get('/',       controller.getAll)
router.get('/byCountryId',       controller.getAllByCountry)
router.get('/:id',   
    authMid.authHandler,
    AuthorizationRol.authorize([Roles.ADMIN]),     
controller.get)
router.post('/',     
    authMid.authHandler,
    AuthorizationRol.authorize([Roles.ADMIN]),  
    check('code').not().isEmpty().exists().withMessage("El codigo es requerido"), 
    check('name').not().isEmpty().exists().withMessage("El nombre es requerido"), 
    check('status').not().isEmpty().exists().withMessage("El status es requerido"), 
    check('countriesId').not().isEmpty().exists().withMessage("El id de la ciudad es requerido"), 
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
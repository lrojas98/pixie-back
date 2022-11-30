
import { Router } from "express";
import { check } from "express-validator";
import { Controller } from "../controllers/wallet_amount_user";
import { AuthMiddleware } from "../middleware/authHandler";
import { AuthorizationMiddleware } from "../middleware/authorization";
import { Roles } from "../helper/roles";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();
const AuthorizationRol = new AuthorizationMiddleware();

router.use(authMid.authHandler,)
router.get('/',       controller.getAll)
router.get('/admin',       controller.getAllAdmin)
router.get('/:id',    controller.get)
router.post('/',    [
    check('credential').not().isEmpty().exists().withMessage("la cedula es requerido"),
    check('savings_account').not().isEmpty().exists().withMessage("el numero de cuenta de ahorros es requerido"),
    check('mobile_phone').not().isEmpty().exists().withMessage("El numero de celular es requerido"),
],     controller.add)
router.put('/:id',   [
    check('credential').not().isEmpty().exists().withMessage("la cedula es requerido"),
    check('savings_account').not().isEmpty().exists().withMessage("el numero de cuenta de ahorros es requerido"),
    check('mobile_phone').not().isEmpty().exists().withMessage("El numero de celular es requerido"),
],   controller.update)
router.delete('/:id',  AuthorizationRol.authorize([Roles.ADMIN]), controller.delete)

export default router;
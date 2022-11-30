
import { Router } from "express";
import { check } from "express-validator";
import { Controller } from "../controllers/wallet_user_transactions";
import { AuthMiddleware } from "../middleware/authHandler";
import { AuthorizationMiddleware } from "../middleware/authorization";
import { Roles } from "../helper/roles";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();
const AuthorizationRol = new AuthorizationMiddleware();

router.use(authMid.authHandler,)
router.get('/',       controller.getAll)
router.get('/:userId',    controller.getUser)
router.get('/byId/:id',    controller.get)
router.post('/',    [
    check('amount').not().isEmpty().exists().withMessage("El monto a retirar es requerido"),
],     controller.add)
router.put('/:id',   [
    check('description').not().isEmpty().exists().withMessage("la descripcion es requerido"),
    check('status').not().isEmpty().exists().withMessage("el status es requerido"),
],   controller.update)
router.delete('/:id',  AuthorizationRol.authorize([Roles.ADMIN]), controller.delete)

export default router;
import { Router } from "express";
import { check } from "express-validator";
import { Controller } from "../controllers/payment_settings";
import { AuthMiddleware } from "../middleware/authHandler";
import { AuthorizationMiddleware } from "../middleware/authorization";
import { Roles } from "../helper/roles";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();
const AuthorizationRol = new AuthorizationMiddleware();

router.use(authMid.authHandler, AuthorizationRol.authorize([Roles.ADMIN]),)
router.get('/',         controller.getAll)
router.get('/:id',      controller.get)
router.post('/',    [
    check('TBK_API_KEY').not().isEmpty().exists().withMessage("El codigo de comercio es requerido"),
    check('TBK_API_KEY_SECRET').not().isEmpty().exists().withMessage("La token de comercio es requerido"),
    check('commission').not().isEmpty().exists().withMessage("El porcentaje de comision es requerido"),
],     controller.add)
router.put('/:id',      controller.update)
router.delete('/:id',   controller.delete)

export default router;
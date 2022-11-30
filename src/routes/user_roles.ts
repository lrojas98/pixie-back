import { Router } from "express";
import { check } from "express-validator";
import { Controller } from "../controllers/user_roles";
import { AuthMiddleware } from "../middleware/authHandler";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();

router.use(authMid.authHandler)
router.get('/',         controller.getAll)
router.get('/:id',      controller.get)
router.post('/',        controller.add)
router.put('/',[
    check('rolesId').not().isEmpty().exists().withMessage("El rol id es requerido"),
    check('userId').not().isEmpty().exists().withMessage("El user id es requerido"),
],    controller.update)
router.delete('/:id',   controller.delete)

export default router;
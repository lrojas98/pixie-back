import { Router } from "express";
import { check } from "express-validator";
import { Controller } from "../controllers/users";
import { Roles } from "../helper/roles";
import { AuthMiddleware } from "../middleware/authHandler";
import { AuthorizationMiddleware } from "../middleware/authorization";

const router = Router();
const controller = new Controller();


router.get('/',     controller.getAll)
router.post('/',[
    check('email').not().isEmpty().exists().withMessage("El email es requerido"),
    check('password').not().isEmpty().exists().withMessage("La contraseña es requerida"),
    check('name').not().isEmpty().exists().withMessage("El nombre es requerido"),
    check('phone').not().isEmpty().exists().withMessage("El genero es requerido"),
],controller.add)

export default router;
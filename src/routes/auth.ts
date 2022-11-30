import { Router } from "express";
import { check } from "express-validator";
import { AuthMiddleware } from "../middleware/authHandler";
import { Controller } from "../controllers/auth";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();

router.post('/signin',
[
  check('email').not().isEmpty().exists().withMessage("El email es requerido"),
  check('password').not().isEmpty().exists().withMessage("La contraseña es requerida"),
],
controller.signin)
router.get('/tokenInfo', authMid.authHandler, controller.tokenInfo)
router.post('/verifyCode',
[
  check('code').not().isEmpty().exists().withMessage("El codigo es requerido"),
], controller.verifyCode)
router.post('/forgotPassword',
[
  check('email').not().isEmpty().exists().withMessage("El email es requerido"),
], controller.forgotPassword)
router.put('/updatePassword',
[
  check('email').not().isEmpty().exists().withMessage("El email es requerido"),
  check('code').not().isEmpty().exists().withMessage("El codigo es requerido"),
  check('password').not().isEmpty().exists().withMessage("La contraseña es requerido"),
], controller.updatePassword)

export default router;
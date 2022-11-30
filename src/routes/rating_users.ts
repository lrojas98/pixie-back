import { Router } from "express";
import { check } from "express-validator";
import { Controller } from "../controllers/rating_users";
import { AuthMiddleware } from "../middleware/authHandler";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();

router.use(authMid.authHandler)
router.get('/',         controller.getAll)
router.get('/:id',      controller.get)
router.post('/',   [
    check('userId').not().isEmpty().exists().withMessage("El userId es requerido"),
    check('matchId').not().isEmpty().exists().withMessage("El matchId es requerido"),
    check('qualification').not().isEmpty().exists().withMessage("La qualification es requerido"),
],     controller.add)
router.put('/:id',      controller.update)
router.delete('/:id',   controller.delete)

export default router;
import { Router } from "express";
import { check } from "express-validator";
import { Controller } from "../controllers/favorite_services";
import { AuthMiddleware } from "../middleware/authHandler";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();

router.use(authMid.authHandler)
router.get('/',         controller.getAll)
router.get('/:id',      controller.get)
router.post('/',[
    check('serviceUserId').not().isEmpty().exists().withMessage("El serviceUserId es requerido"),
],       controller.add)
router.post('/favorite', [
    check('serviceUserId').not().isEmpty().exists().withMessage("El serviceUserId es requerido"),
],        controller.serviceFavorite)
router.put('/:id',      controller.update)
router.delete('/',   controller.delete)

export default router;
import { Router } from "express";
import { check } from "express-validator";
import { Controller } from "../controllers/matchs";
import { AuthMiddleware } from "../middleware/authHandler";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();

router.use(authMid.authHandler)
router.get('/',         controller.getAll)
router.get('/getMatchById/',      controller.get)
router.get('/getCalendar/',      controller.getCalendar)
router.post('/getUsersMatch',    controller.getUsersByMatch)
router.post('/',  [
    check('matched').not().isEmpty().exists().withMessage("El status es requerido"),
], controller.add)
router.put('/',      controller.update)
router.delete('/:id',   controller.delete)

export default router;
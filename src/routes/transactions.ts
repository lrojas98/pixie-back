import { Router } from "express";
import { check } from "express-validator";
import { Controller } from "../controllers/transactions";
import { AuthMiddleware } from "../middleware/authHandler";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();

router.use(authMid.authHandler)
router.get('/',         controller.getAll)
router.get('/:id',      controller.get)
router.post('/',        controller.add)
router.post('/inscriptionUser',     controller.inscriptionUser)
router.put('/confirmInscriptionUser',     controller.confirmInscriptionUser)
router.put('/:token',      controller.update)
router.delete('/:id',   controller.delete)

export default router;
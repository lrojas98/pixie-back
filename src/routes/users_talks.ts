import { Router } from "express";
import { Controller } from "../controllers/users_talks";
import { AuthMiddleware } from "../middleware/authHandler";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();

router.use(authMid.authHandler)
router.get('/',         controller.getAll)
router.get('/:id',      controller.get)
router.post('/',        controller.add)
router.put('/:id',      controller.update)
router.delete('/:id',   controller.delete)

export default router;
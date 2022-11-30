import { Router } from "express";
import { Controller } from "../controllers/user_services_salesman";
import { AuthMiddleware } from "../middleware/authHandler";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();

router.use(authMid.authHandler)
router.get('/',         controller.getAll)
router.get('/getServicesByUser',         controller.getServicesByUser)
router.post('/',        controller.add)
router.put('/:id',      controller.update)

export default router;
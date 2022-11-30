import { Router } from "express";
import { check } from "express-validator";
import { Controller } from "../controllers/services_user";
import { AuthMiddleware } from "../middleware/authHandler";
import multer from "multer";
import fs from "fs";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const path = 'public/upload'
      if (fs.existsSync(path)) {
        cb(null, 'public/upload')
      } else {
        fs.mkdirSync('./public/upload/',{recursive:true});
        cb(null, 'public/upload')
      }
    },
    filename: function (req, file, cb) {
        console.log(file)
      cb(null, `${file.originalname}`)
    }
  })
  
  const upload = multer({ storage: storage })
  

router.use(authMid.authHandler)
router.get('/',         controller.getAll)
router.get('/:id',      controller.get)
router.post('/get_salesman',         controller.getServicesUsers)
router.post('/active_services', controller.activeService)
router.post('/',[
    check('stateServiceId').not().isEmpty().exists().withMessage("El estado es requerido"),
    check('services_id').not().isEmpty().exists().withMessage("El servicio a prestar es requerido"),
    check('value').not().isEmpty().exists().withMessage("El valor del servicio es requerido"),
    check('description').not().isEmpty().exists().withMessage("La descripcion es requerida"),
    check('categoriesId').not().isEmpty().exists().withMessage("Las categorias del servicio son requeridas"),
],controller.add)

var fieldsFiles = [
  {
      name: 'myImage',
      maxCount: 1
  },
];
const cpUpload = upload.fields(fieldsFiles);

router.post('/addImage',[
    cpUpload
], (req: any, res: any, next: any) => controller.addImage(req, res, next));
router.put('/',      controller.update)
router.delete('/:id',   controller.delete)

export default router;
import { Router } from "express";
import { Controller } from "../controllers/services";
import { AuthMiddleware } from "../middleware/authHandler";
import multer from "multer";
import fs from "fs";

const router = Router();
const controller = new Controller();
const authMid = new AuthMiddleware();

router.get('/',         controller.getAll)
router.get('/:id',      controller.get)
router.post('/',        controller.add)

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

var fieldsFiles = [
    {
        name: 'imageService',
        maxCount: 1
    },
  ];
  const cpUpload = upload.fields(fieldsFiles);
  router.post('/addImage',[
    cpUpload
], (req: any, res: any, next: any) => controller.addImage(req, res, next));

router.put('/:id',      controller.update)
router.delete('/:id',   controller.delete)

export default router;
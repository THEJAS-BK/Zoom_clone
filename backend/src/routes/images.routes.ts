import { Router } from "express";
import { authHeader } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload";
import { fetchImages, uploadImage } from "../controllers/images.controller";
    
const router=Router();

router.post("/upload",authHeader, upload.single("image"),uploadImage)
router.get("/",authHeader,fetchImages)
export default router;
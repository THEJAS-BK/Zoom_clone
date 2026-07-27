import { Router } from "express";
import { authHeader } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload";
import { uploadImage } from "../controllers/imageContoller";

const router=Router();

router.post("/upload",authHeader, upload.single("image"),uploadImage)

export default router;
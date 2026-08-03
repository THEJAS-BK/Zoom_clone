import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authHeader } from "../middlewares/auth.middleware";
const router = Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/refreshtoken", authController.refresh);

router.get("/verify",authHeader,(req,res)=>{res.json({user:req.userId})})

export default router
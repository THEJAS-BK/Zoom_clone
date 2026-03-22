import { Router } from "express";
import { userController } from "../controllers/auth.controllers";
const router = Router();

router.post("/register", userController.register);

router.post("/login", userController.login);

export default router
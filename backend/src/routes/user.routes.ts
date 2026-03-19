import { Router } from "express";
import { userController } from "../controllers/users.controllers";
const router = Router();

router.get("/test", userController.testRoute);

export default router
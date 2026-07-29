import { Router } from "express";
import { authHeader } from "../middlewares/auth.middleware";
import { getUser } from "../controllers/users.controller";

const router = Router();

router.get("/me",authHeader, getUser)

export default router
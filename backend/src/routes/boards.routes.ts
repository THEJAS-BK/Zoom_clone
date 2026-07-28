import { Router } from "express";
import { saveBoard,updateBoard } from "../controllers/boards.controller";
import { authHeader } from "../middlewares/auth.middleware";

const router = Router();    
router.post("/:roomId",authHeader,saveBoard)
router.patch("/:boardId",authHeader,updateBoard)

export default router;
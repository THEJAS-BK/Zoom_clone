import { Router } from "express";
import { getBoards, saveBoard,updateBoard } from "../controllers/boards.controller";
import { authHeader } from "../middlewares/auth.middleware";

const router = Router();    
router.post("/:roomId",authHeader,saveBoard)
router.patch("/:boardId",authHeader,updateBoard)
router.get("/",authHeader,getBoards)
export default router;
import { Router } from "express";
import { getBoards, saveBoard,updateBoard,getOfflineBoardContent } from "../controllers/boards.controller";
import { authHeader } from "../middlewares/auth.middleware";

const router = Router();    
router.post("/:roomId",authHeader,saveBoard)
router.patch("/:boardId",authHeader,updateBoard)
router.get("/",authHeader,getBoards)

//get offline board content
router.get("/offline/:id", authHeader, getOfflineBoardContent);
export default router;
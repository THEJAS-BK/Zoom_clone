import { Router } from "express";
import { getBoards, saveBoard,updateBoard,getOfflineBoardContent,deleteBoard, saveOfflineBoard ,updateOfflineBoard} from "../controllers/boards.controller";
import { authHeader } from "../middlewares/auth.middleware";

const router = Router();    
router.post("/:roomId",authHeader,saveBoard)
router.patch("/:boardId",authHeader,updateBoard)
router.get("/",authHeader,getBoards)
router.delete("/:id",authHeader,deleteBoard)

//offline board content
router.get("/offline/:id", authHeader, getOfflineBoardContent);
router.post("/offline", authHeader, saveOfflineBoard);
router.patch("/offline/:id", authHeader, updateOfflineBoard);
export default router;
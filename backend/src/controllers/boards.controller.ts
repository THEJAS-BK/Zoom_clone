// controllers/boardController.ts
import { roomBoards, roomElements, roomBoardColors } from "./sockets/index";
import Board from "../models/board.model";
import { Request, Response } from "express";

export const saveBoard = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { name } = req.body;
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roomId || Array.isArray(roomId)) {
      return res.status(400).json({ message: "Invalid roomId" });
    }

    const board = await Board.create({
      ownerId: req.userId,
      name,
      boardColor: roomBoardColors[roomId] ?? "#27272A",
      strokes: roomBoards[roomId] ?? [],
      elements: roomElements[roomId] ?? [],
    });
    res.status(201).json({ _id: board._id, name: board.name });
  } catch (err) {
    res.status(500).json({ message: "Failed to save board" });
  }
};

export const updateBoard = async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;
    const { name, roomId } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const board=await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    if(board.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    board.name=name;
    board.boardColor=roomBoardColors[roomId] ?? "#27272A";
    board.strokes=roomBoards[roomId] ?? [];
    board.elements=roomElements[roomId] ?? [];

    await board.save();

    res.status(200).json({ name: board.name });
  } catch (err) {
    res.status(500).json({ message: "Failed to update board" });
  }
};

export const getBoards = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const boards = await Board.find({ ownerId: req.userId })
    .select("_id name updatedAt ");

    res.status(200).json(boards);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch boards" });
  }
};


export const getOfflineBoardContent=async(req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.status(200).json(board);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch offline board content" });
  }
};

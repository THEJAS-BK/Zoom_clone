import { Socket } from "socket.io";
import { Stroke, CanvasElement } from "./types/canvasTypes";
import Board from "../../models/board.model";
export const registerSwitchBoards = (
  socket: Socket,
  roomBoards: Record<string, Stroke[]>,
  roomElements: Record<string, CanvasElement[]>,
  roomBoardColors: Record<string, string>,
  activeRooms: Record<string, Set<string>>,
) => {
  // server
  socket.on("switch-room", async (roomId, fromBoardId, callback) => {
    if (activeRooms[roomId]) return callback({ success: false });
      socket.join(roomId);
    activeRooms[roomId] = new Set();
    activeRooms[roomId].add(socket.id);

    if (fromBoardId) {
      const board = await Board.findById(fromBoardId);
      if (board) {
        roomBoardColors[roomId] = board.boardColor;
        roomBoards[roomId] = board.strokes;
        roomElements[roomId] = board.elements;
      }
    }

    callback({ success: true });
  });

  socket.on("board-switch-start", ({ roomId, boardName, initiatorName }) => {
    socket.to(roomId).emit("board-switch-start", { boardName, initiatorName });
  });

  socket.on("board-switch-complete", ({ roomId, newRoomId }) => {
    socket.to(roomId).emit("board-switch-complete", { newRoomId });
  });
};

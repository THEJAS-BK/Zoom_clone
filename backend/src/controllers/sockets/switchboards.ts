import { Socket } from "socket.io";
import { Stroke, CanvasElement } from "./types/canvasTypes";
import Board from "../../models/board.model";
const CURSOR_COLORS = [
  "#F87171", // red
  "#FB923C", // orange
  "#FACC15", // yellow
  "#4ADE80", // green
  "#60A5FA", // blue
  "#C084FC", // purple
];

const ROOM_CAPACITY = 6;

function getUnusedCursorColor(
  roomId: string,
  roomUserInfo: Record<string, Record<string, { color: string }>>,
): string {
  const used = new Set(
    Object.values(roomUserInfo[roomId] ?? {}).map((u) => u.color),
  );
  const available = CURSOR_COLORS.filter((c) => !used.has(c));
  const pool = available.length > 0 ? available : CURSOR_COLORS; // fallback if room is full and all 6 are taken
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export const registerSwitchBoards = (
  socket: Socket,
  roomBoards: Record<string, Stroke[]>,
  roomElements: Record<string, CanvasElement[]>,
  roomBoardColors: Record<string, string>,
  activeRooms: Record<string, Set<string>>,
  roomMuteState: Record<
    string,
    Record<string, { videoMuted: boolean; audioMuted: boolean }>
  >,
  roomUserInfo: Record<string, Record<string, { color: string; name: string }>>,
) => {
  // server
  socket.on("switch-room", async (roomId, fromBoardId, callback) => {
    if (activeRooms[roomId]) return callback({ success: false });

    const prevRoomId = socket.data.roomId;

    // clean up old room membership before creating the new one
    if (prevRoomId) {
      socket.leave(prevRoomId);
      activeRooms[prevRoomId]?.delete(socket.id);
      delete roomUserInfo[prevRoomId]?.[socket.id];
      socket.to(prevRoomId).emit("user-left", socket.id);

      if (activeRooms[prevRoomId] && activeRooms[prevRoomId].size === 0) {
        delete activeRooms[prevRoomId];
        delete roomMuteState[prevRoomId];
        delete roomUserInfo[prevRoomId];
      }
    }

    activeRooms[roomId] = new Set();
    activeRooms[roomId].add(socket.id);
    socket.join(roomId);
    socket.data.roomId = roomId; // keep this in sync

    roomUserInfo[roomId] = {
      [socket.id]: {
        color: getUnusedCursorColor(roomId, roomUserInfo),
        name: socket.data.name,
      },
    };

    const prevMuteState = prevRoomId && roomMuteState[prevRoomId]?.[socket.id];
    roomMuteState[roomId] = {
      [socket.id]: prevMuteState ?? { videoMuted: true, audioMuted: true },
    };

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

  socket.on("board-switch-start", ({ roomId, boardName }) => {
    socket
      .to(roomId)
      .emit("board-switch-start", {
        boardName,
        initiatorName: socket.data.name,
      });
  });

  socket.on("board-switch-complete", ({ roomId, newRoomId }) => {
    socket.to(roomId).emit("board-switch-complete", { newRoomId });
  });
};

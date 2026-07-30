import { Server, Socket } from "socket.io";
import { CanvasElement, Stroke } from "./types/canvasTypes";

export function registerCanvasHandler(
  socket: Socket,
  roomBoards: Record<string, Stroke[]>,
  roomElements: Record<string, CanvasElement[]>,
  roomBoardColors: Record<string, string>,
  roomUserInfo: Record<string, Record<string, { color: string; name: string }>>
) {
  //cursor position
  socket.on("cursor-move", ({ roomId, x, y }) => {
    const info = roomUserInfo[roomId]?.[socket.id];
    if(!info)return;
    socket
      .to(roomId)
      .emit("cursor-move", {
        userId: socket.id,
        x,
        y,
        color: roomUserInfo[roomId]?.[socket.id]?.color || "#000000",
        name: roomUserInfo[roomId]?.[socket.id]?.name || "Unknown",
      });

      socket.to(roomId).emit("cursor-move", { userId: socket.id, x, y, color: info.color, name: info.name });
  });
  //intial state of the board
  socket.on("board-state", (roomId) => {
    socket.emit("board-state", roomBoards[roomId] ?? []);
    socket.emit("element-state", roomElements[roomId] ?? []);
    socket.emit("board-color-change", roomBoardColors[roomId] ?? "#27272A");
  });

  socket.on("board-color-change", ({ roomId, color }) => {
    roomBoardColors[roomId] = color;
    socket.to(roomId).emit("board-color", color);
  });

  socket.on("board-color-request", (roomId) => {
    socket.emit("board-color", roomBoardColors[roomId] ?? "#27272A");
  });

  socket.on("stroke-start", (data) => {
    socket.to(data.roomId).emit("stroke-start", data);
  });

  socket.on("stroke-points", (data) => {
    socket.to(data.roomId).emit("stroke-points", data);
  });

  socket.on("stroke-end", (data) => {
    roomBoards[data.roomId] ??= [];
    roomBoards[data.roomId]!.push(data.strokes);
    socket.to(data.roomId).emit("stroke-end", data);
  });

  socket.on("stroke-delete", (data) => {
    const threshold = 10;
    roomBoards[data.roomId] = (roomBoards[data.roomId] ?? []).filter(
      (stroke) => {
        const isNear = stroke.points.some((p) => {
          const dx = p.x - data.point.x;
          const dy = p.y - data.point.y;
          return dx * dx + dy * dy <= threshold * threshold;
        });
        return !isNear;
      },
    );
    socket.to(data.roomId).emit("stroke-delete", data.point);
  });

  //textbox
  socket.on("element-add", (data) => {
    roomElements[data.roomId] ??= [];
    const element: CanvasElement = {
      ...data.element,
      userId: socket.data.userId,
    };
    roomElements[data.roomId]!.push(element);
    socket.to(data.roomId).emit("element-add", element);
  });

  // update (covers textbox edit/font-size-change, shape move)
  socket.on("element-update", (data) => {
    const el = roomElements[data.roomId]?.find((e) => e.id === data.id);
    if (el) Object.assign(el, data.changes);
    socket
      .to(data.roomId)
      .emit("element-update", { id: data.id, changes: data.changes });
  });

  // delete (covers both)
  socket.on("element-delete", (data) => {
    roomElements[data.roomId] = (roomElements[data.roomId] ?? []).filter(
      (e) => e.id !== data.id,
    );
    socket.to(data.roomId).emit("element-delete", data.id);
  });
}

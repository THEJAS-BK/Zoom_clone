import { Server, Socket } from "socket.io";

const CURSOR_COLORS = [
  "#F87171", // red
  "#FB923C", // orange
  "#FACC15", // yellow
  "#4ADE80", // green
  "#60A5FA", // blue
  "#C084FC", // purple
];

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

const pendingLeaves: Record<string, Map<string, NodeJS.Timeout>> = {};

export function registerRoomHandler(
  socket: Socket,
  io: Server,
  activeRooms: Record<string, Set<string>>,
  roomUserInfo: Record<string, Record<string, { color: string; name: string }>>,
  roomMuteState: Record<
    string,
    Record<string, { videoMuted: boolean; audioMuted: boolean }>
  >,
) {
  socket.on("create-room", (roomId, callback) => {
    if (activeRooms[roomId]) {
      callback?.({ success: false, message: "Room already exist" });
      return;
    }
    socket.data.roomId = roomId;
    activeRooms[roomId] = new Set();
    activeRooms[roomId].add(socket.id);
    roomUserInfo[roomId] = {
      ...roomUserInfo[roomId],
      [socket.id]: {
        color: getUnusedCursorColor(roomId, roomUserInfo),
        name: socket.data.name,
      },
    };
    socket.join(roomId);
    callback?.({ success: true });
  });

  //join rooms logic
  socket.on("join-room", (roomId: string, callback) => {

    const userId=socket.data.userId;
    const pending=pendingLeaves[roomId]?.get(userId)
    if(pending){
      clearTimeout(pending)
      pendingLeaves[roomId]?.delete(userId)
    }


    if (!activeRooms[roomId]) {
      callback?.({ success: false, message: "Room dosent exist" });
      return;
    }
    roomUserInfo[roomId] = {
      ...roomUserInfo[roomId],
      [socket.id]: {
        color: getUnusedCursorColor(roomId, roomUserInfo),
        name: socket.data.name,
      },
    };

    socket.join(roomId);

    socket.emit(
      "existing-peers",
      [...activeRooms[roomId]]
        .filter((id) => id !== socket.id)
        .map((id) => ({
          socketId: id,
          name: io.sockets.sockets.get(id)?.data.name,
          videoMuted: roomMuteState[roomId]?.[id]?.videoMuted ?? true,
          audioMuted: roomMuteState[roomId]?.[id]?.audioMuted ?? true,
        })),
    );

    socket.data.roomId = roomId;
    activeRooms[roomId].add(socket.id);

    socket.to(roomId).emit("joined-user", {
      userId: socket.data.userId,
      name: socket.data.name,
      roomId,
      timeStamp: Date.now(),
      socketId: socket.id,
    });
    callback?.({ success: true });
  });

  //get username and userId
  socket.on("my-info", (callback) => {
    callback({
      userId: socket.data.userId,
      name: socket.data.name,
    });
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (!roomId || !activeRooms[roomId]) {
      console.log("roomId not found in sockets");
      return;
    }
    activeRooms[roomId].delete(socket.id);

    pendingLeaves[roomId] ??= new Map();

    const timeout = setTimeout(() => {
      socket.to(roomId).emit("user-left", socket.id);
      if (activeRooms[roomId] && activeRooms[roomId].size === 0) {
        delete activeRooms[roomId];
        delete roomMuteState[roomId]?.[socket.id];
      }
      pendingLeaves[roomId]?.delete(socket.data.userId);
    },3000);
    pendingLeaves[roomId].set(socket.data.userId, timeout);
  });


  socket.on("get-participants", (roomId: string) => {
    const memberIds = activeRooms[roomId] ?? new Set<string>();
    const names = [...memberIds].map((id) => {
      const memberSocket = io.sockets.sockets.get(id);
      return {
        socketId: id,
        userId: memberSocket?.data.userId,
        name: memberSocket?.data.name ?? "Unknown",
      };
    });

    socket.emit("participants-list", names);
  });
}

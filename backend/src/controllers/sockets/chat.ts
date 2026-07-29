import { Server, Socket } from "socket.io";

type RecieveMessage = {
  socketId: string;
  userId: string;
  name: string;
  textData: string;
  timeStamp: number;
};

const roomMessages: Record<string, RecieveMessage[]> = {};

export function registerChatInterfaceHandler(socket: Socket, io: Server) {
  socket.on("send-message", (roomId: string, Textdata: string) => {
    if (!roomMessages[roomId]) {
      roomMessages[roomId] = [];
    }

    const message: RecieveMessage = {
      userId: socket.data.userId,
      name: socket.data.name,
      textData: Textdata,
      socketId: socket.id,
      timeStamp: Date.now(),
    };

    roomMessages[roomId].push(message);
    io.to(roomId).emit("receive-message", message);
  });

  socket.on("initial-state", (roomId: string) => {
    socket.emit("initial-state", roomMessages[roomId] ?? []);
  });
}
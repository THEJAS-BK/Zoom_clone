import { socket } from "../../../services/socket";

export function connectSocket(maxAttempts = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const tryConnect = () => {
      attempt++;

      const onConnect = () => {
        cleanup();
        resolve();
      };
      const onError = (err: Error) => {
        cleanup();
        if (attempt >= maxAttempts) {
          reject(err);
          return;
        }
        setTimeout(tryConnect, attempt * 1000);
      };
      const cleanup = () => {
        socket.off("connect", onConnect);
        socket.off("connect_error", onError);
      };

      socket.once("connect", onConnect);
      socket.once("connect_error", onError);

      if (!socket.connected) socket.connect();
    };

    if (socket.connected) {
      resolve();
      return;
    }

    tryConnect();
  });
}
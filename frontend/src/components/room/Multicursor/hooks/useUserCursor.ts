import { useEffect, useMemo } from "react";

import { socket } from "../../../../services/socket";
function throttle<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let lastCall = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}

export function useUserCursor(
  roomId: string,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  camera: React.RefObject<{ x: number; y: number; scale: number }>,
  setRemoteCursors: React.Dispatch<
    React.SetStateAction<
      Record<string, { x: number; y: number; color: string; name: string }>
    >
  >,
) {
  const emitCursorMove = useMemo(
    () =>
      throttle((x: number, y: number) => {
        socket.emit("cursor-move", { roomId, x, y });
      }, 50),
    [roomId ],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onCursorMove = ({ userId, x, y, color, name }: any) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [userId]: { x, y, color, name },
      }));
    };

    const onUserLeft = (userId: string) => {
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    const handleCursorPos = (e: MouseEvent) => {
      const x = (e.clientX - camera.current.x) / camera.current.scale;
      const y = (e.clientY - camera.current.y) / camera.current.scale;
      emitCursorMove(x, y);
    };

    socket.on("cursor-move", onCursorMove);
    socket.on("user-left", onUserLeft);
    canvas.addEventListener("mousemove", handleCursorPos);

    return () => {
      socket.off("cursor-move", onCursorMove);
      socket.off("user-left", onUserLeft);
      canvas.removeEventListener("mousemove", handleCursorPos);
    };
  }, [emitCursorMove, canvasRef, camera, setRemoteCursors]);
}

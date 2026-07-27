import { useEffect } from "react";
import type { BoardImage, CanvasElement } from "../types";
import { socket } from "../../../../services/socket";

export function useImage(
  roomId: string,
  images: React.RefObject<BoardImage[]>,
  imageCache: React.RefObject<Map<string, HTMLImageElement>>,
  doRedraw: () => void,
) {
  useEffect(() => {
    const onElementAdd = (el: CanvasElement) => {
      if (el.type !== "image") return;
      images.current = [...images.current, el];
      doRedraw();
    };

    const onElementUpdate = ({
      id,
      changes,
    }: {
      id: string;
      changes: Partial<BoardImage>;
    }) => {
      images.current = images.current.map((img) =>
        img.id === id ? { ...img, ...changes } : img,
      );
      doRedraw();
    };

    const onElementDelete = (id: string) => {
      const stillExists = images.current.some((img) => img.id === id);
      if (!stillExists) return; // not an image id — ignore, some other hook handles it

      images.current = images.current.filter((img) => img.id !== id);
      imageCache.current.delete(id);
      doRedraw();
    };

    const onElementState = (elements: CanvasElement[]) => {
      images.current = elements.filter(
        (e): e is BoardImage => e.type === "image",
      );
      doRedraw();
    };

    socket.on("element-add", onElementAdd);
    socket.on("element-update", onElementUpdate);
    socket.on("element-delete", onElementDelete);
    socket.on("element-state", onElementState);

    return () => {
      socket.off("element-add", onElementAdd);
      socket.off("element-update", onElementUpdate);
      socket.off("element-delete", onElementDelete);
      socket.off("element-state", onElementState);
    };
  }, [doRedraw]);

  const deleteImage = (id: string) => {
    images.current = images.current.filter((img) => img.id !== id);
    imageCache.current.delete(id);
    socket.emit("element-delete", { roomId, id });
    doRedraw();
  };

  return { deleteImage };
}
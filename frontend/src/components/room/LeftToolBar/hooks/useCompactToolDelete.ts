import { useToolSettings } from "../../../../context/ToolBarLeftContext";
import { socket } from "../../../../services/socket";
export function useCompactToolDelete() {
  const {
    selectedEle,
    setSelectedEle,
    isOffline,
    shapesRef,
    linesRef,
    textBoxesRef,
    roomId,
    doRedrawRef,
    images,
  } = useToolSettings();

  const handleDelete = () => {
    const id = selectedEle?.id;
    console.log("here", selectedEle?.id);
    if (!id) return;

    if (shapesRef.current.some((s) => s.id === id)) {
      shapesRef.current = shapesRef.current.filter((s) => s.id !== id);
    } else if (linesRef.current.some((l) => l.id === id)) {
      linesRef.current = linesRef.current.filter((l) => l.id !== id);
    } else if (textBoxesRef.current.some((t) => t.id === id)) {
      textBoxesRef.current = textBoxesRef.current.filter((t) => t.id !== id);
    } else if (images.current.some((i) => i.id === id)) {
      images.current = images.current.filter((i) => i.id !== id);
    } else {
      return;
    }
    if (!isOffline) {
      socket.emit("element-delete", { roomId, id });
    }
    setSelectedEle(null);
    doRedrawRef.current?.();
  };
  return { handleDelete };
}

import { useToolSettings } from "../../../../context/ToolBarLeftContext";
import { socket } from "../../../../services/socket";
import type { BoardImage } from "../types";
export function useLayers() {
  const {
    selectedEle,
    shapesRef,
    linesRef,
    textBoxesRef,
    doRedrawRef,
    roomId,
    isOffline,
    images,
  } = useToolSettings();

  if (!selectedEle) return;

  const getAllSorted = () => {
    const all = [
      ...shapesRef.current.map((el) => ({ type: "shape" as const, el })),
      ...linesRef.current.map((el) => ({ type: "line" as const, el })),
      ...textBoxesRef.current.map((el) => ({ type: "textbox" as const, el })),
      ...images.current.map((el) => ({ type: "image" as const, el })),
    ];
    return all.sort((a, b) => (a.el.zIndex ?? 0) - (b.el.zIndex ?? 0));
  };

  const applyZIndex = (id: string, type: string, zIndex: number) => {
    if (type === "shape") {
      shapesRef.current = shapesRef.current.map((s) =>
        s.id === id ? { ...s, zIndex } : s,
      );
    } else if (type === "line") {
      linesRef.current = linesRef.current.map((l) =>
        l.id === id ? { ...l, zIndex } : l,
      );
    } else if (type === "textbox") {
      textBoxesRef.current = textBoxesRef.current.map((t) =>
        t.id === id ? { ...t, zIndex } : t,
      );
    } else if (type === "image") {
      images.current = images.current.map((i) =>
        i.id === id ? { ...i, zIndex } : i,
      );
    }
    if (isOffline) return;
    socket.emit("element-update", { roomId, id, changes: { zIndex } });
  };

  const finish = () => doRedrawRef.current?.();

  const bringToFront = () => {
    const all = getAllSorted();
    if (all.length === 0) return;
    const maxZ = all[all.length - 1].el.zIndex ?? 0;
    applyZIndex(selectedEle.id, selectedEle.type, maxZ + 1);
    finish();
  };

  const sendToBack = () => {
    const all = getAllSorted();
    if (all.length === 0) return;
    const minZ = all[0].el.zIndex ?? 0;
    applyZIndex(selectedEle.id, selectedEle.type, minZ - 1);
    finish();
  };

  const bringForward = () => {
    const all = getAllSorted();
    const idx = all.findIndex((item) => item.el.id === selectedEle.id);
    if (idx === -1 || idx === all.length - 1) return; // already on top
    const next = all[idx + 1];
    const myZ = all[idx].el.zIndex ?? 0;
    const nextZ = next.el.zIndex ?? 0;
    applyZIndex(selectedEle.id, selectedEle.type, nextZ);
    applyZIndex(next.el.id, next.type, myZ);
    finish();
  };

  const sendBackward = () => {
    const all = getAllSorted();
    const idx = all.findIndex((item) => item.el.id === selectedEle.id);
    if (idx <= 0) return;
    const prev = all[idx - 1];
    const myZ = all[idx].el.zIndex ?? 0;
    const prevZ = prev.el.zIndex ?? 0;
    applyZIndex(selectedEle.id, selectedEle.type, prevZ);
    applyZIndex(prev.el.id, prev.type, myZ);
    finish();
  };
  return {
    sendBackward,
    sendToBack,
    bringForward,
    bringToFront,
  };
}

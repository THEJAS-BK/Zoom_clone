import { useEffect } from "react";
import { socket } from "../../../../services/socket";
import type { RefObject } from "react";
import type { TextBox, CanvasElement,Shape,Line } from "../types";
import { useToolSettings } from "../../../../context/ToolBarLeftContext";
import { getNextZIndex } from "../tools/zIndex";
import { measureTextBox } from "../canvas";
export function useTextBox(
  roomId: string,
  camera: RefObject<{ x: number; y: number; scale: number }>,
  userId: string,
  color: string,
  textBoxesRef: React.RefObject<TextBox[]>,
  activeTextBox: React.RefObject<TextBox | null>,
  shapesRef: React.RefObject<Shape[]>,
  linesRef: React.RefObject<Line[]>,
  doRedraw: () => void,
) {
  const { fontSize,opacity, activeTool, textAlign, fontFamily, selectedEle } =
    useToolSettings();

  useEffect(() => {
    if (activeTool !== "mouse" || !selectedEle|| selectedEle.type !=="textbox") return;
    const textbox = textBoxesRef.current.find((t) => t.id === selectedEle?.id);
    if (!textbox) return;
    textbox.fontFamily = fontFamily;
    textbox.fontSize = fontSize;
    textbox.textAlign = textAlign;
    textbox.opacity=opacity;
    socket.emit("element-update", {
      roomId,
      id: textbox.id,
      changes: { fontFamily, fontSize, textAlign,opacity },
    });
    doRedraw();
  }, [selectedEle, fontFamily, fontSize, textAlign, opacity]);

  const placeTextBox = (clientX: number, clientY: number) => {
    const scale = camera.current?.scale ?? 1;
    const cx = camera.current?.x ?? 0;
    const cy = camera.current?.y ?? 0;
    const x = (clientX - cx) / scale;
    const y = (clientY - cy) / scale;

    activeTextBox!.current = {
      id: crypto.randomUUID(),
      type: "textbox",
      x,
      y,
      text: "",
      fontSize: fontSize,
      textAlign,
      fontFamily,
      color,
      userId: userId,
      zIndex: getNextZIndex(shapesRef, linesRef, textBoxesRef),
      opacity
    };
    doRedraw();
  };

  const updateTextBoxContent = (text: string) => {
  if (!activeTextBox.current) return;
  const tb = activeTextBox.current;

  const before = measureTextBox(tb.text, tb.fontSize, tb.fontFamily);
  const after = measureTextBox(text, tb.fontSize, tb.fontFamily);
  tb.x += (before.width - after.width) / 2;
  tb.y += (before.height - after.height) / 2;
  tb.text = text;

  const id = tb.id;
  const exists = textBoxesRef.current.some((b) => b.id === id);

  if (!exists) {
    const box: TextBox = { ...tb };
    textBoxesRef.current = [...textBoxesRef.current, box];
    socket.emit("element-add", { roomId, element: box });
  } else {
    textBoxesRef.current = textBoxesRef.current.map((b) =>
      b.id === id ? { ...b, text: tb.text, x: tb.x, y: tb.y } : b,
    );
    socket.emit("element-update", { roomId, id, changes: { text: tb.text, x: tb.x, y: tb.y } });
  }

  doRedraw();
};

  const finalizeTextBox = (text: string) => {
    if (!activeTextBox.current) return;
    const id = activeTextBox.current.id;

    if (!text.trim()) {
      if (textBoxesRef.current.some((b) => b.id === id)) {
        textBoxesRef.current = textBoxesRef.current.filter((b) => b.id !== id);
        socket.emit("element-delete", { roomId, id });
      }
      activeTextBox.current = null;
      doRedraw();
      return;
    }

    const box: TextBox = { ...activeTextBox.current, text };
    const exists = textBoxesRef.current.some((b) => b.id === id);

    textBoxesRef.current = exists
      ? textBoxesRef.current.map((b) => (b.id === id ? box : b))
      : [...textBoxesRef.current, box];

    socket.emit(
      exists ? "element-update" : "element-add",
      exists ? { roomId, id, changes: { text } } : { roomId, element: box },
    );

    activeTextBox.current = null;
    doRedraw();
  };

  // ---- socket listeners ----
  useEffect(() => {
    const onElementAdd = (el: CanvasElement) => {
      if (el.type !== "textbox") return;
      const exists = textBoxesRef.current.some((b) => b.id === el.id);
      textBoxesRef.current = exists
        ? textBoxesRef.current.map((b) => (b.id === el.id ? el : b))
        : [...textBoxesRef.current, el];
      doRedraw();
    };

    const onElementUpdate = ({
      id,
      changes,
    }: {
      id: string;
      changes: Partial<TextBox>;
    }) => {
      textBoxesRef.current = textBoxesRef.current.map((b) =>
        b.id === id ? { ...b, ...changes } : b,
      );
      doRedraw();
    };

    const onElementDelete = (id: string) => {
      textBoxesRef.current = textBoxesRef.current.filter((b) => b.id !== id);
      doRedraw();
    };

    const onElementState = (elements: CanvasElement[]) => {
      textBoxesRef.current = elements.filter(
        (e): e is TextBox => e.type === "textbox",
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
  }, [textAlign, fontFamily, fontSize, doRedraw]);

  return {
    placeTextBox,
    finalizeTextBox,
    updateTextBoxContent,
  };
}

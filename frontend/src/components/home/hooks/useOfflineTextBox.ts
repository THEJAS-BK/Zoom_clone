import { useEffect } from "react";
import type { RefObject } from "react";
import type { Line, Shape, TextBox } from "../../room/Multicursor/types.ts";
import { useToolSettings } from "../../../context/ToolBarLeftContext.tsx";
import { getNextZIndex } from "../../room/Multicursor/tools/zIndex.ts";

import { measureTextBox } from "../../room/Multicursor/canvas.ts";

export function useOfflineTextBox(
  camera: RefObject<{ x: number; y: number; scale: number }>,
  userId: string,
  color: string,
  textBoxesRef: React.RefObject<TextBox[]>,
  activeTextBox: React.RefObject<TextBox | null>,
  linesRef:React.RefObject<Line[]>,
  shapesRef:React.RefObject<Shape[]>,
  doRedraw: () => void,
) {
  const { fontSize, opacity, activeTool, textAlign, fontFamily, selectedEle } =
    useToolSettings();

  useEffect(() => {
    if (activeTool !== "mouse" || !selectedEle || selectedEle.type !== "textbox") return;
    const textbox = textBoxesRef.current.find((t) => t.id === selectedEle?.id);
    if (!textbox) return;
    textbox.fontFamily = fontFamily;
    textbox.fontSize = fontSize;
    textbox.textAlign = textAlign;
    textbox.opacity = opacity;
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
      opacity,
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
    } else {
      textBoxesRef.current = textBoxesRef.current.map((b) =>
        b.id === id ? { ...b, text: tb.text, x: tb.x, y: tb.y } : b,
      );
    }

    doRedraw();
  };

  const finalizeTextBox = (text: string) => {
    if (!activeTextBox.current) return;
    const id = activeTextBox.current.id;

    if (!text.trim()) {
      if (textBoxesRef.current.some((b) => b.id === id)) {
        textBoxesRef.current = textBoxesRef.current.filter((b) => b.id !== id);
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

    activeTextBox.current = null;
    doRedraw();
  };

  return {
    placeTextBox,
    finalizeTextBox,
    updateTextBoxContent,
  };
}
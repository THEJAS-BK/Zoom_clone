import type { BoardImage, CanvasElement, Line, Shape, TextBox } from "../../room/Multicursor/types";

function combineElements(
  linesRef: React.RefObject<Line[]>,
  textBoxesRef: React.RefObject<TextBox[]>,
  shapesRef: React.RefObject<Shape[]>,
  imagesRef?: React.RefObject<BoardImage[]>
): CanvasElement[] {
  return [
    ...linesRef.current,
    ...textBoxesRef.current,
    ...shapesRef.current,
    ...(imagesRef?.current ?? []),
  ];
}
export {combineElements}
import type { BoardImage, CanvasElement,Line, Shape, TextBox, } from "../../room/Multicursor/types";

export function distributeElements(
  elements: CanvasElement[],
  linesRef: React.RefObject<Line[]>,
  textBoxesRef: React.RefObject<TextBox[]>,
  shapesRef: React.RefObject<Shape[]>,
  imagesRef?: React.RefObject<BoardImage[]>
) {
  const lines: Line[] = [];
  const textBoxes: TextBox[] = [];
  const shapes: Shape[] = [];
  const images: BoardImage[] = [];

  for (const el of elements) {
    switch (el.type) {
      case "line":
        lines.push(el); 
        break;
      case "textbox":
        textBoxes.push(el); 
        break;
      case "shape":
        shapes.push(el);
        break;
      case "image":
        images.push(el); 
        break;
    }
  }

  linesRef.current = lines;
  textBoxesRef.current = textBoxes;
  shapesRef.current = shapes;
  if (imagesRef) imagesRef.current = images;
}
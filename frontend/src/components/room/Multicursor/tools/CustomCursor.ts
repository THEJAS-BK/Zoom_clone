const getCursorStyle = (tool: string | null) => {
  switch (tool) {
    case "pen":
      return "crosshair";
    case "eraser":
      return "cell";
    case "text":
      return "text";
    case "pan":
      return "grab";
    case "drag":
      return "grabbing";
    case "select":
      return "default";
    default:
      return "default";
  }
};

export {getCursorStyle}
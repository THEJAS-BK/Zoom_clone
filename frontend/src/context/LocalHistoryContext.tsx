import type {
  Stroke,
  Shape,
  Line,
  TextBox,
} from "../components/room/Multicursor/types";
import { createContext, useContext, useState, type RefObject } from "react";
import { socket } from "../services/socket";
import { useToolSettings } from "./ToolBarLeftContext";
type HistoryEntry =
  | { type: "stroke-delete"; stroke: Stroke }
  | { type: "shape-delete"; shape: Shape }
  | { type: "line-delete"; line: Line }
  | { type: "textbox-delete"; textBox: TextBox };

const HistoryContext = createContext<{
  pushUndo: (entry: HistoryEntry) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
} | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const { roomId, strokes, shapesRef, linesRef,isOffline, textBoxesRef, doRedrawRef } =
    useToolSettings();
  const [historyState, setHistoryState] = useState<{
    entries: HistoryEntry[];
    index: number;
  }>({ entries: [], index: -1 });

  const pushUndo = (entry: HistoryEntry) => {
    setHistoryState((prev) => {
      const trimmed = prev.entries.slice(0, prev.index + 1);
      return { entries: [...trimmed, entry], index: prev.index + 1 };
    });
  };
  // re-adds the deleted item back (used by undo)
  const restore = (entry: HistoryEntry) => {
    switch (entry.type) {
      case "stroke-delete":
        strokes.current = [...strokes.current, entry.stroke];
        if(!isOffline) {
         socket.emit("stroke-add", { stroke: entry.stroke, roomId });
        }
        break;
      case "shape-delete":
        shapesRef.current = [...shapesRef.current, entry.shape];
        if(!isOffline) {
         socket.emit("element-add", { element: entry.shape, roomId });
        }
        break;
      case "line-delete":
        linesRef.current = [...linesRef.current, entry.line];
        if(!isOffline) {
         socket.emit("element-add", { element: entry.line, roomId });
        }
        break;
      case "textbox-delete":
        textBoxesRef.current = [...textBoxesRef.current, entry.textBox];
        if(!isOffline) {
         socket.emit("element-add", { element: entry.textBox, roomId });
        }
        break;
    }
  };

  // removes it again (used by redo, re-applying the original delete)
  const reapplyDelete = (entry: HistoryEntry) => {
    switch (entry.type) {
      case "stroke-delete":
        strokes.current = strokes.current.filter((s) => s !== entry.stroke);
        if(!isOffline) {
         socket.emit("stroke-delete", { point: null, roomId }); // see note below
        }
        break;
      case "shape-delete":
        shapesRef.current = shapesRef.current.filter(
          (s) => s.id !== entry.shape.id,
        );
        if(!isOffline) {
         socket.emit("element-delete", { roomId, id: entry.shape.id });
        }
        break;
      case "line-delete":
        linesRef.current = linesRef.current.filter(
          (l) => l.id !== entry.line.id,
        );
        if(!isOffline) {
         socket.emit("element-delete", { roomId, id: entry.line.id });
        }
        break;
      case "textbox-delete":
        textBoxesRef.current = textBoxesRef.current.filter(
          (t) => t.id !== entry.textBox.id,
        );
        if(!isOffline) {
         socket.emit("element-delete", { roomId, id: entry.textBox.id });
        }
        break;
    }
  };

  const undo = () => {
    setHistoryState((prev) => {
      if (prev.index < 0) return prev;
      restore(prev.entries[prev.index]);
      return { ...prev, index: prev.index - 1 };
    });
    doRedrawRef.current?.();
  };

  const redo = () => {
    setHistoryState((prev) => {
      if (prev.index >= prev.entries.length - 1) return prev;
      const entry = prev.entries[prev.index + 1];
      reapplyDelete(entry);
      return { ...prev, index: prev.index + 1 };
    });
    doRedrawRef.current?.();
  };

  const canUndo = historyState.index >= 0;
  const canRedo = historyState.index < historyState.entries.length - 1;

  return (
    <HistoryContext.Provider
      value={{
        pushUndo,
        undo,
        redo,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return ctx;
};

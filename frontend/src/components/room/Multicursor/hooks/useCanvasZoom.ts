import React, { useEffect, useRef } from "react";
import { socket } from "../../../../services/socket";

export function useCanvasZoom(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  camera: React.RefObject<any>,
  onCameraChange: () => void,
  doRedraw: () => void,
  roomId: string,
) {
  const pinchState = useRef<{ distance: number; midX: number; midY: number } | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey) {
        const zoomAmount = e.deltaY * -0.001;
        const oldScale = camera.current.scale;
        const newScale = Math.min(Math.max(0.2, oldScale + zoomAmount), 5);

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldX = (mouseX - camera.current.x) / oldScale;
        const worldY = (mouseY - camera.current.y) / oldScale;
        camera.current.scale = newScale;
        camera.current.x = mouseX - worldX * newScale;
        camera.current.y = mouseY - worldY * newScale;
      } else if (e.shiftKey) {
        camera.current.x -= e.deltaY;
      } else {
        camera.current.y -= e.deltaY;
      }

      socket.emit("camera-update", camera.current, roomId);
      doRedraw();
      onCameraChange?.();
    };

    const getTouchDistance = (t0: Touch, t1: Touch) => {
      const dx = t0.clientX - t1.clientX;
      const dy = t0.clientY - t1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchMidpoint = (t0: Touch, t1: Touch, rect: DOMRect) => ({
      x: (t0.clientX + t1.clientX) / 2 - rect.left,
      y: (t0.clientY + t1.clientY) / 2 - rect.top,
    });

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const distance = getTouchDistance(e.touches[0], e.touches[1]);
        const { x, y } = getTouchMidpoint(e.touches[0], e.touches[1], rect);
        pinchState.current = { distance, midX: x, midY: y };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchState.current) {
        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const newDistance = getTouchDistance(e.touches[0], e.touches[1]);
        const { x: midX, y: midY } = getTouchMidpoint(e.touches[0], e.touches[1], rect);

        const oldScale = camera.current.scale;
        const scaleFactor = newDistance / pinchState.current.distance;
        const newScale = Math.min(Math.max(0.2, oldScale * scaleFactor), 5);

        // zoom centered on the pinch midpoint (same math as wheel+ctrl zoom)
        const worldX = (midX - camera.current.x) / oldScale;
        const worldY = (midY - camera.current.y) / oldScale;
        camera.current.scale = newScale;
        camera.current.x = midX - worldX * newScale;
        camera.current.y = midY - worldY * newScale;

        // also pan by however much the midpoint itself moved (two-finger drag)
        camera.current.x += midX - pinchState.current.midX;
        camera.current.y += midY - pinchState.current.midY;

        pinchState.current = { distance: newDistance, midX, midY };

        socket.emit("camera-update", camera.current, roomId);
        doRedraw();
        onCameraChange?.();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchState.current = null;
      }
    };

    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    wrapper.addEventListener("touchstart", handleTouchStart, { passive: false });
    wrapper.addEventListener("touchmove", handleTouchMove, { passive: false });
    wrapper.addEventListener("touchend", handleTouchEnd);
    wrapper.addEventListener("touchcancel", handleTouchEnd);
    return () => {
      wrapper.removeEventListener("wheel", handleWheel);
      wrapper.removeEventListener("touchstart", handleTouchStart);
      wrapper.removeEventListener("touchmove", handleTouchMove);
      wrapper.removeEventListener("touchend", handleTouchEnd);
      wrapper.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [onCameraChange, doRedraw]);
}
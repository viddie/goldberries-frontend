import { MapControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

import { useViewerStore } from "./useViewerStore";

const MARGIN = 40; // px margin around the room when zooming to fit
const ZOOM_SPEED = 1.15;

function getTouchDistance(t1, t2) {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getTouchMidpoint(t1, t2) {
  return {
    clientX: (t1.clientX + t2.clientX) / 2,
    clientY: (t1.clientY + t2.clientY) / 2,
  };
}

export function Controls() {
  const { invalidate, camera, size, gl } = useThree();
  const controlsRef = useRef();

  const cameraTarget = useViewerStore((s) => s.cameraTarget);
  const clearCameraTarget = useViewerStore((s) => s.clearCameraTarget);

  //#region Navigate to room
  useEffect(() => {
    if (!cameraTarget || !controlsRef.current) return;

    const { x, y, width, height } = cameraTarget;
    const centerX = x + width / 2;
    const centerY = y - height / 2;

    // Calculate zoom so the room fits with margin on the tightest axis
    const availableWidth = size.width - MARGIN * 2;
    const availableHeight = size.height - MARGIN * 2;
    const zoomX = availableWidth / width;
    const zoomY = availableHeight / height;
    const zoom = Math.min(zoomX, zoomY);

    camera.position.set(centerX, centerY, camera.position.z);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();

    const controls = controlsRef.current;
    controls.target.set(centerX, centerY, 0);
    controls.update();

    invalidate();
    clearCameraTarget();
  }, [cameraTarget, camera, size, invalidate, clearCameraTarget]);
  //#endregion

  //#region Zoom toward mouse position
  useEffect(() => {
    const canvas = gl.domElement;
    const onWheel = (e) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const oldZoom = camera.zoom;
      const factor = e.deltaY > 0 ? 1 / ZOOM_SPEED : ZOOM_SPEED;
      const newZoom = oldZoom * factor;

      if (newZoom === oldZoom) return;

      // Shift camera so the world point under the mouse stays fixed
      const dx = ndcX * (size.width / 2) * (1 / oldZoom - 1 / newZoom);
      const dy = ndcY * (size.height / 2) * (1 / oldZoom - 1 / newZoom);

      camera.position.x += dx;
      camera.position.y += dy;
      camera.zoom = newZoom;
      camera.updateProjectionMatrix();

      if (controlsRef.current) {
        controlsRef.current.target.x += dx;
        controlsRef.current.target.y += dy;
        controlsRef.current.update();
      }

      invalidate();
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [camera, gl, size, invalidate]);
  //#endregion

  //#region Pinch-to-zoom (touch)
  useEffect(() => {
    const canvas = gl.domElement;
    let prevDist = 0;

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        prevDist = getTouchDistance(e.touches[0], e.touches[1]);
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();

      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      if (prevDist === 0) {
        prevDist = dist;
        return;
      }

      const mid = getTouchMidpoint(e.touches[0], e.touches[1]);
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((mid.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((mid.clientY - rect.top) / rect.height) * 2 + 1;

      const oldZoom = camera.zoom;
      const factor = dist / prevDist;
      const newZoom = oldZoom * factor;
      prevDist = dist;

      if (newZoom === oldZoom) return;

      const dx = ndcX * (size.width / 2) * (1 / oldZoom - 1 / newZoom);
      const dy = ndcY * (size.height / 2) * (1 / oldZoom - 1 / newZoom);

      camera.position.x += dx;
      camera.position.y += dy;
      camera.zoom = newZoom;
      camera.updateProjectionMatrix();

      if (controlsRef.current) {
        controlsRef.current.target.x += dx;
        controlsRef.current.target.y += dy;
        controlsRef.current.update();
      }

      invalidate();
    };

    const onTouchEnd = () => {
      prevDist = 0;
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [camera, gl, size, invalidate]);
  //#endregion

  return (
    <MapControls
      ref={controlsRef}
      makeDefault
      enableRotate={false}
      enableZoom={false}
      screenSpacePanning
      panSpeed={1}
      onChange={invalidate}
    />
  );
}

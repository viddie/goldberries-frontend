import { MapControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

import { useViewerStore } from "./useViewerStore";

const MARGIN = 40; // px margin around the room when zooming to fit
const ZOOM_SPEED = 1.15;

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

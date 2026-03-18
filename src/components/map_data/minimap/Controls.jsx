import { MapControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

import { useMinimapStore } from "./useMinimapStore";

const MARGIN = 40; // px margin around the room when zooming to fit

export function Controls() {
  const { invalidate, camera, size } = useThree();
  const controlsRef = useRef();

  const cameraTarget = useMinimapStore((s) => s.cameraTarget);
  const clearCameraTarget = useMinimapStore((s) => s.clearCameraTarget);

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

  return (
    <MapControls
      ref={controlsRef}
      makeDefault
      enableRotate={false}
      screenSpacePanning
      zoomSpeed={2.0}
      panSpeed={1}
      onChange={invalidate}
    />
  );
}

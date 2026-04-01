import { useCallback, useState } from "react";
import { Vector3 } from "three";

import { useViewerStore } from "../useViewerStore";
import { LAYERS } from "../entity_definitions";

const _worldPos = new Vector3();

export function HighlightableEntity({ entity, position, highlightRadius = 14, children }) {
  const [hovered, setHovered] = useState(false);
  const selectObject = useViewerStore((s) => s.selectObject);
  const isSelected = useViewerStore((s) => s.selectedObject?.data === entity);

  const onPointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  }, []);

  const onPointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "auto";
  }, []);

  const onClick = useCallback(
    (e) => {
      const store = useViewerStore.getState();
      store.pruneClickedObjects(e.point, e.nativeEvent);
      if (useViewerStore.getState().clickedObjects.has(entity)) return;
      e.stopPropagation();
      // Compute bounds in world space to match world-space e.point used by pruneClickedObjects
      e.object.getWorldPosition(_worldPos);
      const r = highlightRadius;
      const bounds = {
        minX: _worldPos.x - r,
        maxX: _worldPos.x + r,
        minY: _worldPos.y - r,
        maxY: _worldPos.y + r,
      };
      selectObject(entity, LAYERS.IMPORTANT_ENTITIES, bounds);
    },
    [entity, selectObject, highlightRadius],
  );

  const showHighlight = hovered || isSelected;

  return (
    <group position={position}>
      {showHighlight && (
        <mesh position={[0, 0, -0.5]}>
          <circleGeometry args={[highlightRadius, 32]} />
          <meshBasicMaterial
            color={isSelected ? "#ffd700" : "#ffffff"}
            transparent
            depthWrite={false}
            opacity={isSelected ? 0.5 : 0.25}
          />
        </mesh>
      )}
      <mesh onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
        {children}
      </mesh>
    </group>
  );
}

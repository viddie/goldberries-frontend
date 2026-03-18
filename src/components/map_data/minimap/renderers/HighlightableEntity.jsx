import { useCallback, useState } from "react";

import { useMinimapStore } from "../useMinimapStore";
import { LAYERS } from "../entity_definitions";

export function HighlightableEntity({ entity, position, highlightRadius = 14, children }) {
  const [hovered, setHovered] = useState(false);
  const selectObject = useMinimapStore((s) => s.selectObject);
  const isSelected = useMinimapStore((s) => s.selectedObject?.data === entity);

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
      const store = useMinimapStore.getState();
      store.pruneClickedObjects(e.point);
      if (useMinimapStore.getState().clickedObjects.has(entity)) return;
      e.stopPropagation();
      const r = highlightRadius;
      const bounds = {
        minX: position[0] - r,
        maxX: position[0] + r,
        minY: position[1] - r,
        maxY: position[1] + r,
      };
      selectObject(entity, LAYERS.IMPORTANT_ENTITIES, bounds);
    },
    [entity, selectObject, position, highlightRadius],
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

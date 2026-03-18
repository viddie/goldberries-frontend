import { useMemo, useCallback } from "react";

import { usePixelTexture } from "../../usePixelTexture";
import { LAYERS } from "../../MapDataMinimap";
import { useMinimapStore } from "../useMinimapStore";

export function SilverBerryRenderer({ entity }) {
  const texture = usePixelTexture("/icons/silverberry.png");
  const selectEntity = useMinimapStore((s) => s.selectEntity);
  const position = useMemo(
    () => [entity.attributes.x, -entity.attributes.y, LAYERS.IMPORTANT_ENTITIES],
    [entity.attributes.x, entity.attributes.y],
  );
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      selectEntity(entity);
    },
    [entity, selectEntity],
  );

  return (
    <mesh position={position} onClick={handleClick}>
      <planeGeometry args={[18, 16]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

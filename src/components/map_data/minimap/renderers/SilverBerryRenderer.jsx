import { useMemo } from "react";

import { usePixelTexture } from "../../usePixelTexture";
import { LAYERS } from "../../MapDataMinimap";

export function SilverBerryRenderer({ entity }) {
  const texture = usePixelTexture("/icons/silverberry.png");
  const position = useMemo(
    () => [entity.attributes.x, -entity.attributes.y, LAYERS.IMPORTANT_ENTITIES],
    [entity.attributes.x, entity.attributes.y],
  );

  return (
    <mesh position={position}>
      <planeGeometry args={[18, 16]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

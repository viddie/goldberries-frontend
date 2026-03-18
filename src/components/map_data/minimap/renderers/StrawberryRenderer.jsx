import { useMemo } from "react";

import { usePixelTexture } from "../../usePixelTexture";
import { LAYERS } from "../../MapDataMinimap";

export function StrawberryRenderer({ entity }) {
  const moon = entity.attributes.moon;
  const winged = entity.attributes.winged;

  const path = moon
    ? "/icons/moonberry.png"
    : winged
      ? "/icons/winged-strawberry.png"
      : "/icons/strawberry.png";
  const texture = usePixelTexture(path);
  const position = useMemo(
    () => [entity.attributes.x, -entity.attributes.y, LAYERS.IMPORTANT_ENTITIES],
    [entity.attributes.x, entity.attributes.y],
  );

  const size = moon ? [24, 16] : winged ? [40, 24] : [18, 16];

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

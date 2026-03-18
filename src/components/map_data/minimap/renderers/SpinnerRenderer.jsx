import { useMemo } from "react";

import { usePixelTexture } from "../../usePixelTexture";
import { LAYERS } from "../../MapDataMinimap";

export function SpinnerRenderer({ entity }) {
  const path = "/icons/game/spinner.png";
  const texture = usePixelTexture(path);
  const position = useMemo(
    () => [entity.attributes.x, -entity.attributes.y, LAYERS.ENTITIES],
    [entity.attributes.x, entity.attributes.y],
  );

  return (
    <mesh position={position}>
      <planeGeometry args={[24, 24]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

import { useMemo } from "react";

import { usePixelTexture } from "../../usePixelTexture";
import { LAYERS } from "../entity_definitions";

import { HighlightableEntity } from "./HighlightableEntity";

export function GoldenBerryRenderer({ entity }) {
  const winged = entity.attributes.winged;
  const path = winged ? "/icons/winged-goldenberry.png" : "/icons/goldenberry.png";
  const size = winged ? [40, 24] : [18, 16];
  const texture = usePixelTexture(path);
  const position = useMemo(
    () => [entity.attributes.x, -entity.attributes.y, LAYERS.IMPORTANT_ENTITIES],
    [entity.attributes.x, entity.attributes.y],
  );

  return (
    <HighlightableEntity entity={entity} position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </HighlightableEntity>
  );
}

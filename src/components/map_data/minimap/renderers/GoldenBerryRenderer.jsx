import { useMemo } from "react";

import { usePixelTexture } from "../../usePixelTexture";
import { LAYERS } from "../entity_definitions";

import { HighlightableEntity } from "./HighlightableEntity";

export function GoldenBerryRenderer({ entity }) {
  const winged = entity.attributes.winged;
  const path = winged ? "/icons/winged-goldenberry.png" : "/icons/goldenberry.png";
  const texture = usePixelTexture(path);
  const position = useMemo(
    () => [entity.attributes.x, -entity.attributes.y, LAYERS.IMPORTANT_ENTITIES],
    [entity.attributes.x, entity.attributes.y],
  );

  return (
    <HighlightableEntity entity={entity} position={position}>
      <planeGeometry args={[18, 16]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </HighlightableEntity>
  );
}

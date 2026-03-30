import { useMemo } from "react";

import { usePixelTexture } from "../../usePixelTexture";
import { LAYERS } from "../entity_definitions";

import { HighlightableEntity } from "./HighlightableEntity";

export function RainbowBerryRenderer({ entity }) {
  const texture = usePixelTexture("/icons/rainbowberry.png");
  const position = useMemo(
    () => [entity.attributes.x, -entity.attributes.y, LAYERS.IMPORTANT_ENTITIES],
    [entity.attributes.x, entity.attributes.y],
  );

  return (
    <HighlightableEntity entity={entity} position={position}>
      <planeGeometry args={[18, 21]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </HighlightableEntity>
  );
}

import { useMemo } from "react";

import { usePixelTexture } from "../../usePixelTexture";
import { LAYERS } from "../entity_definitions";

import { HighlightableEntity } from "./HighlightableEntity";

export function CassetteRenderer({ entity }) {
  const texture = usePixelTexture("/icons/cassette-crisp.png");
  const position = useMemo(
    () => [entity.attributes.x, -entity.attributes.y, LAYERS.IMPORTANT_ENTITIES],
    [entity.attributes.x, entity.attributes.y],
  );

  return (
    <HighlightableEntity entity={entity} position={position}>
      <planeGeometry args={[16, 16]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </HighlightableEntity>
  );
}

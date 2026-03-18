import { useMemo } from "react";

import { usePixelTexture } from "../../usePixelTexture";
import { LAYERS } from "../entity_definitions";

import { InstancedPlane } from "./InstancedPlane";

export function SpinnerRenderer({ entities }) {
  const texture = usePixelTexture("/icons/game/spinner.png");

  const entries = useMemo(
    () =>
      entities.map((e) => ({
        x: e.attributes.x,
        y: -e.attributes.y,
        z: LAYERS.COMMON_ENTITIES,
        scaleX: 24,
        scaleY: 24,
      })),
    [entities],
  );

  return <InstancedPlane entries={entries} texture={texture} />;
}

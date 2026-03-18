import { useMemo } from "react";

import { usePixelTexture } from "../../usePixelTexture";
import { LAYERS } from "../../MapDataMinimap";

const PATHS = {
  spikesUp: "spike_up.png",
  spikesDown: "spike_down.png",
  spikesLeft: "spike_left.png",
  spikesRight: "spike_right.png",
};

const OFFSETS = {
  spikesUp: [4, 4],
  spikesDown: [4, -4],
  spikesLeft: [-4, -4],
  spikesRight: [4, -4],
};

export function SpikeRenderer({ entity }) {
  const path = `/icons/game/${PATHS[entity.name]}`;
  const texture = usePixelTexture(path);
  const position = useMemo(
    () => [
      entity.attributes.x + OFFSETS[entity.name][0],
      -entity.attributes.y + OFFSETS[entity.name][1],
      LAYERS.ENTITIES,
    ],
    [entity.attributes.x, entity.attributes.y],
  );

  return (
    <mesh position={position}>
      <planeGeometry args={[8, 8]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

import { useMemo } from "react";

import { usePixelTexture } from "../../usePixelTexture";
import { LAYERS } from "../entity_definitions";

import { InstancedPlane } from "./InstancedPlane";

const PATHS = {
  spikesUp: "spike_up.png",
  spikesDown: "spike_down.png",
  spikesLeft: "spike_left.png",
  spikesRight: "spike_right.png",
};

const OFFSETS = {
  spikesUp: [4, 3],
  spikesDown: [4, -3],
  spikesLeft: [-3, -4],
  spikesRight: [3, -4],
};

const HORIZONTAL = new Set(["spikesUp", "spikesDown"]);

const spikeAlts = {
  "VivHelper/RainbowSpikesUp": "spikesUp",
  "VivHelper/RainbowSpikesDown": "spikesDown",
  "VivHelper/RainbowSpikesLeft": "spikesLeft",
  "VivHelper/RainbowSpikesRight": "spikesRight",
};

export function SpikeRenderer({ entities }) {
  let name = entities[0].name;
  if (spikeAlts[name]) {
    name = spikeAlts[name];
  }
  const texture = usePixelTexture(`/icons/game/${PATHS[name]}`);
  const offset = OFFSETS[name];
  const isHorizontal = HORIZONTAL.has(name);

  const entries = useMemo(
    () =>
      entities.flatMap((e) => {
        const span = isHorizontal ? (e.attributes.width ?? 8) : (e.attributes.height ?? 8);
        const count = Math.max(1, Math.floor(span / 8));
        const results = [];
        for (let i = 0; i < count; i++) {
          results.push({
            x: e.attributes.x + offset[0] + (isHorizontal ? i * 8 : 0),
            y: -e.attributes.y + offset[1] - (isHorizontal ? 0 : i * 8),
            z: LAYERS.COMMON_ENTITIES - 1,
            scaleX: 8,
            scaleY: 8,
          });
        }
        return results;
      }),
    [entities, offset, isHorizontal],
  );

  return <InstancedPlane entries={entries} texture={texture} />;
}

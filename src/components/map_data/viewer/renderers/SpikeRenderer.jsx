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

const TILE_SIZE = 8; // used only for the tiling step (i * 8) along the repeat axis
// True sprite sizes. Each sprite has transparent padding baked in on one edge, so simply
// rendering at the true size with the original 8px-tile offsets already produces the correct
// lean on the intended edge — the padding absorbs the rest invisibly.
const REPEAT_SPRITE_SIZE = 10; // true size along the axis spikes repeat along
const PERP_SPRITE_SIZE = 9; // true size along the perpendicular axis

// The perpendicular size grew by 1 (8 -> 9), an odd delta — centering it as-is would split
// that extra pixel evenly and shift the mounting edge (the side flush with the surface the
// spike is attached to) by half a pixel. Shifting the perpendicular offset by half the delta,
// away from the mounting edge, keeps that edge fixed and puts the whole extra pixel on the tip.
const PERP_OFFSET_SHIFT = (PERP_SPRITE_SIZE - TILE_SIZE) / 2;

const OFFSETS = {
  spikesUp: [4, 3 + PERP_OFFSET_SHIFT],
  spikesDown: [4, -3 - PERP_OFFSET_SHIFT],
  spikesLeft: [-3 - PERP_OFFSET_SHIFT, -4],
  spikesRight: [3 + PERP_OFFSET_SHIFT, -4],
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
  const scaleX = isHorizontal ? REPEAT_SPRITE_SIZE : PERP_SPRITE_SIZE;
  const scaleY = isHorizontal ? PERP_SPRITE_SIZE : REPEAT_SPRITE_SIZE;

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
            scaleX,
            scaleY,
          });
        }
        return results;
      }),
    [entities, offset, isHorizontal, scaleX, scaleY],
  );

  return <InstancedPlane entries={entries} texture={texture} />;
}

import {
  GoldenBerryRenderer,
  SilverBerryRenderer,
  SpikeRenderer,
  SpinnerRenderer,
  StrawberryRenderer,
} from "./renderers";

export const LAYERS = {
  BACKGROUND: 0,
  SOLIDS: 10,
  COMMON_ENTITIES: 15,
  ENTITIES: 20,
  IMPORTANT_ENTITIES: 30,
  UI: 50,
};

//#region Renderers
// These are entities that need special rendering
export const IndividualEntityMap = {
  goldenBerry: GoldenBerryRenderer,
  "CollabUtils2/SilverBerry": SilverBerryRenderer,
  strawberry: StrawberryRenderer,
  "DSidesHelper/TeleportMoonBerry": StrawberryRenderer,
};

// These are common entities that need special rendering but can be batched together
export const BatchedEntityMap = {
  spikesUp: SpikeRenderer,
  spikesDown: SpikeRenderer,
  spikesLeft: SpikeRenderer,
  spikesRight: SpikeRenderer,
  spinner: SpinnerRenderer,
  "FrostHelper/IceSpinner": SpinnerRenderer,
};

// These are entities that should be rendered as simple shapes since we don't have textures for everything.
// Each entity has a position and size, and we also provide the color to render it with.
export const SimpleShapeMap = {
  //#region Solids
  floatySpaceBlock: { color: "white", name: "MoonBlock" },
  swapBlock: { color: "orange", name: "S" },
  zipMover: { color: "orange", name: "Z" },
  crumbleBlock: {
    color: "white",
    name: "CrumbleBlock",
    height: (attr) => (attr.height !== 0 ? attr.height : 8),
  },
  dreamBlock: { color: "#000000", name: "DreamBlock" },
  switchGate: { color: "#00a6ff", name: "SwitchGate" },
  //#endregion

  //#region Semi-Solids
  jumpThru: { color: "orange", height: 4, name: "JumpThrough" },
  //#endregion

  //#region Gameplay Elements
  refill: { color: (attr) => (attr.twoDash ? "#ff4be7" : "#5eff5e"), width: 8, height: 8 },
  lightning: { color: "yellow", name: "Lightning", depth: LAYERS.ENTITIES - 1 },
  spring: { color: "#c96800", name: "Spring", anchorX: "center", anchorY: "bottom", width: 16, height: 6 },
  touchSwitch: {
    color: "#00a6ff",
    name: "TouchSwitch",
    anchorX: "center",
    anchorY: "center",
    width: 10,
    height: 10,
  },
  flingBird: { color: "#00a6ff", name: "FlingBird", shape: "circle", radius: 16 },
  //#endregion

  //#region Triggers
  seekerBarrier: { color: "white", name: "SeekerBarrier", outline: "dashed" },
  //#endregion

  //#region Room Markers
  player: { color: "red", width: 8, height: 10, name: "Respawn", anchorX: "center", anchorY: "bottom" },
  towerviewer: {
    color: "#6b6b6b",
    width: 8,
    height: 10,
    name: "TowerViewer",
    anchorX: "center",
    anchorY: "bottom",
  },
  //#endregion
};

//#region Derived Definitions
SimpleShapeMap.wallSpringLeft = {
  ...SimpleShapeMap.spring,
  anchorX: "left",
  anchorY: "center",
  height: 16,
  width: 6,
};
SimpleShapeMap.wallSpringRight = {
  ...SimpleShapeMap.spring,
  anchorX: "right",
  anchorY: "center",
  height: 16,
  width: 6,
};
//#endregion

// These entities are either purely decorative or otherwise not related to gameplay
export const IgnoreUnhandled = new Set(["floatingDebris", "soundSource"]);
//#endregion

//#region Collectibles
export const COLLECTIBLE_DEFS = [
  {
    name: "Golden Berry",
    entityNames: ["goldenBerry"],
    match: (attr) => !attr.winged,
  },
  {
    name: "Winged Golden Berry",
    entityNames: ["goldenBerry"],
    match: (attr) => !!attr.winged,
  },
  {
    name: "Cassette",
    entityNames: ["cassette"],
    match: () => true,
  },
  {
    name: "Strawberry",
    entityNames: ["strawberry"],
    match: (attr) => !attr.moon && !attr.winged,
  },
  {
    name: "Moon Berry",
    entityNames: ["strawberry", "DSidesHelper/TeleportMoonBerry"],
    match: (attr) => !!attr.moon && !attr.winged,
  },
  {
    name: "Winged Strawberry",
    entityNames: ["strawberry"],
    match: (attr) => !attr.moon && !!attr.winged,
  },
];

export function extractCollectibles(mapData) {
  const levelsNode = mapData.children?.find((c) => c.name === "levels");
  if (!levelsNode) return [];

  const results = [];

  for (const level of levelsNode.children) {
    const roomName = level.attributes?.name ?? "?";
    const entitiesNode = level.children?.find((c) => c.name === "entities");
    if (!entitiesNode) continue;

    for (const entity of entitiesNode.children) {
      for (const def of COLLECTIBLE_DEFS) {
        if (def.entityNames.some((name) => name === entity.name) && def.match(entity.attributes || {})) {
          results.push({
            name: def.name,
            room: roomName,
            id: entity.attributes?.id ?? "?",
            x: entity.attributes?.x ?? 0,
            y: entity.attributes?.y ?? 0,
            entity,
          });
          break;
        }
      }
    }
  }

  return results;
}
//#endregion

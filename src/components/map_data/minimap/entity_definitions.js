import {
  CrystalHeartRenderer,
  GoldenBerryRenderer,
  LargeBlockContentRenderer,
  MoveBlockContentRenderer,
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
  crystalHeart: CrystalHeartRenderer,
  "MaxHelpingHand/ReskinnableCrystalHeart": CrystalHeartRenderer,
};

// These are common entities that need special rendering but can be batched together
export const BatchedEntityMap = {
  spikesUp: SpikeRenderer,
  spikesDown: SpikeRenderer,
  spikesLeft: SpikeRenderer,
  spikesRight: SpikeRenderer,
  spinner: SpinnerRenderer,
  "FrostHelper/IceSpinner": SpinnerRenderer,
  "VivHelper/CustomSpinner": SpinnerRenderer,
};

// These are entities that should be rendered as simple shapes since we don't have textures for everything.
// Each entity has a position and size, and we also provide the color to render it with.
export const SimpleShapeMap = {};
const ssm = SimpleShapeMap;

//#region Solids
ssm.floatySpaceBlock = { color: "white", name: "MoonBlock" };
ssm.swapBlock = { color: "orange", name: "S" };
ssm.zipMover = { color: "orange", name: "Z" };
ssm.fallingBlock = { color: "#12fffb", name: "F" };
ssm.crumbleBlock = { color: "#12fffb", name: "C" };
ssm["ShroomHelper/CrumbleBlockOnTouch"] = {
  ...ssm.crumbleBlock,
  name: "(C)",
};
ssm["MaxHelpingHand/CustomizableCrumblePlatform"] = ssm.crumbleBlock;
ssm.dashBlock = { color: "#12fffb", name: "D" };
ssm.dreamBlock = { color: "#777777", name: "DreamBlock" };
ssm.switchGate = { color: "#00a6ff", name: "SwitchGate" };
ssm["MaxHelpingHand/FlagSwitchGate"] = ssm.switchGate;
ssm.introCrusher = { ...ssm.switchGate, name: "IntroCrusher" };
ssm["VivHelper/FlagIntroCrusher"] = ssm.introCrusher;
ssm.moveBlock = { color: "#9400ae", renderer: MoveBlockContentRenderer };
//#endregion

//#region Semi-Solids
ssm.jumpThru = { color: "orange", height: 5, name: "JumpThrough" };
ssm["VivHelper/CrumbleJumpThru"] = {
  ...ssm.jumpThru,
  name: "CrumbleJumpThrough",
};
ssm["MaxHelpingHand/SidewaysJumpThru"] = {
  color: "orange",
  width: 5,
  name: (attr) => (attr.left ? "Left" : "Right") + "JumpThrough",
};
ssm["MaxHelpingHand/AttachedSidewaysJumpThru"] = ssm["MaxHelpingHand/SidewaysJumpThru"];
ssm["MaxHelpingHand/UpsideDownJumpThru"] = {
  ...ssm.jumpThru,
  name: "DownJumpThrough",
};
ssm["VortexHelper/AttachedJumpThru"] = ssm.jumpThru;
//#endregion

ssm.cloud = {
  color: (attr) => (attr.fragile ? "#f27dff" : "#d7f2ff"),
  height: 5,
  width: (attr) => (attr.small ? 26 : 32),
  name: "Cloud",
};
//#endregion

//#region Gameplay Elements
ssm.refill = {
  color: (attr) => (attr.twoDash ? "#ff4be7" : "#5eff5e"),
  width: 8,
  height: 8,
  name: (attr) => (attr.oneUse ? "(Refill)" : "Refill"),
};
ssm["MaxHelpingHand/CustomizableRefill"] = ssm.refill;
ssm.lightning = { color: "yellow", name: "Lightning", depth: LAYERS.ENTITIES - 1 };

ssm.spring = { color: "#c96800", name: "Spring", anchorX: "center", anchorY: "bottom", width: 16, height: 6 };
ssm["MaxHelpingHand/CustomDashRefillSpring"] = {
  ...ssm.spring,
  color: "#16bd00",
  name: "CustomDashRefillSpring",
};
ssm.wallSpringLeft = {
  ...ssm.spring,
  anchorX: "left",
  anchorY: "center",
  height: 16,
  width: 6,
};
ssm["FrostHelper/SpringLeft"] = ssm.wallSpringLeft;
ssm["MaxHelpingHand/CustomDashRefillSpringLeft"] = {
  ...ssm.wallSpringLeft,
  color: "#16bd00",
  name: "CustomDashRefillSpring",
};
ssm.wallSpringRight = {
  ...ssm.spring,
  anchorX: "right",
  anchorY: "center",
  height: 16,
  width: 6,
};
ssm["MaxHelpingHand/CustomDashRefillSpringRight"] = {
  ...ssm.wallSpringRight,
  color: "#16bd00",
  name: "CustomDashRefillSpring",
};
ssm["FrostHelper/SpringRight"] = ssm.wallSpringRight;
ssm["FrostHelper/SpringFloor"] = ssm.spring;

ssm.touchSwitch = {
  color: "#00a6ff",
  name: "TouchSwitch",
  anchorX: "center",
  anchorY: "center",
  width: 10,
  height: 10,
};
ssm["MaxHelpingHand/FlagTouchSwitch"] = ssm.touchSwitch;
ssm["MaxHelpingHand/MovingFlagTouchSwitch"] = ssm.touchSwitch;

ssm.flingBird = { color: "#00a6ff", name: "FlingBird", shape: "circle", radius: 16 };
ssm.badelineBoost = { color: "#cc00ff", name: "BadelineBoost", shape: "circle", radius: 8 };
ssm.booster = {
  color: (attr) => (attr.red ? "#ff3e3e" : "#31ff7d"),
  name: "Bubble",
  shape: "circle",
  radius: 10,
};
ssm.infiniteStar = {
  color: "yellow",
  name: "Feather",
  width: 20,
  height: 20,
  anchorX: "center",
  anchorY: "center",
};
//#endregion

//#region Triggers
ssm.seekerBarrier = { color: "white", name: "SeekerBarrier", outline: "dashed" };
//#endregion

//#region Large Background Entities
ssm.fakeWall = {
  color: "#888888",
  opacity: 0.01,
  outline: "dashed",
  depth: LAYERS.SOLIDS + 1,
  name: "FakeWall",
  renderer: LargeBlockContentRenderer,
};
ssm.blockField = {
  ...ssm.fakeWall,
  name: "BlockField",
};
ssm.exitBlock = {
  ...ssm.fakeWall,
  name: "ExitBlock",
};
ssm.invisibleBarrier = {
  ...ssm.fakeWall,
  name: "InvisibleBarrier",
};
ssm.coverupWall = {
  ...ssm.fakeWall,
  name: "CoverupWall",
};
ssm["FancyTileEntities/FancyFakeWall"] = ssm.fakeWall;
ssm["MaxHelpingHand/FlagExitBlock"] = ssm.exitBlock;
ssm["XaphanHelper/Liquid"] = {
  color: (attr) =>
    attr.liquidType === "lava" ? "#ff4000" : attr.liquidType === "acid" ? "#0066ff" : "#0066ff",
  opacity: 0.1,
  outline: "dashed",
  depth: LAYERS.SOLIDS + 1,
  name: (attr) => (attr.liquidType === "lava" ? "Lava" : attr.liquidType === "acid" ? "Acid" : "Water"),
  renderer: LargeBlockContentRenderer,
};
//#endregion

//#region Room Markers
ssm.player = { color: "red", width: 8, height: 10, name: "Respawn", anchorX: "center", anchorY: "bottom" };
ssm.towerviewer = {
  color: "#6b6b6b",
  width: 8,
  height: 10,
  name: "TowerViewer",
  anchorX: "center",
  anchorY: "bottom",
};
ssm.summitcheckpoint = {
  color: "#ffffff",
  width: 8,
  height: 16,
  name: (attr) => "Flag " + attr.number,
  anchorX: "center",
  anchorY: "top",
};
ssm.checkpoint = {
  color: "#ffffff",
  width: 20,
  height: 24,
  anchorX: "center",
  anchorY: "bottom",
  name: "Checkpoint",
};
//#endregion

// These entities are either purely decorative or otherwise not related to gameplay
export const IgnoreUnhandled = {
  importantTriggers: new Set([
    "everest/changeInventoryTrigger",
    "DJMapHelper/maxDashesTrigger",
    "FrostHelper/NoMovementTrigger",
    "vitellary/nodashtrigger",
    "VivHelper/BasicInstantTeleportTrigger",
    "VivHelper/ITPT1Way",
    "VivHelper/TeleportTarget",
    "ContortHelper/MomentumModifierTrigger",
  ]),
  variantTriggers: new Set([
    "ExtendedVariantMode/IntegerExtendedVariantTrigger",
    "ShroomHelper/TimeModulationTrigger",
    "ExtendedVariantMode/FloatExtendedVariantFadeTrigger",
    "ExtendedVariantMode/BooleanExtendedVariantTrigger",
  ]),
  miscGameplayTriggers: new Set([
    "changeRespawnTrigger",
    "killbox",
    "SorbetHelper/FlagToggledKillbox",
    "spawnFacingTrigger",
    "everest/crystalShatterTrigger",
    "CherryHelper/PlayerStateChange",
  ]),
  flagTriggers: new Set([
    "everest/flagTrigger",
    "FlaglinesAndSuch/FlagIfFlag",
    "YetAnotherHelper/FlagKillBox",
    "EeveeHelper/FlagToggleModifier",
    "VivHelper/TimedFlagTrigger",
    "vitellary/triggertrigger",
    "EeveeHelper/FlagGateContainer",
    "vitellary/flagsequencecontroller",
  ]),
  camera: new Set([
    "everest/smoothCameraOffsetTrigger",
    "cameraOffsetTrigger",
    "cameraTargetTrigger",
    "MaxHelpingHand/CameraOffsetBorder",
    "MaxHelpingHand/FlagToggleCameraTargetTrigger",
    "MaxHelpingHand/FlagToggleCameraOffsetTrigger",
    "MaxHelpingHand/CameraCatchupSpeedTrigger",
    "MaxHelpingHand/FlagToggleSmoothCameraOffsetTrigger",
    "lookoutBlocker",
    "VivHelper/InstantCatchupTrigger",
    "AvBdayHelper/FadeCameraAngleTrigger",
  ]),
  dialogTriggers: new Set([
    "everest/dialogTrigger",
    "minitextboxTrigger",
    "DJMapHelper/talkToBadelineTrigger",
    "MaxHelpingHand/CustomCh3Memo",
    "luaCutscenes/luaCutsceneTrigger",
    "VivHelper/ConfettiTrigger",
  ]),
  other: new Set([
    "floatingDebris",
    "soundSource",
    "resortLantern",
    "cobweb",
    "clothesline",
    "summitcloud",
    "lightbeam",
    "moonGlitchBackgroundTrigger",
    "PrismaticHelper/StylegroundsPanel",
    "MaxHelpingHand/RainbowSpinnerColorController",
    "LunaticHelper/InvisibleLightSource",
    "EeveeHelper/SMWTrack",
    "CommunalHelper/MusicParamTrigger",
    "FrostHelper/BloomColorTrigger",
    "lightFadeTrigger",
    "ExtendedVariantMode/ColorGradeTrigger",
    "MaxHelpingHand/SetFlagOnSpawnController",
    "musicFadeTrigger",
    "musicTrigger",
    "vitellary/editdepthtrigger",
    "ContortHelper/RandomSoundTrigger",
    "VivHelper/ActivateCPP",
    "VivHelper/CPP",
    "VivHelper/CustomLightbeam",
    "MaxHelpingHand/ColorGradeFadeTrigger",
    "bloomFadeTrigger",
    "ContortHelper/BurstEffect",
    "VivHelper/GoldenBerryToFlag",
  ]),
};

//#endregion

/**
 * Checks if a room should be hidden in anti-spoiler mode.
 * A room is hidden if it contains a "VivHelper/HideRoomInMap" entity.
 */
export function isRoomHidden(room) {
  return room.entities?.some((e) => e.name === "VivHelper/HideRoomInMap") ?? false;
}

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

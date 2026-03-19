import {
  CrystalHeartRenderer,
  GoldenBerryRenderer,
  LargeBlockContentRenderer,
  MiniHeartRenderer,
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
  "SpringCollab2020/returnBerry": StrawberryRenderer,
  crystalHeart: CrystalHeartRenderer,
  "MaxHelpingHand/ReskinnableCrystalHeart": CrystalHeartRenderer,
  "CollabUtils2/MiniHeart": MiniHeartRenderer,
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
  "SpringCollab2020/RetractSpinner": SpinnerRenderer,
};

// These are entities that should be rendered as simple shapes since we don't have textures for everything.
// Each entity has a position and size, and we also provide the color to render it with.
export const SimpleShapeMap = {};
const ssm = SimpleShapeMap;
const movingSolidOpacity = 0.5;

//#region Solids
ssm.floatySpaceBlock = { color: "white", name: "MoonBlock", opacity: movingSolidOpacity };
ssm["SpringCollab2020/floatierSpaceBlock"] = { ...ssm.floatySpaceBlock, name: "FloatierMoonBlock" };

ssm.swapBlock = { color: "orange", name: "S", opacity: movingSolidOpacity };
ssm.zipMover = { color: "orange", name: "Z", opacity: movingSolidOpacity };
ssm.fallingBlock = { color: "#12fffb", name: "F", opacity: movingSolidOpacity };
ssm.crumbleBlock = { color: "#12fffb", name: "C", opacity: movingSolidOpacity };
ssm["ShroomHelper/CrumbleBlockOnTouch"] = {
  ...ssm.crumbleBlock,
  name: "(C)",
};
ssm["MaxHelpingHand/CustomizableCrumblePlatform"] = ssm.crumbleBlock;
ssm["SpringCollab2020/safeRespawnCrumble"] = {
  ...ssm.crumbleBlock,
  name: "SafeRespawnCrumble",
};

ssm.dashBlock = { color: "#12fffb", name: "D", opacity: movingSolidOpacity };
ssm.crushBlock = { color: "#285aff", name: "Kevin", opacity: movingSolidOpacity };

ssm.dreamBlock = { color: "#777777", name: "DreamBlock", opacity: movingSolidOpacity };
ssm.switchGate = { color: "#00a6ff", name: "SwitchGate", opacity: movingSolidOpacity };
ssm["MaxHelpingHand/FlagSwitchGate"] = ssm.switchGate;
ssm["SpringCollab2020/FlagSwitchGate"] = ssm.switchGate;
ssm.introCrusher = { ...ssm.switchGate, name: "IntroCrusher" };
ssm["VivHelper/FlagIntroCrusher"] = ssm.introCrusher;

ssm.templeGate = { color: "#dddddd", name: "TempleGate", opacity: movingSolidOpacity };

ssm.moveBlock = { color: "#9400ae", renderer: MoveBlockContentRenderer };
ssm.lockBlock = { color: "orange", name: "LockBlock", width: 32, height: 32 };

ssm["starJumpBlock"] = {
  color: "white",
  opacity: 0.8,
  name: "",
};

ssm.templeCrackedBlock = {
  color: "#e81a1a",
  name: "CrackedBlock",
  opacity: movingSolidOpacity,
};
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
ssm["SpringCollab2020/UpsideDownJumpThru"] = {
  ...ssm["MaxHelpingHand/UpsideDownJumpThru"],
  offset: [0, 3],
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
ssm["SpringCollab2020/FlagTouchSwitch"] = ssm.touchSwitch;

ssm.dashSwitchH = {
  color: "#1aff00",
  name: "DashSwitch",
  width: 8,
  height: 16,
};
ssm.dashSwitchV = {
  ...ssm.dashSwitchH,
  width: 16,
  height: 8,
};

ssm.flingBird = { color: "#00a6ff", name: "FlingBird", shape: "circle", radius: 16 };
ssm.badelineBoost = { color: "#cc00ff", name: "BadelineBoost", shape: "circle", radius: 16 };
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

ssm["pandorasBox/flagToggleSwitch"] = {
  color: "#15b800",
  name: "FlagToggleSwitch",
  anchorX: "center",
  anchorY: "center",
  width: 16,
  height: 16,
};

ssm.trackSpinner = {
  shape: "spinner",
  color: "#7a5dd8",
  name: "TrackSpinner",
};
ssm["SpringCollab2020/FlagToggleStarTrackSpinner"] = {
  ...ssm.trackSpinner,
  name: "FlagTrackSpinner",
};
ssm["rotateSpinner"] = {
  ...ssm.trackSpinner,
  name: "RotateSpinner",
};
ssm["SpringCollab2020/FlagToggleStarRotateSpinner"] = {
  ...ssm.trackSpinner,
  name: "FlagRotateSpinner",
};

ssm.wallBooster = {
  color: (attr) => (attr.notCoreMode ? "#2ff5ff" : "#ff7a7a"),
  outline: "dashed",
  name: (attr) => (attr.notCoreMode ? "IceWall" : "WallBooster"),
  width: 2,
  anchorX: (attr) => (attr.left ? "right" : "left"),
  offset: (attr) => (attr.left ? [0, 0] : [6, 0]),
};

ssm.seeker = { color: "#a832a8", name: "Seeker", shape: "seeker" };
ssm.theoCrystal = { color: "#00d0ff", name: "TheoCrystal", shape: "theo" };

ssm["SpringCollab2020/GroupedTriggerSpikesRight"] = {
  color: "#ffffff",
  name: "GroupedTriggerSpikes",
  outline: "dashed",
  width: 3,
};
ssm["SpringCollab2020/GroupedTriggerSpikesLeft"] = {
  ...ssm["SpringCollab2020/GroupedTriggerSpikesRight"],
  anchorX: "right",
};
ssm["SpringCollab2020/GroupedTriggerSpikesUp"] = {
  ...ssm["SpringCollab2020/GroupedTriggerSpikesRight"],
  anchorY: "bottom",
  height: 3,
  width: undefined,
};
ssm["SpringCollab2020/GroupedTriggerSpikesDown"] = {
  ...ssm["SpringCollab2020/GroupedTriggerSpikesUp"],
  anchorY: "top",
};
//#endregion

//#region Triggers
ssm.seekerBarrier = { color: "white", name: "SeekerBarrier", outline: "dashed" };
ssm["DJMapHelper/theoCrystalBarrier"] = {
  ...ssm.seekerBarrier,
  name: "TheoCrystalBarrier",
};
ssm["SpringCollab2020/moveBlockBarrier"] = {
  ...ssm.seekerBarrier,
  name: "MoveBlockBarrier",
};
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
ssm["SpringCollab2020/FlagToggleWater"] = {
  ...ssm["XaphanHelper/Liquid"],
  color: "#0066ff",
  name: "Water",
};
ssm["pandorasBox/coloredWater"] = {
  ...ssm["XaphanHelper/Liquid"],
  color: (attr) => {
    const color = "#" + attr.color;
    return validateColor(color) ? color : "#0066ff";
  },
  name: "ColoredWater",
};
ssm["SpringCollab2020/bubblePushField"] = {
  ...ssm["SpringCollab2020/FlagToggleWater"],
  name: "BubblePushField",
  renderer: undefined,
};
ssm.invisibleBarrier = {
  ...ssm.fakeWall,
  name: "InvisibleBarrier",
  renderer: undefined,
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
ssm.key = {
  color: "#ffff20",
  width: 12,
  height: 12,
  anchorX: "center",
  anchorY: "center",
  name: "Key",
};
ssm["CollabUtils2/SpeedBerry"] = {
  color: "#ffb700",
  width: 18,
  height: 16,
  anchorX: "center",
  anchorY: "center",
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
    "ExtendedVariantTrigger",
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
    "SpringCollab2020/FlagToggleCameraTargetTrigger",
    "SpringCollab2020/CameraCatchupSpeedTrigger",
    "cameraAdvanceTargetTrigger",
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
    "SpringCollab2020/UnderwaterSwitchController",
    "SpringCollab2020/FlagToggleWaterfall",
    "hanginglamp",
    "torch",
    "SpringCollab2020/LitBlueTorch",
    "pandorasBox/dreamDashController",
    "pandorasBox/tileGlitcher",
    "foregroundDebris",
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
    entityNames: ["strawberry", "SpringCollab2020/returnBerry"],
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
  {
    name: "Silver Berry",
    entityNames: ["CollabUtils2/SilverBerry"],
    match: () => true,
  },
  {
    name: "Speed Berry",
    entityNames: ["CollabUtils2/SpeedBerry"],
    match: () => true,
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

//#region Validation
function validateColor(hexString) {
  if (typeof hexString !== "string") return false;
  if (!hexString.startsWith("#")) return false;
  const hex = hexString.slice(1);
  return /^[0-9A-Fa-f]{6}$/.test(hex);
}
//#endregion

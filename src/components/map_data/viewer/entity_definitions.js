import {
  CassetteRenderer,
  CrystalHeartRenderer,
  GoldenBerryRenderer,
  LargeBlockContentRenderer,
  MiniHeartRenderer,
  MoveBlockContentRenderer,
  PlatinumBerryRenderer,
  RainbowBerryRenderer,
  SilverBerryRenderer,
  SpikeRenderer,
  SpinnerRenderer,
  StrawberryRenderer,
  WingedGoldenBerryRenderer,
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
  goldenBerry: () => GoldenBerryRenderer,
  "MaxHelpingHand/GoldenStrawberryCustomConditions": () => GoldenBerryRenderer,
  "CollabUtils2/SilverBerry": () => SilverBerryRenderer,
  strawberry: () => StrawberryRenderer,
  "DSidesHelper/TeleportMoonBerry": () => StrawberryRenderer,
  "SpringCollab2020/returnBerry": () => StrawberryRenderer,
  "LunaticHelper/StrawberryWithReturn": () => StrawberryRenderer,
  "SorbetHelper/ReturnBerry": () => StrawberryRenderer,
  "FrostTemple/ReturnStrawberry": () => StrawberryRenderer,
  blackGem: () => CrystalHeartRenderer,
  "MaxHelpingHand/ReskinnableCrystalHeart": () => CrystalHeartRenderer,
  "AdventureHelper/CustomCrystalHeart": () => CrystalHeartRenderer,
  "CollabUtils2/MiniHeart": () => MiniHeartRenderer,
  "CollabUtils2/FakeMiniHeart": () => MiniHeartRenderer,
  "CollabUtils2/RainbowBerry": () => RainbowBerryRenderer,
  "PlatinumStrawberry/PlatinumStrawberry": () => PlatinumBerryRenderer,
  "DSidesPlatinum/PlatinumStrawberry": () => PlatinumBerryRenderer,
  cassette: () => CassetteRenderer,
  "XaphanHelper/CustomCollectable": (attr) =>
    attr.sprite?.indexOf("cassette") >= 0 ? CassetteRenderer : null,
  "ParrotHelper/FlagBerry": () => StrawberryRenderer,
  memorialTextController: () => WingedGoldenBerryRenderer,
  "JungleHelper/TreeDepthController": () => WingedGoldenBerryRenderer,
};

// These are common entities that need special rendering but can be batched together
export const BatchedEntityMap = {
  spikesUp: SpikeRenderer,
  spikesDown: SpikeRenderer,
  spikesLeft: SpikeRenderer,
  spikesRight: SpikeRenderer,
  "VivHelper/RainbowSpikesDown": SpikeRenderer,
  "VivHelper/RainbowSpikesLeft": SpikeRenderer,
  "VivHelper/RainbowSpikesRight": SpikeRenderer,
  "VivHelper/RainbowSpikesUp": SpikeRenderer,
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
const fixedSolidOpacity = 0.8;

// Registers a family of related entities into SimpleShapeMap.
// `entries` values: true = alias of base, "key" = alias of sibling, {...} = base + overrides, ["key", {...}] = sibling + overrides
function group(base, entries) {
  const resolved = {};
  for (const [key, value] of Object.entries(entries)) {
    let def;
    if (value === true) {
      def = base;
    } else if (typeof value === "string") {
      def = resolved[value];
    } else if (Array.isArray(value)) {
      def = { ...resolved[value[0]], ...value[1] };
    } else {
      def = { ...base, ...value };
    }
    ssm[key] = def;
    resolved[key] = def;
  }
  return base;
}

//#region Solids
group(
  {
    color: "#ffffff",
    name: "",
    opacity: fixedSolidOpacity,
  },
  {
    solid: true,
    "FancyTileEntities/FancySolidTiles": true,
    bridge: { name: "Bridge" },
    glassBlock: { color: "#99d9ea", name: "GlassBlock" },
    "VivHelper/CustomDepthTileEntity": true,
    fakeBlock: true,
    conditionBlock: { name: "ConditionBlock", opacity: movingSolidOpacity },
    "EmHelper/Monumentswitchblock": {
      name: "MonumentSwitchBlock",
      color: (attr) => validateColorOr(attr.color, "#ffffff"),
      opacity: movingSolidOpacity,
    },
  },
);

ssm.crumbleWallOnRumble = {
  color: "white",
  name: "CrumbleWallOnRumble",
  opacity: movingSolidOpacity,
};

group(
  { color: "white", name: "MoonBlock", opacity: movingSolidOpacity },
  {
    floatySpaceBlock: true,
    "SpringCollab2020/floatierSpaceBlock": { name: "FloatierMoonBlock" },
    "BrokemiaHelper/floatierSpaceBlock": "SpringCollab2020/floatierSpaceBlock",
    "MaxHelpingHand/FloatySpaceBlockWithAttachedSidewaysJumpthruSupport": {
      name: "MoonBlockWithJumpThrough",
    },
    "VivHelper/FloatyBreakBlock": { name: "[MoonBlock]" },
    "FancyTileEntities/FancyFloatySpaceBlock": true,
  },
);

group(
  { color: "orange", name: "S", opacity: movingSolidOpacity },
  {
    swapBlock: true,
    "MaxHelpingHand/ReskinnableSwapBlock": true,
    "FrostHelper/ToggleSwapBlock": { name: "[S]" },
    "XaphanHelper/FlagSwapBlock": { name: "[S]" },
    "spirialis/swapblock": { name: "[S]" },
  },
);

group(
  { color: "orange", name: "Z", opacity: movingSolidOpacity },
  {
    zipMover: true,
    "AdventureHelper/ZipMoverNoReturn": { name: "[Z]" },
    "FrostHelper/CustomZipMover": true,
    "AdventureHelper/LinkedZipMover": { name: "[Z]" },
    "AdventureHelper/LinkedZipMoverNoReturn": { name: "[Z]" },
    "VivHelper/CornerBoostZipMover": { name: "[Z]" },
    "VivHelper/CustomZipMover": { name: "[Z]" },
    "CommunalHelper/DreamZipMover": { color: "#777777", name: "[Z]" },
    "spirialis/timezipmover": { name: "[Z]" },
  },
);

group(
  { color: "#12fffb", name: "F", opacity: movingSolidOpacity },
  {
    fallingBlock: true,
    "FancyTileEntities/FancyFallingBlock": true,
    "VortexHelper/AutoFallingBlock": true,
    "VivHelper/CustomFallingBlock": true,
    "AdventureHelper/GroupedFallingBlock": { name: "[F]" },
    "VivHelper/CornerBoostFallingBlock": { name: "[F]" },
    "spirialis/timefallingblock": { name: "[F]" },
    finalBossFallingBlock: { color: "#cc00ff" },
    finalBossMovingBlock: ["finalBossFallingBlock", { name: "M" }],
  },
);

ssm["CommunalHelper/ConnectedMoveBlock"] = {
  color: "#cc00ff",
  renderer: MoveBlockContentRenderer,
};
ssm["CommunalHelper/DreamMoveBlock"] = {
  color: "#777777",
  renderer: MoveBlockContentRenderer,
};

ssm["MaxHelpingHand/MultiNodeMovingPlatform"] = {
  color: "#cc00ff",
  name: "MultiNodeMovingPlatform",
  opacity: movingSolidOpacity,
};

group(
  { color: "#12fffb", name: "R", opacity: movingSolidOpacity },
  {
    "HonlyHelper/RisingBlock": true,
  },
);

group(
  { color: "#12fffb", name: "C", opacity: movingSolidOpacity },
  {
    crumbleBlock: true,
    "ShroomHelper/CrumbleBlockOnTouch": { name: "(C)" },
    "MaxHelpingHand/CustomizableCrumblePlatform": true,
    "SpringCollab2020/safeRespawnCrumble": { name: "SafeRespawnCrumble" },
    "SafeRespawnCrumble/SafeRespawnCrumble": "SpringCollab2020/safeRespawnCrumble",
  },
);

group(
  { color: "#12fffb", name: "D", opacity: movingSolidOpacity },
  {
    dashBlock: true,
    "VivHelper/CustomDashBlock": true,
    "FrostHelper/DashBlockDestroyAttached": true,
    "ChronoHelper/StaticDebrisDashBlock": true,
    "FancyTileEntities/FancyDashBlock": true,
    "SJ2021/ShatterDashBlock": {
      name: (attr) => "ShatterDashBlock{Speed = " + validateNumber(attr.SpeedRequirement) + "}",
    },
  },
);

group(
  { color: "#285aff", name: "Kevin", opacity: movingSolidOpacity },
  {
    crushBlock: true,
    "MaxHelpingHand/ReskinnableCrushBlock": true,
    "CherryHelper/NonReturnKevin": { name: "[Kevin]" },
    "spirialis/timekevin": { name: "[Kevin]" },
  },
);

ssm.bounceBlock = { color: "#f62121", name: "CoreBlock", opacity: movingSolidOpacity };

group(
  { color: "#dda94a", name: "MovingPlatform", opacity: movingSolidOpacity },
  {
    movingPlatform: true,
    sinkingPlatform: { name: "SinkingPlatform" },
    "SpringCollab2020/MultiNodeMovingPlatform": true,
    "spirialis/timemovingplatform": { name: "TimeMovingPlatform" },
  },
);

group(
  { color: "#777777", name: "DreamBlock", opacity: movingSolidOpacity },
  {
    dreamBlock: true,
    "FrostHelper/CustomDreamBlock": true,
    "CommunalHelper/ConnectedDreamBlock": { name: "ConnectedDreamBlock" },
  },
);

group(
  { color: "#00a6ff", name: "SwitchGate", opacity: movingSolidOpacity },
  {
    switchGate: true,
    "MaxHelpingHand/FlagSwitchGate": true,
    "SpringCollab2020/FlagSwitchGate": true,
    "MaxHelpingHand/ShatterFlagSwitchGate": true,
    "VortexHelper/VortexSwitchGate": true,
    "CommunalHelper/DreamSwitchGate": { color: "#777777" },
    "spirialis/timeswitchgate": { name: "TimeSwitchGate" },
    introCrusher: { name: "IntroCrusher" },
    "VivHelper/FlagIntroCrusher": "introCrusher",
  },
);

group(
  { color: "#dddddd", name: "TempleGate", opacity: movingSolidOpacity },
  {
    templeGate: true,
    "XaphanHelper/FlagTempleGate": { name: "FlagTempleGate" },
    "vitellary/templegateall": { height: 48 },
    "batteries/battery_gate": { name: "BatteryGate", height: 48 },
  },
);

ssm.moveBlock = { color: "#9400ae", renderer: MoveBlockContentRenderer };
ssm["vitellary/vitmoveblock"] = ssm.moveBlock;
ssm["spirialis/timemoveblock"] = ssm.moveBlock;

group(
  { color: "orange", name: "LockBlock", width: 32, height: 32 },
  {
    lockBlock: true,
    "PrismaticHelper/MultiLockedDoor": {
      name: (attr) => (attr.keys || 1) + (attr.keys === 1 ? "Key" : "Keys") + "LockBlock",
    },
  },
);

group(
  {
    color: "#3962e1",
    name: "CollectibleDoor",
    height: (attr) => attr.height * 2,
    anchorY: "center",
  },
  {
    "XaphanHelper/CollectableDoor": {
      color: (attr) => validateColorOr(attr.interiorColor, "#9400ae"),
    },
    "MaxHelpingHand/SaveFileStrawberryGate": { color: "#e92727", name: "SaveFileStrawberryGate", height: 80 },
    "CollabUtils2/MiniHeartDoor": { name: "MiniHeartDoor" },
    heartGemDoor: { height: undefined, anchorY: undefined, name: "HeartGemDoor" },
  },
);

ssm.starJumpBlock = { color: "white", opacity: 0.8, name: "" };
ssm.templeCrackedBlock = { color: "#e81a1a", name: "CrackedBlock", opacity: movingSolidOpacity };
ssm.redBlocks = { color: "#d900ff", name: "Towels", opacity: movingSolidOpacity };
ssm.greenBlocks = { color: "#26e615", name: "Books", opacity: movingSolidOpacity };
ssm.yellowBlocks = { color: "#e4b611", name: "Crates", opacity: movingSolidOpacity };

ssm.cassetteBlock = {
  name: "CassetteBlock",
  color: (attr) => {
    if (attr.index === 1) return "#f049be";
    if (attr.index === 2) return "#fcdc3a";
    if (attr.index === 3) return "#38e04e";
    return "#49aaf0";
  },
  opacity: movingSolidOpacity,
};
group(
  { ...ssm.cassetteBlock },
  {
    "CommunalHelper/CassetteZipMover": { name: "CassetteZipMover" },
    "dsides/invisibleCassetteBlock": {
      name: "InvisibleCassetteBlock",
      outline: "dashed",
      opacity: 0.1,
    },
  },
);
ssm["SJ2021/WonkyCassetteBlock"] = {
  name: "WonkyCassetteBlock",
  color: (attr) => validateColorOr(attr.color, "#49aaf0"),
  opacity: movingSolidOpacity,
};

ssm["VivHelper/CornerBoostBlock"] = { color: "white", name: "CornerBoostBlock", opacity: movingSolidOpacity };
ssm["cpopBlock"] = { color: "white", name: "CPOP\nBlock", opacity: movingSolidOpacity };
ssm.goldenBlock = { color: "#ffdf00", name: "GoldenBlock", opacity: movingSolidOpacity };
ssm["CollabUtils2/SilverBlock"] = { color: "#c0c0c0", name: "SilverBlock", opacity: movingSolidOpacity };
ssm["PlatinumStrawberry/PlatinumBlock"] = {
  color: "#e5e4e2",
  name: "PlatinumBlock",
  opacity: movingSolidOpacity,
};

ssm["vitellary/kaizoblock"] = {
  color: "#ffe77a",
  name: "KaizoBlock",
  opacity: 0.1,
  outline: "dashed",
  anchorX: "center",
  anchorY: "center",
  width: 16,
  height: 16,
};
//#endregion

//#region Semi-Solids
group(
  { color: "orange", height: 5, name: "JumpThrough" },
  {
    jumpThru: true,
    "VivHelper/CrumbleJumpThru": { name: "CrumbleJumpThrough" },
    "VortexHelper/AttachedJumpThru": true,
    "JungleHelper/InvisibleJumpthruPlatform": { name: "InvisibleJumpThrough", outline: "dashed" },
  },
);

group(
  {
    color: "orange",
    width: 5,
    offset: (attr) => (attr.left ? [1, 0] : [3, 0]),
    name: (attr) => (attr.left ? "Left" : "Right") + "JumpThrough",
  },
  {
    "MaxHelpingHand/SidewaysJumpThru": true,
    "SpringCollab2020/SidewaysJumpThru": { offset: (attr) => (attr.left ? [0, 0] : [3, 0]) },
    "MaxHelpingHand/AttachedSidewaysJumpThru": "MaxHelpingHand/SidewaysJumpThru",
  },
);

group(
  { color: "orange", height: 5, offset: [0, 3], name: "DownJumpThrough" },
  {
    "MaxHelpingHand/UpsideDownJumpThru": true,
    "SpringCollab2020/UpsideDownJumpThru": true,
    "GravityHelper/UpsideDownJumpThru": true,
  },
);

group(
  {
    color: (attr) => (attr.fragile ? "#f27dff" : "#d7f2ff"),
    height: 5,
    width: (attr) => (attr.small ? 26 : 32),
    name: "Cloud",
  },
  {
    cloud: true,
    "FlaglinesAndSuch/CustomCloud": true,
  },
);

ssm["SJ2021/SolarElevator"] = {
  color: "#ff7a7a",
  name: "SolarElevator",
  anchorY: "bottom",
  anchorX: "center",
  width: 48,
  height: (attr) => validateNumber(attr.distance) + 64,
  outline: "dashed",
};
//#endregion

//#region Gameplay Elements
group(
  {
    color: (attr) => (attr.twoDash ? "#ff4be7" : "#5eff5e"),
    width: 16,
    height: 16,
    anchorX: "center",
    anchorY: "center",
    name: (attr) => (attr.oneUse ? "(Refill)" : "Refill"),
  },
  {
    refill: true,
    "MaxHelpingHand/CustomizableRefill": true,
    "DJMapHelper/colorfulRefill": true,
    "VivHelper/RefillWall": {
      anchorX: "left",
      anchorY: "top",
      width: undefined,
      height: undefined,
      name: (attr) => (attr.oneUse ? "(RefillWall)" : "RefillWall"),
    },
    "ExtendedVariantMode/RecoverJumpRefill": {
      color: "#77bde6",
      name: (attr) => (attr.oneUse ? "(JumpRefill)" : "JumpRefill"),
    },
    "ExtendedVariantMode/ExtraJumpRefill": {
      color: "#77bde6",
      name: (attr) => (attr.oneUse ? "(ExtraJumpRefill)" : "ExtraJumpRefill"),
    },
    "vitellary/timecrystal": { color: "#00d9ff", name: "TimeCrystal" },
    "GravityHelper/GravityRefill": { color: "#f531ff", name: "GravityRefill" },
    "MoreDasheline/SpecialRefill": {
      color: (attr) => (attr.dashes === 2 ? "#ff4be7" : "#5eff5e"),
      name: "SpecialRefill",
    },
    "CommunalHelper/DreamRefill": {
      color: "#777777",
      name: (attr) => (attr.oneUse ? "(DreamRefill)" : "DreamRefill"),
    },
    "vitellary/forcejumpcrystal": {
      color: "#ff7a7a",
      name: (attr) => (attr.oneUse ? "(ForceJumpCrystal)" : "ForceJumpCrystal"),
    },
    "LunaticHelper/CustomRefill": true,
    "BounceHelper/BounceRefill": { name: (attr) => (attr.oneUse ? "(BounceRefill)" : "BounceRefill") },
    "TwigHelper/LargeRefill": { name: (attr) => (attr.oneUse ? "(LargeRefill)" : "LargeRefill") },
  },
);
ssm["VivHelper/RefillWallWrapper"] = {
  color: "#5eff5e",
  name: "RefillWallWrapper",
};

ssm.lightning = { color: "yellow", name: "", depth: LAYERS.ENTITIES - 1, outline: "dashed" };

const spring = group(
  { color: "#c96800", name: "Spring", anchorX: "center", anchorY: "bottom", width: 16, height: 6 },
  {
    spring: true,
    "FrostHelper/SpringFloor": true,
    "MaxHelpingHand/CustomDashRefillSpring": { color: "#16bd00", name: "CustomDashRefillSpring" },
    "GravityHelper/GravitySpringFloor": { color: "#16bd00", name: "GravitySpring" },
    "FrostHelper/SpringCeiling": { anchorY: "top" },
    "MaxHelpingHand/NoDashRefillSpring": { color: "#16bd00", name: "NoDashRefillSpring" },
  },
);

group(
  { ...spring, anchorX: "left", anchorY: "center", height: 16, width: 6 },
  {
    wallSpringLeft: true,
    "FrostHelper/SpringLeft": true,
    "BrokemiaHelper/wallDashSpringLeft": true,
    "MaxHelpingHand/CustomDashRefillSpringLeft": { color: "#16bd00", name: "CustomDashRefillSpring" },
    "GravityHelper/GravitySpringWallLeft": { color: "#16bd00", name: "GravitySpring" },
    "MaxHelpingHand/NoDashRefillSpringLeft": { color: "#16bd00", name: "NoDashRefillSpring" },
    "SpringCollab2020/wallDashSpringLeft": { color: "#aebebe", name: "IronSpring" },
  },
);

group(
  { ...spring, anchorX: "right", anchorY: "center", height: 16, width: 6 },
  {
    wallSpringRight: true,
    "FrostHelper/SpringRight": true,
    "MaxHelpingHand/CustomDashRefillSpringRight": { color: "#16bd00", name: "CustomDashRefillSpring" },
    "GravityHelper/GravitySpringWallRight": { color: "#16bd00", name: "GravitySpring" },
    "MaxHelpingHand/NoDashRefillSpringRight": { color: "#16bd00", name: "NoDashRefillSpring" },
    "SpringCollab2020/wallDashSpringRight": { color: "#aebebe", name: "IronSpring" },
  },
);

ssm["DJMapHelper/springGreen"] = {
  width: (attr) => (attr.orientation === "Floor" ? 16 : 6),
  height: (attr) => (attr.orientation === "Floor" ? 6 : 16),
  color: "#16bd00",
  name: "GreenSpring",
  offset: (attr) =>
    attr.orientation === "Floor" ? [-8, -6] : attr.orientation === "WallRight" ? [-5, -8] : [0, -8],
};

group(
  { name: "GravitySpring", color: "#16bd00", anchorX: "center", anchorY: "top", width: 16, height: 6 },
  {
    "GravityHelper/GravitySpringCeiling": true,
    "GravityHelper/GravitySpring": {
      anchorX: (attr) => (attr.orientation === "Floor" ? "center" : attr.left ? "left" : "right"),
      anchorY: (attr) => (attr.orientation === "Floor" ? "bottom" : "center"),
      width: (attr) => (attr.orientation === "Floor" ? 16 : 6),
      height: (attr) => (attr.orientation === "Floor" ? 6 : 16),
    },
  },
);

group(
  { color: "#00a6ff", name: "TouchSwitch", anchorX: "center", anchorY: "center", width: 16, height: 16 },
  {
    touchSwitch: true,
    "MaxHelpingHand/FlagTouchSwitch": true,
    "SpringCollab2020/FlagTouchSwitch": true,
    "MaxHelpingHand/MovingFlagTouchSwitch": { name: "MovingFlagTouchSwitch" },
    "outback/movingtouchswitch": { name: "MovingTouchSwitch" },
    "outback/timedtouchswitch": { name: "TimedTouchSwitch" },
  },
);

group(
  { color: "#1aff00", name: "DashSwitch", width: 8, height: 16 },
  {
    dashSwitchH: true,
    dashSwitchV: { width: 16, height: 8 },
    "SSMHelper/BarrierDashSwitch": "dashSwitchH",
  },
);

ssm["batteries/battery_switch"] = {
  color: "#1aff00",
  name: "BatterySwitch",
  width: (attr) => (attr.horizontal ? 8 : 16),
  height: (attr) => (attr.horizontal ? 16 : 8),
};

ssm.lightningBlock = {
  color: "#d3b548",
  name: "BreakerBox",
  width: 32,
  height: 32,
  opacity: movingSolidOpacity,
};

ssm.flingBird = { color: "#00a6ff", name: "FlingBird", shape: "circle", radius: 16 };
group(
  {
    color: "#cc00ff",
    name: "BadelineBoost",
    shape: "circle",
    radius: 16,
  },
  {
    badelineBoost: true,
    "SJ2021/CustomBadelineBoost": true,
    "DJMapHelper/badelineBoostDown": true,
  },
);

group(
  { color: "#cc00ff", name: "FinalBoss", shape: "circle", radius: 14, offset: [0, -6] },
  {
    finalBoss: true,
    "DJMapHelper/finalBossReversed": { name: "FinalBossReversed" },
  },
);

group(
  {
    color: (attr) => (attr.red ? "#ff3e3e" : "#31ff7d"),
    name: "Bubble",
    shape: "circle",
    radius: 10,
  },
  {
    booster: true,
    "GravityHelper/GravityBooster": { color: "#f531ff", name: "GravityBubble" },
    "SJ2021/DashBoostField": { color: "#f531ff", name: "DashBoostField" },
    "FrostHelper/BlueBooster": { color: "#31baff", name: "DashlessBubble" },
    "GlassHelper/ReverseBooster": { color: "#f531ff", name: "ReverseBubble" },
    "JackalCollabHelper/FlagBooster": { color: "#3168ff", name: "FlagBubble" },
    "EmHelper/Monumentbooster": { color: "#3168ff", name: "MonumentBooster" },
    "CommunalHelper/DreamBooster": { color: "#777777", name: "DreamBubble" },
    "Anonhelper/OneUseBooster": { name: "OneUseBubble" },
  },
);

ssm.infiniteStar = {
  color: "yellow",
  name: "Feather",
  width: 20,
  height: 20,
  anchorX: "center",
  anchorY: "center",
};

group(
  {
    color: "#15b800",
    anchorX: "center",
    anchorY: "center",
    width: 16,
    height: 24,
  },
  {
    coreModeToggle: { name: "CoreModeToggle", color: (attr) => (attr.onlyIce ? "#00d9ff" : "#e12525") },
    "pandorasBox/flagToggleSwitch": { name: "FlagToggleSwitch" },
    "GravityHelper/GravitySwitch": { name: "GravitySwitch" },
    "bgSwitch/bgModeToggle": { name: "BGModeToggle" },
    "EmHelper/Monumentflipswitch": { name: "MonumentFlipSwitch" },
  },
);

group(
  { shape: "spinner", color: "#7a5dd8", name: "TrackSpinner" },
  {
    trackSpinner: true,
    "AdventureHelper/DustTrackSpinnerMultinode": true,
    "SpringCollab2020/FlagToggleStarTrackSpinner": { name: "FlagTrackSpinner" },
    rotateSpinner: { name: "RotateSpinner" },
    "SpringCollab2020/FlagToggleStarRotateSpinner": { name: "FlagRotateSpinner" },
    "isaBag/dreamSpinner": { name: "DreamSpinner", color: "#777777" },
    "VivHelper/AnimatedSpinner": { name: "AnimatedSpinner" },
    "spirialis/timerotatespinner": { name: "TimeRotateSpinner" },
  },
);

group(
  {
    color: (attr) => (attr.notCoreMode ? "#2ff5ff" : "#ff7a7a"),
    outline: "dashed",
    name: (attr) => (attr.notCoreMode ? "IceWall" : "WallBooster"),
    width: 2,
    offset: (attr) => (attr.left ? [0, 0] : [6, 0]),
  },
  {
    wallBooster: true,
    "CommunalHelper/AttachedWallBooster": true,
    "ShroomHelper/AttachedIceWall": { name: "IceWall", color: "#2ff5ff" },
    "cavern/icyfloor": { name: "IcyFloor", color: "#2ff5ff", height: 2, width: undefined, offset: [0, 6] },
  },
);

ssm.seeker = { color: "#a832a8", name: "Seeker", shape: "seeker" };

group(
  { color: "#00d0ff", name: "TheoCrystal", shape: "theo" },
  {
    theoCrystal: true,
    "cavern/crystalbomb": { name: "CrystalBomb" },
    "batteries/battery": { name: "Battery" },
    "ExtendedVariantMode/TheoCrystal": true,
  },
);

group(
  { color: "#0077ff", name: "Jelly", shape: "jelly" },
  {
    glider: true,
    "MaxHelpingHand/RespawningJellyfish": { name: "RespawningJelly" },
    "VivHelper/ReskinnableJelly": true,
    "BounceHelper/BounceJellyfish": { name: "BounceJelly" },
  },
);

ssm.introCar = { color: "#9b9b9b", name: "IntroCar", shape: "car" };

group(
  { color: "#ffffff", name: "TriggerSpikes", outline: "dashed" },
  {
    triggerSpikesLeft: { width: 3, anchorX: "right" },
    triggerSpikesRight: { width: 3, anchorX: "left" },
    triggerSpikesUp: ["triggerSpikesRight", { anchorY: "bottom", height: 3, width: undefined }],
    triggerSpikesDown: ["triggerSpikesUp", { anchorY: "top" }],
    triggerSpikesOriginalLeft: "triggerSpikesLeft",
    triggerSpikesOriginalRight: "triggerSpikesRight",
    triggerSpikesOriginalUp: "triggerSpikesUp",
    triggerSpikesOriginalDown: "triggerSpikesDown",
  },
);

group(
  { color: "#ffffff", name: "GroupedTriggerSpikes", outline: "dashed" },
  {
    "SpringCollab2020/GroupedTriggerSpikesLeft": { width: 3, anchorX: "right" },
    "SpringCollab2020/GroupedTriggerSpikesRight": { width: 3, anchorX: "left" },
    "SpringCollab2020/GroupedTriggerSpikesUp": [
      "SpringCollab2020/GroupedTriggerSpikesRight",
      { anchorY: "bottom", height: 3, width: undefined },
    ],
    "SpringCollab2020/GroupedTriggerSpikesDown": [
      "SpringCollab2020/GroupedTriggerSpikesUp",
      { anchorY: "top" },
    ],
    "MaxHelpingHand/GroupedTriggerSpikesLeft": "SpringCollab2020/GroupedTriggerSpikesLeft",
    "MaxHelpingHand/GroupedTriggerSpikesRight": "SpringCollab2020/GroupedTriggerSpikesRight",
    "MaxHelpingHand/GroupedTriggerSpikesUp": "SpringCollab2020/GroupedTriggerSpikesUp",
    "MaxHelpingHand/GroupedTriggerSpikesDown": "SpringCollab2020/GroupedTriggerSpikesDown",
    "VivHelper/RainbowTriggerSpikesUp": "SpringCollab2020/GroupedTriggerSpikesUp",
    "VivHelper/RainbowTriggerSpikesDown": "SpringCollab2020/GroupedTriggerSpikesDown",
    "VivHelper/RainbowTriggerSpikesLeft": "SpringCollab2020/GroupedTriggerSpikesLeft",
    "VivHelper/RainbowTriggerSpikesRight": "SpringCollab2020/GroupedTriggerSpikesRight",
    "CommunalHelper/TimedTriggerSpikesRight": [
      "SpringCollab2020/GroupedTriggerSpikesRight",
      { name: "TimedTriggerSpikes" },
    ],
    "CommunalHelper/TimedTriggerSpikesLeft": [
      "SpringCollab2020/GroupedTriggerSpikesLeft",
      { name: "TimedTriggerSpikes" },
    ],
    "CommunalHelper/TimedTriggerSpikesUp": [
      "SpringCollab2020/GroupedTriggerSpikesUp",
      { name: "TimedTriggerSpikes" },
    ],
    "CommunalHelper/TimedTriggerSpikesDown": [
      "SpringCollab2020/GroupedTriggerSpikesDown",
      { name: "TimedTriggerSpikes" },
    ],

    "SJ2021/DashThroughSpikesUp": [
      "SpringCollab2020/GroupedTriggerSpikesUp",
      { name: "DashThroughSpikes", color: "#777777" },
    ],
    "SJ2021/DashThroughSpikesDown": [
      "SpringCollab2020/GroupedTriggerSpikesDown",
      { name: "DashThroughSpikes", color: "#777777" },
    ],
    "SJ2021/DashThroughSpikesLeft": [
      "SpringCollab2020/GroupedTriggerSpikesLeft",
      { name: "DashThroughSpikes", color: "#777777" },
    ],
    "SJ2021/DashThroughSpikesRight": [
      "SpringCollab2020/GroupedTriggerSpikesRight",
      { name: "DashThroughSpikes", color: "#777777" },
    ],
  },
);

group(
  { color: "#ffffff", name: "CoreModeSpikes", outline: "dashed" },
  {
    "MaxHelpingHand/CoreModeSpikesLeft": { width: 3, anchorX: "right" },
    "MaxHelpingHand/CoreModeSpikesRight": { width: 3, anchorX: "left" },
    "MaxHelpingHand/CoreModeSpikesUp": [
      "MaxHelpingHand/CoreModeSpikesRight",
      { anchorY: "bottom", height: 3, width: undefined },
    ],
    "MaxHelpingHand/CoreModeSpikesDown": ["MaxHelpingHand/CoreModeSpikesUp", { anchorY: "top" }],
  },
);

group(
  {
    color: (attr) => validateColorOr(attr.color, "#ffffff"),
    name: "MonumentSpikes",
    outline: "dashed",
  },
  {
    "EmHelper/MonumentspikesLeft": { width: 3, anchorX: "right" },
    "EmHelper/MonumentspikesRight": { width: 3, anchorX: "left" },
    "EmHelper/MonumentspikesUp": [
      "EmHelper/MonumentspikesRight",
      { anchorY: "bottom", height: 3, width: undefined },
    ],
    "EmHelper/MonumentspikesDown": ["EmHelper/MonumentspikesUp", { anchorY: "top" }],
  },
);

ssm["outback/portal"] = {
  name: "Portal",
  color: (attr) => validateColorOr(attr.readyColor, "#00d9ff"),
  width: (attr) => (attr.direction === "Left" || attr.direction === "Right" ? 6 : 10),
  height: (attr) => (attr.direction === "Left" || attr.direction === "Right" ? 10 : 6),
  anchorX: "center",
  anchorY: "center",
};

group(
  {
    shape: "circle",
    color: "#3d44ff",
    name: "Bumper",
    radius: 12,
  },
  {
    bigSpinner: true,
    "FrostHelper/StaticBumper": {
      color: (attr) => (attr.sprite === "bumper_white" ? "#ffffff" : "#3d44ff"),
    },
    "VivHelper/RefilllessBumper": { name: "RefilllessBumper" },
    "MaxHelpingHand/RotatingBumper": { name: "RotatingBumper" },
    "VortexHelper/VortexCustomBumper": {
      color: (attr) => validateColorOr(attr.style, "#3d44ff"),
    },
  },
);

group(
  {
    width: 16,
    height: 16,
    anchorX: "center",
    anchorY: "center",
    name: "CardinalBumper",
    color: "#3d44ff",
  },
  {
    "JackalHelper/LinkedCardinalBumper": { name: "LinkedCardinalBumper" },
  },
);

ssm.fireBall = { shape: "circle", color: "#ff3d3d", name: "FireBall", radius: 6 };
group(
  {
    color: "#8d8d8d",
    name: "ReturnBubble",
    outline: "dashed",
  },
  {
    "FrostHelper/Bubbler": true,
    "CommunalHelper/PlayerBubbleRegion": { name: "ReturnBubbleRegion" },
  },
);

ssm["JungleHelper/SpinyPlant"] = {
  color: (attr) => validateColorOr(attr.color, "#00ff00"),
  name: "SpinyPlant",
};

group(
  {
    color: "#ffa43d",
    name: "Fish",
    shape: "fish",
  },
  {
    eyebomb: true,
    "vitellary/custompuffer": true,
    "SpringCollab2020/StaticPuffer": true,
    "MaxHelpingHand/StaticPuffer": true,
  },
);

ssm["MaxHelpingHand/KevinBarrier"] = {
  color: (attr) => validateColorOr(attr.color, "#3090f0"),
  name: "KevinBarrier",
  opacity: 0.3,
};
//#endregion

//#region Triggers
group(
  { color: "white", name: "SeekerBarrier", outline: "dashed" },
  {
    seekerBarrier: true,
    "MaxHelpingHand/CustomSeekerBarrier": true,
    "DJMapHelper/theoCrystalBarrier": { name: "TheoCrystalBarrier" },
    "SpringCollab2020/moveBlockBarrier": { name: "MoveBlockBarrier" },
    "VivHelper/HoldableBarrier": { name: "HoldableBarrier" },
    "cavern/crystalBombField": { name: "CrystalBombField" },
  },
);
ssm["VivHelper/SolidModifier"] = {
  color: "#a5a5a5",
  name: "SolidModifier",
  outline: "dashed",
};
//#endregion

//#region Large Background Entities
const fakeWallBase = group(
  {
    color: "#888888",
    opacity: 0.01,
    outline: "dashed",
    depth: LAYERS.SOLIDS + 1,
    name: "FakeWall",
    renderer: LargeBlockContentRenderer,
  },
  {
    fakeWall: true,
    "XaphanHelper/LinkedFakeWall": true,
    blockField: { name: "BlockField" },
    exitBlock: { name: "ExitBlock" },
    coverupWall: { name: "CoverupWall" },
    "FancyTileEntities/FancyCoverupWall": "coverupWall",
    "VivHelper/CustomCoverupWall": "coverupWall",
    "FancyTileEntities/FancyFakeWall": true,
    "MaxHelpingHand/FlagExitBlock": "exitBlock",
    "FancyTileEntities/FancyExitBlock": "exitBlock",
    "SpringCollab2020/caveWall": true,
    "BrokemiaHelper/caveWall": true,
    "VivHelper/EnterBlock": { name: "EnterBlock" },
    "GravityHelper/GravityField": { name: "GravityField", color: "#00d9ff" },
    crumbleWallOnRumble: { name: "CrumbleWallOnRumble" },
  },
);

group(
  { ...fakeWallBase, name: "InvisibleBarrier", renderer: undefined },
  {
    invisibleBarrier: true,
    "MaxHelpingHand/OneWayInvisibleBarrierHorizontal": true,
    "FrostHelper/CustomInvisibleBarrier": true,
  },
);

group(
  {
    color: "#0066ff",
    opacity: 0.1,
    outline: "dashed",
    depth: LAYERS.SOLIDS + 1,
    name: "Water",
    renderer: LargeBlockContentRenderer,
  },
  {
    water: true,
    fireBarrier: { color: "#ff4000", name: "Fire" },
    "FrostHelper/CustomFireBarrier": [
      "fireBarrier",
      { color: (attr) => validateColorOr(attr.surfaceColor, "#ff4000") },
    ],
    iceBlock: { color: "#66ccff", name: "Ice" },
  },
);

group(
  {
    color: (attr) => (attr.liquidType === "lava" ? "#ff4000" : "#0066ff"),
    opacity: 0.1,
    outline: "dashed",
    depth: LAYERS.SOLIDS + 1,
    name: (attr) => (attr.liquidType === "lava" ? "Lava" : attr.liquidType === "acid" ? "Acid" : "Water"),
    renderer: LargeBlockContentRenderer,
  },
  {
    "XaphanHelper/Liquid": true,
    "SpringCollab2020/FlagToggleWater": { color: "#0066ff", name: "Water" },
    "pandorasBox/coloredWater": {
      color: (attr) => validateColorOr(attr.color, "#0066ff"),
      name: "ColoredWater",
    },
    "JackalHelper/DeadlyWater": ["pandorasBox/coloredWater", { name: "DeadlyWater" }],
    "SpringCollab2020/bubblePushField": [
      "SpringCollab2020/FlagToggleWater",
      { name: "BubblePushField", renderer: undefined },
    ],
  },
);

const refillCancelColors = {
  "001": "#475cff",
  "010": "#ff6274",
  100: "#e6ff80",
  "011": "#ec6eff",
  110: "#ffd260",
  101: "#50ff79",
  111: "#ffffff",
};
ssm["VivHelper/RefillCancelSpace"] = {
  ...fakeWallBase,
  name: "RefillCancel",
  color: (attr) =>
    refillCancelColors[
      (attr.NoStaminaRefill ? "1" : "0") + (attr.NoDash ? "1" : "0") + (attr.NoDashRefill ? "1" : "0")
    ] || "white",
};

ssm["EeveeHelper/HoldableContainer"] = {
  name: "Holdable",
  color: "#ff00ff",
  opacity: 0.05,
  outline: "dotted",
};

ssm.darkChaser = {
  color: "#931ebd",
  name: "BaddyChaser",
};
ssm.darkChaserEnd = {
  ...fakeWallBase,
  name: "BaddyChaserEnd",
  color: "#931ebd",
};
ssm["SJ2021/SineDustSpinner"] = {
  ...fakeWallBase,
  name: "Sine\nDust\nSpinner",
  color: "#7a5dd8",
};

ssm["JackalCollabHelper/DarkMatter"] = {
  color: "#131313",
  name: "DarkMatter",
  opacity: 0.25,
  outline: "dashed",
};
//#endregion

//#region Room Markers
ssm.player = { color: "red", width: 8, height: 10, name: "Respawn", anchorX: "center", anchorY: "bottom" };

group(
  { color: "#6b6b6b", width: 8, height: 10, name: "TowerViewer", anchorX: "center", anchorY: "bottom" },
  {
    towerviewer: true,
    "PrismaticHelper/AttachedWatchtower": true,
    "VivHelper/CustomPlaybackWatchtower": true,
    "CommunalHelper/NoOverlayLookout": true,
    "Sardine7/HumbleLookout": true,
    "VivHelper/PlatinumWatchtower": true,
  },
);

group(
  {
    color: "#ffffff",
    width: 8,
    height: 16,
    name: (attr) => "Flag " + attr.number,
    anchorX: "center",
    anchorY: "top",
  },
  {
    summitcheckpoint: true,
    "MaxHelpingHand/CustomSummitCheckpoint": { name: "CustomFlag" },
  },
);

ssm.checkpoint = {
  color: "#ffffff",
  width: 20,
  height: 24,
  anchorX: "center",
  anchorY: "bottom",
  name: "Checkpoint",
};
ssm.key = { color: "#ffff20", width: 12, height: 12, anchorX: "center", anchorY: "center", name: "Key" };
ssm["CollabUtils2/SpeedBerry"] = {
  color: "#ffb700",
  width: 18,
  height: 16,
  anchorX: "center",
  anchorY: "center",
};
ssm["SpringCollab2020/CustomBirdTutorial"] = {
  color: "#a2a2a2",
  width: 16,
  height: 16,
  anchorX: "center",
  anchorY: "bottom",
};
ssm.fakeHeart = { color: "#3962e1", width: 16, height: 16, anchorX: "center", anchorY: "center" };

group(
  { color: "#ff4b4b", width: 10, height: 10, anchorX: "center", anchorY: "center" },
  {
    "SpringCollab2020/MultiRoomStrawberry": true,
    "SpringCollab2020/MultiRoomStrawberrySeed": true,
  },
);

group(
  { color: "#ffb700", width: (attr) => attr.approachDistance ?? 8, height: 8, offset: [-8, -4] },
  {
    npc: { height: 10, offset: [-4, 0], anchorY: "bottom" },
    "everest/npc": true,
    "MaxHelpingHand/MoreCustomNPC": true,
    "luaCutscenes/luaTalker": { width: undefined, height: undefined },
  },
);

group(
  {
    color: "#3962e1",
    width: 16,
    height: 16,
    anchorX: "center",
    anchorY: "center",
    name: "FakeHeart",
  },
  {
    "VivHelper/FakeHeartGem": true,
    "FemtoHelper/CustomFakeHeart": true,
  },
);

ssm["VivHelper/HideRoomInMap"] = { color: "#000000" };

group(
  {
    color: "#ff00ff",
    name: "DashCode",
  },
  {
    "vitellary/dashcodecontroller": true,
    "Sardine7/DashCodeTrigger": true,
  },
);

group(
  { color: "#ffffff", name: "Memorial", width: 60, height: 80, offset: [-30, -60] },
  {
    memorial: { width: 40, height: 60, offset: [-20, -60] },
    "everest/memorial": "memorial",
    "MaxHelpingHand/CustomMemorialWithDreamingAttribute": {
      offset: [0, 0],
      anchorX: "center",
      anchorY: "bottom",
    },
  },
);

ssm["BrokemiaHelper/trollStrawberry"] = {
  color: "#e92727",
  name: "TrollStrawberry",
  width: 16,
  height: 16,
  anchorX: "center",
  anchorY: "center",
};

group(
  {
    color: "#37f0c8",
  },
  {
    "CollabUtils2/ChapterPanelTrigger": {
      name: (attr) => "ChapterPanelTrigger{" + validateMapName(attr.map) + "}",
    },
    "CollabUtils2/JournalTrigger": true,
  },
);
//#endregion

export const IgnoreUnhandled = {
  //#region Important Triggers
  importantTriggers: new Set([
    "noRefillTrigger",
    "windTrigger",
    "windAttackTrigger",
    "eventTrigger",
    "setSubpixelTrigger",
    "stopBoostTrigger",
    "everest/changeInventoryTrigger",
    "everest/completeAreaTrigger",
    "vitellary/customwindtrigger",
    "DJMapHelper/maxDashesTrigger",
    "MoreDasheline/HairColorTrigger",
    "FrostHelper/NoMovementTrigger",
    "vitellary/nodashtrigger",
    "VivHelper/BasicInstantTeleportTrigger",
    "VivHelper/CustomInstantTeleportTrigger",
    "VivHelper/ITPT1Way",
    "VivHelper/TeleportTarget",
    "ContortHelper/TeleportationTriggerLevel1",
    "ContortHelper/TeleportationTriggerLevel2",
    "ContortHelper/TeleportationTriggerLevel3",
    "ContortHelper/TeleportationTriggerLevel4",
    "ContortHelper/TeleportationTriggerLevel5",
    "ContortHelper/TeleportationTarget",
    "VivHelper/MainInstantTeleportTrigger",
    "SJ2021/BasicInstantTeleportTrigger",
    "ContortHelper/MomentumModifierTrigger",
    "StrawberryJam2021/liftBoostTrigger",
    "XaphanHelper/TeleportToChapterTrigger",
    "DJMapHelper/teleportTrigger",
    "DJMapHelper/badelineBoostTeleport",
    "AurorasHelper/ForcedMovementTrigger",
    "MaxHelpingHand/SetCustomInventoryTrigger",
    "SSMHelper/DashCancelTrigger",
    "FrostHelper/SnowballTrigger",
    "FrostHelper/StopCustomSnowballTrigger",
    "progHelper/setPlayerSpeedTrigger",
    "SpringCollab2020/SwapDashTrigger",
    "VivHelper/InfDashTrigger",
    "SJ2021/DashJumpCountResetTrigger",
    "MoreDasheline/MaxDashTrigger",
    "FrostHelper/EntityMover",
    "spirialis/timegrabtrigger",
  ]),
  //#endregion
  //#region Variant Triggers
  variantTriggers: new Set([
    "ExtendedVariantMode/IntegerExtendedVariantTrigger",
    "ShroomHelper/TimeModulationTrigger",
    "ExtendedVariantMode/FloatExtendedVariantFadeTrigger",
    "ExtendedVariantMode/BooleanExtendedVariantTrigger",
    "ExtendedVariantTrigger",
    "ExtendedVariantMode/ExtendedVariantTrigger",
    "ExtendedVariantMode/FloatExtendedVariantTrigger",
    "ExtendedVariantMode/BooleanVanillaVariantTrigger",
    "ExtendedVariantMode/JumpCountTrigger",
    "ExtendedVariantMode/ResetVariantsTrigger",
    "GravityHelper/GravityTrigger",
    "ExtendedVariantMode/GameSpeedTrigger",
    "ExtendedVariantMode/SetJumpCountTrigger",
    "ExtendedVariantMode/DontRefillDashOnGroundTrigger",
    "ForceVariantTrigger",
  ]),
  //#endregion
  //#region Misc Gameplay Triggers
  miscGameplayTriggers: new Set([
    "killbox",
    "changeRespawnTrigger",
    "spawnFacingTrigger",
    "detachFollowersTrigger",
    "goldenBerryCollectTrigger",
    "respawnTargetTrigger",
    "everest/activateDreamBlocksTrigger",
    "everest/lavaBlockerTrigger",
    "everest/coreModeTrigger",
    "everest/crystalShatterTrigger",
    "ArphimigonHelper/KillTrigger",
    "CollabUtils2/SilverBerryCollectTrigger",
    "CollabUtils2/SpeedBerryCollectTrigger",
    "CollabUtils2/RainbowBerryUnlockCutsceneTrigger",
    "CollabUtils2/MiniHeartDoorUnlockCutsceneTrigger",
    "CollabUtils2/GoldenBerryPlayerRespawnPoint",
    "PlatinumStrawberry/PlatBerryCollectTrigger",
    "SorbetHelper/FlagToggledKillbox",
    "SorbetHelper/KillZone",
    "DJMapHelper/killBoxTrigger",
    "CherryHelper/PlayerStateChange",
    "SpringCollab2020/BlockJellySpawnTrigger",
    "SpringCollab2020/StrawberryCollectionField",
    "SpringCollab2020/LeaveTheoBehindTrigger",
    "SpringCollab2020/DisableIcePhysicsTrigger",
    "FrostHelper/CassetteTempoTrigger",
    "BounceHelper/BounceHelperTrigger",
    "GameHelper/EntityModifier",
    "Bitsbolts/BlockTransition",
    "FrostHelper/CapDashOnGroundTrigger",
    "vitellary/canceltimecrystaltrigger",
    "AurorasHelper/ResetStateTrigger",
    "GravityHelper/SpawnGravityTrigger",
    "MaxHelpingHand/PauseBadelineBossesTrigger",
    "ContortHelper/FreezeTrigger",
    "DisposableTheo/DisposableTheoTrigger",
    "SJ2021/CoreModeTriggerNoFlash",
    "SJ2021/TheoKillBoxTrigger",
    "isaBag/waterBoost",
  ]),
  //#endregion
  //#region Flag Triggers
  flagTriggers: new Set([
    "everest/flagTrigger",
    "FlaglinesAndSuch/FlagIfFlag",
    "YetAnotherHelper/FlagKillBox",
    "EeveeHelper/FlagToggleModifier",
    "VivHelper/TimedFlagTrigger",
    "vitellary/triggertrigger",
    "EeveeHelper/FlagGateContainer",
    "vitellary/flagsequencecontroller",
    "MaxHelpingHand/FlagLogicGate",
    "FrostHelper/LoopActivator",
    "FrostHelper/OnCounterActivator",
    "FrostHelper/SessionCounterTrigger",
    "FrostHelper/IfCounterActivator",
    "FrostHelper/OnSpawnActivator",
    "FrostHelper/IfActivator",
    "FrostHelper/OnDeathActivator",
    "FrostHelper/OnFlagActivator",
    "XaphanHelper/ResetFlagsTrigger",
    "FrostHelper/TemporaryFlagTrigger",
    "GameHelper/TemporaryFlagTrigger",
    "vitellary/flaginsidetrigger",
    "FlaglinesAndSuch/FlagLogicGate",
    "ConditionHelper/ConditionFlagTrigger",
    "Bitsbolts/Flags",
    "XaphanHelper/GlobalFlagTrigger",
    "AurorasHelper/LogicFlagCounterTrigger",
    "SSMHelper/CustomCheatTrigger",
    "MaxHelpingHand/SetFlagOnSpawnTrigger",
    "Bitsbolts/SaveDataFlagSync",
  ]),
  //#endregion
  //#region Camera Triggers
  camera: new Set([
    "everest/smoothCameraOffsetTrigger",
    "cameraOffsetTrigger",
    "cameraTargetTrigger",
    "rumbleTrigger",
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
    "SpringCollab2020/SmoothCameraOffsetTrigger",
    "SpringCollab2020/FlagToggleSmoothCameraOffsetTrigger",
    "MaxHelpingHand/OneWayCameraTrigger",
    "HonlyHelper/CameraTargetCrossfadeTrigger",
    "ExCameraDynamics/CameraZoomTrigger",
    "Bitsbolts/UnlockCamera",
    "FrostHelper/EasedCameraZoomTrigger",
    "FurryHelper/momentumCameraOffsetTrigger",
  ]),
  //#endregion
  //#region Dialog Triggers
  dialogTriggers: new Set([
    "bird",
    "playbackTutorial",
    "everest/dialogTrigger",
    "everest/coreMessage",
    "everest/CustomHeightDisplayTrigger",
    "everest/customBirdTutorialTrigger",
    "everest/customBirdTutorial",
    "minitextboxTrigger",
    "DJMapHelper/talkToBadelineTrigger",
    "MaxHelpingHand/CustomCh3Memo",
    "luaCutscenes/luaCutsceneTrigger",
    "VivHelper/ConfettiTrigger",
    "SpringCollab2020/CustomBirdTutorialTrigger",
    "ArphimigonHelper/CoreMessage",
    "ShroomHelper/ShroomBookInteraction",
    "MemorialHelper/ParallaxText",
    "FemtoHelper/CinematicText",
    "MaxHelpingHand/ExtendedDialogCutsceneTrigger",
    "MaxHelpingHand/Comment",
    "XaphanHelper/SubAreaNameTrigger",
    "ContortHelper/CustomMemo",
    "FlaglinesAndSuch/DialogIfFlag",
    "MaxHelpingHand/CustomTutorialWithNoBird",
    "VivHelper/CustomCoreMessage",
    "ContortHelper/CustomNote",
    "ContortHelper/CustomConfettiTrigger",
    "JungleHelper/UITextTrigger",
    "rubysentities/heightdisplaytrigger",
    "FemtoHelper/CinematicTextTrigger",
    "FlaglinesAndSuch/MiniTextboxIfFlag",
    "JungleHelper/UIImageTrigger",
  ]),
  //#endregion
  //#region Other Unhandled
  other: new Set([
    "floatingDebris",
    "soundSource",
    "resortLantern",
    "cobweb",
    "clothesline",
    "summitcloud",
    "lightbeam",
    "musicFadeTrigger",
    "musicTrigger",
    "hanginglamp",
    "lamp",
    "torch",
    "bigWaterfall",
    "flutterbird",
    "wire",
    "moonCreature",
    "altMusicTrigger",
    "tentacles",
    "trapdoor",
    "cliffflag",
    "cliffside_flag",
    "templeMirror",
    "templeEye",
    "waterfall",
    "bonfire",
    "door",
    "foregroundDebris",
    "lightFadeTrigger",
    "bloomFadeTrigger",
    "blackholeStrength",
    "playbackBillboard",
    "coloredlights/hanginglamp",
    "everest/ambienceTrigger",
    "moonGlitchBackgroundTrigger",
    "PrismaticHelper/StylegroundsPanel",
    "MaxHelpingHand/RainbowSpinnerColorController",
    "LunaticHelper/InvisibleLightSource",
    "EeveeHelper/SMWTrack",
    "CommunalHelper/MusicParamTrigger",
    "FrostHelper/BloomColorTrigger",
    "ExtendedVariantMode/ColorGradeTrigger",
    "MaxHelpingHand/SetFlagOnSpawnController",
    "vitellary/editdepthtrigger",
    "ContortHelper/RandomSoundTrigger",
    "VivHelper/ActivateCPP",
    "VivHelper/CPP",
    "VivHelper/CustomLightbeam",
    "MaxHelpingHand/ColorGradeFadeTrigger",
    "ContortHelper/BurstEffect",
    "VivHelper/GoldenBerryToFlag",
    "SpringCollab2020/UnderwaterSwitchController",
    "SpringCollab2020/FlagToggleWaterfall",
    "SpringCollab2020/LitBlueTorch",
    "pandorasBox/dreamDashController",
    "pandorasBox/tileGlitcher",
    "FrostHelper/LightningColorTrigger",
    "SpringCollab2020/ChangeThemeTrigger",
    "SpringCollab2020/CancelLightningRemoveRoutineTrigger",
    "pandorasBox/coloredWaterfall",
    "pandorasBox/lamp",
    "SpringCollab2020/invisibleLightSource",
    "SpringCollab2020/RemoveLightSourcesTrigger",
    "pandorasBox/entityActivator",
    "SpringCollab2020/ColorGradeFadeTrigger",
    "MaxHelpingHand/ReskinnableFloatingDebris",
    "SJ2021/AllInOneMask",
    "MaxHelpingHand/PersistentMusicFadeTrigger",
    "CherryHelper/AssistRect",
    "ContortHelper/AnxietyEffectTrigger",
    "ExtendedVariantMode/ExtendedVariantController",
    "SJ2021/CassetteMusicTransitionController",
    "FrostHelper/EntityBatcher",
    "SJ2021/WonkyCassetteBlockController",
    "ContortHelper/BurstZone",
    "ContortHelper/AnxietyEffectController",
    "SJ2021/EntityDespawner",
    "DJMapHelper/colorGradeTrigger",
    "SJ2021/ColorGradeMask",
    "MaxHelpingHand/FlagToggleMusicFadeTrigger",
    "ContortHelper/GlitchEffectTrigger",
    "SJ2021/GlowController",
    "SJ2021/LightingMask",
    "SJ2021/BloomMask",
    "SummitBackgroundManager",
    "MaxHelpingHand/MadelineSilhouetteTrigger",
    "FrostHelper/RainbowTilesetController",
    "FrostHelper/EntityRainbowifyController",
    "MaxHelpingHand/RainbowSpinnerColorTrigger",
    "MaxHelpingHand/RainbowSpinnerColorAreaController",
    "MaxHelpingHand/FlagDecalXML",
    "achievementHelper/triggerAchievement",
    "ContortHelper/MadelineSpotlightModifierTrigger",
    "VivHelper/CustomTorch",
    "ContortHelper/LightSource",
    "MaxHelpingHand/FlagDecal",
    "EeveeHelper/FloatyContainer",
    "GameHelper/EntityRespriter",
    "MaxHelpingHand/BloomStrengthFadeTrigger",
    "pandorasBox/coloredBigWaterfall",
    "HonlyHelper/FloatyBgTile",
    "EeveeHelper/AttachedContainer",
    "XaphanHelper/InGameMapRoomController",
    "MaxHelpingHand/StylegroundFadeController",
    "VivHelper/LightningMuter",
    "GameHelper/AutoSaveTrigger",
    "ContortHelper/FlickerLightSource",
    "ContortHelper/LightSourceZone",
    "VivHelper/RoomWrapController",
    "FlaglinesAndSuch/MusicIfFlag",
    "MaxHelpingHand/SetDarknessAlphaTrigger",
    "StyleMaskHelper/LightingMask",
    "StyleMaskHelper/StylegroundMask",
    "EeveeHelper/DepthModifier",
    "XaphanHelper/CustomTorch",
    "FancyTileEntities/TileSeedController",
    "ChroniaHelper/FloatyBgTile",
    "FrostHelper/ColoredLightbeam",
    "DJMapHelper/startPoint",
    "FemtoHelper/CustomMoonCreature",
    "FlaglinesAndSuch/CustomFlagline",
    "FrostHelper/DecalContainer",
    "JungleHelper/Cobweb",
    "FrostHelper/WireLamps",
    "FrostHelper/ArbitraryShapeCloud",
    "CommunalHelper/UnderwaterMusicController",
    "StyleMaskHelper/AllInOneMask",
    "FrostHelper/BloomColorFadeTrigger",
    "StyleMaskHelper/BloomMask",
    "YetAnotherHelper/RemoveLightSourcesTrigger",
    "ShroomHelper/GradualChangeColorGradeTrigger",
    "FrostHelper/ArbitraryBloom",
    "MaxHelpingHand/AllBlackholesStrengthTrigger",
    "MaxHelpingHand/ParallaxFadeOutController",
    "FemtoHelper/PseudoPolyhedron",
    "VivHelper/DepthSetter",
    "SpringCollab2020/LightningStrikeTrigger",
    "ContortHelper/AlphaLerpLightSource",
    "HonlyHelper/Moth",
    "FemtoHelper/ParticleEmitter",
    "FrostHelper/HackfixFlagLightSourceZone",
    "vitellary/bloomstrengthtrigger",
    "MaxHelpingHand/AmbienceVolumeTrigger",
    "Sardine7/AmbienceTrigger",
    "VivHelper/CustomHangingLamp",
    "FrostHelper/StylegroundMoveTrigger",
    "SJ2021/WavyAirField",
    "FrostHelper/StaticDoor",
    "SJ2021/CustomAscendManager",
    "FrostHelper/BloomColorPulseTrigger",
    "CommunalHelper/LightningController",
    "ContortHelper/LightningStrikeTrigger",
    "ContortHelper/ScreenWipeModifierTrigger",
    "spirialis/waterfloatingobject",
    "CommunalHelper/CloudscapeColorTransitionTrigger",
    "CommunalHelper/CloudscapeLightningConfigurationTrigger",
    "FemtoHelper/CustomParallaxBigWaterfall",
    "FlaglinesAndSuch/BonfireLight",
    "SJ2021/SpriteSwapTrigger",
    "SJ2021/StylegroundMask",
    "VivHelper/EntityMuter",
    "ContortHelper/FlashTrigger",
    "CommunalHelper/StopLightningControllerTrigger",
    "ContortHelper/ColorLerpLightSource",
    "FrostHelper/LightOccluderEntity",
    "MaxHelpingHand/ExpandTriggerController",
    "SJ2021/LightSourceLimitController",
    "SJ2021/PhotosensitiveFlagController",
    "SJ2021/WonkyMinorCassetteBlockController",
    "VivHelper/DebrisLimiter",
    "VivHelper/HoldableBarrierController2",
    "YetAnotherHelper/SpikeJumpThruController",
    "MaxHelpingHand/SeekerBarrierColorController",
    "MaxHelpingHand/LitBlueTorch",
    "JackalCollabHelper/DarkMatterController",
    "ContortHelper/LightningStrikesController",
    "MaxHelpingHand/SpeedBasedMusicParamTrigger",
    "spirialis/rainblocker",
    "FrostHelper/CustomFlutterBird",
    "ArphimigonHelper/ColorGradeTrigger",
  ]),
  //#endregion
};

//#endregion

//#region Collectibles
//#region Definitions
export const COLLECTIBLE_DEFS = {};
const cd = COLLECTIBLE_DEFS;

cd.goldenBerry = [
  { match: (attr) => !attr.winged, collectible: { name: "Golden Berry", formValue: "0" } },
  { match: (attr) => !!attr.winged, collectible: { name: "Winged Golden Berry", formValue: "4" } },
];
cd["MaxHelpingHand/GoldenStrawberryCustomConditions"] = [
  { match: (attr) => !attr.winged, collectible: { name: "Golden Berry", formValue: "0" } },
];
cd.memorialTextController = [
  { match: () => true, collectible: { name: "Winged Golden Berry", formValue: "4" } },
];
cd["JungleHelper/TreeDepthController"] = cd.memorialTextController;

cd.strawberry = [
  { match: (attr) => !attr.moon && !attr.winged, collectible: { name: "Strawberry", formValue: "2" } },
  { match: (attr) => !!attr.moon && !attr.winged, collectible: { name: "Moon Berry", formValue: "3" } },
  {
    match: (attr) => !attr.moon && !!attr.winged,
    collectible: { name: "Winged Strawberry", formValue: "2" },
  },
];

cd["SpringCollab2020/returnBerry"] = cd.strawberry;
cd["LunaticHelper/StrawberryWithReturn"] = cd.strawberry;
cd["SorbetHelper/ReturnBerry"] = cd.strawberry;
cd["ParrotHelper/FlagBerry"] = cd.strawberry;
cd["FrostTemple/ReturnStrawberry"] = cd.strawberry;

cd["DSidesHelper/TeleportMoonBerry"] = [
  { match: (attr) => !!attr.moon && !attr.winged, collectible: { name: "Moon Berry", formValue: "3" } },
];

cd["CollabUtils2/SilverBerry"] = [
  { match: () => true, collectible: { name: "Silver Berry", formValue: "1" } },
];
cd["CollabUtils2/SpeedBerry"] = [
  { match: () => true, collectible: { name: "Speed Berry", formValue: "10" } },
];
cd["CollabUtils2/RainbowBerry"] = [
  { match: () => true, collectible: { name: "Rainbow Berry", formValue: "13", formVariant: "3" } },
];
cd["PlatinumStrawberry/PlatinumStrawberry"] = [
  { match: () => true, collectible: { name: "Platinum Berry", formValue: "5" } },
];
cd["DSidesPlatinum/PlatinumStrawberry"] = cd["PlatinumStrawberry/PlatinumStrawberry"];

cd.cassette = [{ match: () => true, collectible: { name: "Cassette", formValue: "6" } }];

const crystalHeartDef = [{ match: () => true, collectible: { name: "Crystal Heart", formValue: "7" } }];
cd.blackGem = crystalHeartDef;
cd["CollabUtils2/CrystalHeart"] = crystalHeartDef;
cd["CollabUtils2/MiniHeart"] = crystalHeartDef;
cd["MaxHelpingHand/ReskinnableCrystalHeart"] = crystalHeartDef;
cd["AdventureHelper/CustomCrystalHeart"] = crystalHeartDef;
//#endregion

export function extractCollectibles(mapData) {
  const levelsNode = mapData.children?.find((c) => c.name === "levels");
  if (!levelsNode) return [];

  const results = [];

  for (const level of levelsNode.children) {
    const roomName = level.attributes?.name ?? "?";
    const entitiesNode = level.children?.find((c) => c.name === "entities");
    if (!entitiesNode) continue;

    for (const entity of entitiesNode.children) {
      const defs = COLLECTIBLE_DEFS[entity.name];
      if (!defs) continue;
      for (const def of defs) {
        if (def.match(entity.attributes || {})) {
          results.push({
            name: def.collectible.name,
            formValue: def.collectible.formValue,
            formVariant: def.collectible.formVariant || "",
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

// Extracts collectibles from parsed map data and returns them in the form's 5-tuple format:
// [[collectibleValue, variantValue, note, count, globalCount], ...]
export function extractCollectiblesForForm(mapData) {
  const raw = extractCollectibles(mapData);
  const counts = {};
  for (const item of raw) {
    if (!item.formValue) continue;
    const key = item.formValue + "\0" + item.formVariant;
    counts[key] = counts[key] || { formValue: item.formValue, formVariant: item.formVariant, count: 0 };
    counts[key].count++;
  }
  return Object.values(counts).map((c) => [c.formValue, c.formVariant, "", String(c.count), ""]);
}
//#endregion

//#region Validation
function validateColorOr(hexString, defaultValue) {
  if (typeof hexString !== "string") return defaultValue;
  if (!hexString.startsWith("#")) {
    if (isValidCssColor(hexString)) return hexString;
    hexString = "#" + hexString;
  }
  const hex = hexString.slice(1);
  return /^[0-9A-Fa-f]{6}$/.test(hex) ? hexString : defaultValue;
}

// Transforms ``path`` like "A/B/C" into a valid map name like "C", or returns null if invalid.
function validateMapName(path) {
  if (typeof path !== "string") return null;
  const parts = path.split("/");
  const name = parts[parts.length - 1];
  return /^[\w\s-]+$/.test(name) ? name : null;
}

function isValidCssColor(str) {
  const s = new Option().style;
  s.color = str;
  return s.color !== "";
}

function validateNumber(value) {
  return typeof value === "number" && !isNaN(value) ? value : 0;
}

/**
 * Checks if a room should be hidden in anti-spoiler mode.
 * A room is hidden if it contains a "VivHelper/HideRoomInMap" entity.
 */
export function isRoomHidden(room) {
  return room.entities?.some((e) => e.name === "VivHelper/HideRoomInMap") ?? false;
}
//#endregion

//#region Unhandled entities extraction
/**
 * Returns a deduplicated list of unhandled entity/trigger types.
 * Each entry has: { name, type ("entity"|"trigger"), count, entity, room, x, y }
 * where entity is the raw object, room/x/y point to the first instance and count is the total occurrences.
 */
export function extractUnhandledEntities(rooms) {
  // Build a flat set of all ignored names across all IgnoreUnhandled groups
  const ignoredNames = new Set();
  for (const nameSet of Object.values(IgnoreUnhandled)) {
    for (const name of nameSet) {
      ignoredNames.add(name);
    }
  }

  // key = "entity:name" or "trigger:name" → first-seen entry
  const seen = new Map();

  for (const room of rooms) {
    for (const entity of room.entities ?? []) {
      if (IndividualEntityMap[entity.name]) continue;
      if (BatchedEntityMap[entity.name]) continue;
      if (SimpleShapeMap[entity.name]) continue;
      if (ignoredNames.has(entity.name)) continue;
      const key = `entity:${entity.name}`;
      const existing = seen.get(key);
      if (existing) {
        existing.count++;
      } else {
        seen.set(key, {
          name: entity.name,
          type: "entity",
          count: 1,
          entity,
          room: room.name,
          x: room.x + (entity.attributes?.x ?? 0),
          y: room.y + (entity.attributes?.y ?? 0),
        });
      }
    }

    for (const trigger of room.triggers ?? []) {
      if (SimpleShapeMap[trigger.name]) continue;
      if (ignoredNames.has(trigger.name)) continue;
      const key = `trigger:${trigger.name}`;
      const existing = seen.get(key);
      if (existing) {
        existing.count++;
      } else {
        seen.set(key, {
          name: trigger.name,
          type: "trigger",
          count: 1,
          entity: trigger,
          room: room.name,
          x: room.x + (trigger.attributes?.x ?? 0),
          y: room.y + (trigger.attributes?.y ?? 0),
        });
      }
    }
  }

  // Sort by count descending, then name ascending for ties
  return [...seen.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
//#endregion

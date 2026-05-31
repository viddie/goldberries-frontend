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
  COMMON_ENTITIES: 8,
  SOLIDS: 10,
  ENTITIES: 20,
  IMPORTANT_ENTITIES: 30,
  UI: 50,
};

/*
TO ADD:
- birdForsakenCityGem as Crystal heart renderer
- multi-room strawberry, rust berry, dream berry, core berry, water berry
  - https://goldberries.net/map/3742/view
  - https://goldberries.net/map/4574/view
*/

//#region Renderers
// These are entities that need special rendering
export const IndividualEntityMap = {
  goldenBerry: () => GoldenBerryRenderer,
  "MaxHelpingHand/GoldenStrawberryCustomConditions": () => GoldenBerryRenderer,
  "CustomPoints/CustomPointsGolden": () => GoldenBerryRenderer,
  "CollabUtils2/SilverBerry": () => SilverBerryRenderer,
  strawberry: () => StrawberryRenderer,
  "DSidesHelper/TeleportMoonBerry": () => StrawberryRenderer,
  "SpringCollab2020/returnBerry": () => StrawberryRenderer,
  "LunaticHelper/StrawberryWithReturn": () => StrawberryRenderer,
  "SorbetHelper/ReturnBerry": () => StrawberryRenderer,
  "FrostTemple/ReturnStrawberry": () => StrawberryRenderer,
  "MaxHelpingHand/CustomizableBerry": () => StrawberryRenderer,
  // "MaxHelpingHand/SecretBerry": () => StrawberryRenderer,
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
  "RosewoodHelper/OneDashWingedStrawberry": () => WingedGoldenBerryRenderer,
  "ShroomHelper/OneDashWingedStrawberry": () => WingedGoldenBerryRenderer,
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

const colors = {
  solid: "#ffffff",
  gray1: "#dddddd",
  gray2: "#a2a2a2",
  gray3: "#9b9b9b",
  glass: "#99d9ea",
  swapBlock: "orange",
  fallingBlock: "#12fffb",
  movingBlock: "#cc00ff",
  kevin: "#285aff",
  dream: "#777777",
  coreBlock: "#f62121",
  movingPlatform: "#dda94a",
  switchGate: "#00a6ff",
  collectibleDoor: "#3962e1",
  crackedBlock: "#e81a1a",
  pushBlock: "#f270e1",
  towels: "#d900ff",
  books: "#26e615",
  crates: "#e4b611",
  golden: "#ffdf00",
  silver: "#c0c0c0",
  platinum: "#e5e4e2",
  cloud: "#d7f2ff",
  cloudFragile: "#f27dff",
  elevator: "#ff7a7a",
  refill: "#5eff5e",
  refillTwoDash: "#ff4be7",
  jumpRefill: "#77bde6",
  specialRefill: "#dd178a",
  shadowDash: "#8b00ff",
  spring: "#c96800",
  springSpecial: "#16bd00",
  springIron: "#aebebe",
  dashSwitch: "#1aff00",
  lightning: "#d3b548",
  bird: "#00a6ff",
  bubble: "#31ff7d",
  bubbleRed: "#ff3e3e",
  bubbleSpecial: "#f531ff",
  bubbleDashless: "#31baff",
  feather: "yellow",
  toggleSwitch: "#15b800",
  coreIce: "#00d9ff",
  coreFire: "#e12525",
  spinner: "#7a5dd8",
  seeker: "#a832a8",
  theo: "#00d0ff",
  jelly: "#0077ff",
  bumper: "#3d44ff",
  plant: "#00ff00",
  fish: "#ffa43d",
  fakeWall: "#888888",
  water: "#0066ff",
  fire: "#ff4000",
  specialArea: "#ff00ff",
  baddy: "#931ebd",
  darkMatter: "#131313",
  respawn: "#ff0000",
  bino: "#6b6b6b",
  key: "#ffff20",
  strawberry: "#e92727",
  speedberry: "#ffb700",
  heart: "#3962e1",
  npc: "#ffe100",
  chapterPanel: "#37f0c8",
};

const defaultCassetteColor = (index) => {
  if (index === 1) return "#f049be";
  if (index === 2) return "#fcdc3a";
  if (index === 3) return "#38e04e";
  return "#49aaf0";
};

//#region Solids
group(
  {
    color: colors.solid,
    name: "",
    opacity: fixedSolidOpacity,
  },
  {
    solid: true,
    "FancyTileEntities/FancySolidTiles": true,
    bridge: { name: "Bridge" },
    "vitellary/customprologuebridge": "bridge",
    glassBlock: { color: colors.glass, name: "GlassBlock" },
    "MaxHelpingHand/CustomizableGlassBlock": "glassBlock",
    "VivHelper/CustomDepthTileEntity": true,
    fakeBlock: true,
    conditionBlock: { name: "ConditionBlock", opacity: movingSolidOpacity },
    "EmHelper/Monumentswitchblock": {
      name: "MonumentSwitchBlock",
      color: (attr) => validateColorOr(attr.color, colors.solid),
      opacity: movingSolidOpacity,
    },
  },
);

ssm.crumbleWallOnRumble = {
  color: colors.solid,
  name: "CrumbleWallOnRumble",
  opacity: movingSolidOpacity,
};

group(
  { color: colors.solid, name: "MoonBlock", opacity: movingSolidOpacity },
  {
    floatySpaceBlock: true,
    "SpringCollab2020/floatierSpaceBlock": { name: "FloatierMoonBlock" },
    "BrokemiaHelper/floatierSpaceBlock": "SpringCollab2020/floatierSpaceBlock",
    "MaxHelpingHand/FloatySpaceBlockWithAttachedSidewaysJumpthruSupport": {
      name: "MoonBlockWithJumpThrough",
    },
    "VivHelper/FloatyBreakBlock": { name: "[MoonBlock]" },
    "FancyTileEntities/FancyFloatySpaceBlock": true,
    "CommunalHelper/DreamFloatySpaceBlock": { color: colors.dream, name: "DreamMoonBlock" },
  },
);

group(
  { color: colors.swapBlock, name: "S", opacity: movingSolidOpacity },
  {
    swapBlock: true,
    "MaxHelpingHand/ReskinnableSwapBlock": true,
    "FrostHelper/ToggleSwapBlock": { name: "[S]" },
    "XaphanHelper/FlagSwapBlock": { name: "[S]" },
    "spirialis/swapblock": { name: "[S]" },
  },
);

group(
  { color: colors.swapBlock, name: "[Z]", opacity: movingSolidOpacity },
  {
    zipMover: { name: "Z" },
    "AdventureHelper/ZipMoverNoReturn": true,
    "FrostHelper/CustomZipMover": { name: "Z" },
    "AdventureHelper/LinkedZipMover": true,
    "AdventureHelper/LinkedZipMoverNoReturn": true,
    "VivHelper/CornerBoostZipMover": true,
    "VivHelper/CustomZipMover": true,
    "CommunalHelper/DreamZipMover": { color: colors.dream },
    "spirialis/timezipmover": true,
    "BSS/ZipMover": { name: "Z" },
    "CommunalHelper/StationBlock": { name: "StationBlock" },
    "CommunalHelper/ConnectedZipMover": true,
    "CommunalHelper/SJ/DashZipMover": true,
    "VivHelper/VariantZipMover": true,
    "VivHelper/CurvedZipMover2": true,
  },
);

group(
  { color: colors.fallingBlock, name: "F", opacity: movingSolidOpacity },
  {
    fallingBlock: true,
    "FancyTileEntities/FancyFallingBlock": true,
    "VortexHelper/AutoFallingBlock": true,
    "VivHelper/CustomFallingBlock": true,
    "AdventureHelper/GroupedFallingBlock": { name: "[F]" },
    "VivHelper/CornerBoostFallingBlock": { name: "[F]" },
    "spirialis/timefallingblock": { name: "[F]" },
    finalBossFallingBlock: { color: colors.movingBlock },
    finalBossMovingBlock: ["finalBossFallingBlock", { name: "M" }],
  },
);

group(
  {
    color: colors.movingBlock,
    renderer: MoveBlockContentRenderer,
  },
  {
    "CommunalHelper/ConnectedMoveBlock": true,
    "CommunalHelper/DreamMoveBlock": { color: colors.dream },
    "CommunalHelper/CassetteMoveBlock": {
      color: (attr) => validateColorOr(attr.customColor, defaultCassetteColor(attr.index)),
    },
  },
);

group(
  { color: colors.fallingBlock, name: "R", opacity: movingSolidOpacity },
  {
    "HonlyHelper/RisingBlock": true,
  },
);

group(
  { color: colors.fallingBlock, name: "C", opacity: movingSolidOpacity },
  {
    crumbleBlock: true,
    "ShroomHelper/CrumbleBlockOnTouch": { name: "(C)" },
    "MaxHelpingHand/CustomizableCrumblePlatform": true,
    "SpringCollab2020/safeRespawnCrumble": { name: "SafeRespawnCrumble" },
    "SafeRespawnCrumble/SafeRespawnCrumble": "SpringCollab2020/safeRespawnCrumble",
  },
);

group(
  { color: colors.fallingBlock, name: "D", opacity: movingSolidOpacity },
  {
    dashBlock: true,
    "VivHelper/CustomDashBlock": true,
    "FrostHelper/DashBlockDestroyAttached": true,
    "ChronoHelper/StaticDebrisDashBlock": true,
    "FancyTileEntities/FancyDashBlock": true,
    "SJ2021/ShatterDashBlock": {
      name: (attr) => "ShatterDashBlock{Speed = " + validateNumber(attr.SpeedRequirement) + "}",
    },
    "BSS/StaticDebrisDashBlock": true,
    "CelestialArchive/ShatterDashBlock": "SJ2021/ShatterDashBlock",
  },
);

group(
  { color: colors.kevin, name: "Kevin", opacity: movingSolidOpacity },
  {
    crushBlock: true,
    "MaxHelpingHand/ReskinnableCrushBlock": true,
    "CherryHelper/NonReturnKevin": { name: "[Kevin]" },
    "spirialis/timekevin": { name: "[Kevin]" },
    "vitellary/flagkevin": { name: "[Kevin]" },
    "CommunalHelper/Melvin": { name: "Melvin", color: "#d73c87" },
  },
);

group(
  {
    color: colors.coreBlock,
    name: "CoreBlock",
    opacity: movingSolidOpacity,
  },
  {
    bounceBlock: true,
    "vitellary/fastbounceblock": { name: "[CoreBlock]" },
    "SaladimHelper/DirtBounceBlock": { color: "#8B4513", name: "DirtBounceBlock" },
  },
);

group(
  { color: colors.movingPlatform, name: "MovingPlatform", opacity: movingSolidOpacity },
  {
    movingPlatform: true,
    sinkingPlatform: { name: "SinkingPlatform" },
    "SpringCollab2020/MultiNodeMovingPlatform": true,
    "MaxHelpingHand/MultiNodeMovingPlatform": true,
    "spirialis/timemovingplatform": { name: "TimeMovingPlatform" },
    "pandorasBox/circularResortPlatform": { name: "CircularMovingPlatform" },
  },
);

group(
  { color: colors.dream, name: "DreamBlock", opacity: movingSolidOpacity },
  {
    dreamBlock: true,
    "FrostHelper/CustomDreamBlock": true,
    "CommunalHelper/ConnectedDreamBlock": { name: "ConnectedDreamBlock" },
    "BounceHelper/BounceDreamBlock": { name: "BounceDreamBlock" },
  },
);

group(
  { color: colors.switchGate, name: "SwitchGate", opacity: movingSolidOpacity },
  {
    switchGate: true,
    "MaxHelpingHand/FlagSwitchGate": true,
    "SpringCollab2020/FlagSwitchGate": true,
    "MaxHelpingHand/ShatterFlagSwitchGate": true,
    "VortexHelper/VortexSwitchGate": true,
    "CommunalHelper/DreamSwitchGate": { color: colors.dream },
    "spirialis/timeswitchgate": { name: "TimeSwitchGate" },
    introCrusher: { name: "IntroCrusher" },
    "VivHelper/FlagIntroCrusher": "introCrusher",
    "MaxHelpingHand/MultiNodeFlagSwitchGate": { name: "MultiNodeSwitchGate" },
  },
);

group(
  { color: colors.gray1, name: "TempleGate", opacity: movingSolidOpacity },
  {
    templeGate: true,
    "XaphanHelper/FlagTempleGate": { name: "FlagTempleGate" },
    "vitellary/templegateall": { height: 48 },
    "batteries/battery_gate": { name: "BatteryGate", height: 48 },
    "pandorasBox/gate": { name: "FlagTempleGate", height: 48 },
    "SJ2021/GrabTempleGate": { name: "GrabTempleGate", height: 48 },
  },
);

ssm.moveBlock = { color: colors.moveBlock, renderer: MoveBlockContentRenderer };
ssm["vitellary/vitmoveblock"] = ssm.moveBlock;
ssm["spirialis/timemoveblock"] = ssm.moveBlock;

group(
  { color: colors.swapBlock, name: "LockBlock", width: 32, height: 32 },
  {
    lockBlock: true,
    "PrismaticHelper/MultiLockedDoor": {
      name: (attr) => (attr.keys || 1) + (attr.keys === 1 ? "Key" : "Keys") + "LockBlock",
    },
    "FrostHelper/TemporaryKeyDoor": {
      name: "TemporaryKeyLockBlock",
    },
  },
);

group(
  {
    color: colors.collectibleDoor,
    name: "CollectibleDoor",
    height: (attr) => attr.height * 2,
    anchorY: "center",
  },
  {
    "XaphanHelper/CollectableDoor": {
      color: (attr) => validateColorOr(attr.interiorColor, colors.collectibleDoor),
    },
    "MaxHelpingHand/SaveFileStrawberryGate": {
      color: colors.strawberry,
      name: "SaveFileStrawberryGate",
      height: 80,
    },
    "CollabUtils2/MiniHeartDoor": { name: "MiniHeartDoor" },
    heartGemDoor: { height: undefined, anchorY: undefined, name: "HeartGemDoor" },
  },
);

ssm.starJumpBlock = { color: "white", opacity: 0.8, name: "" };
group(
  {
    color: colors.crackedBlock,
    name: "CrackedBlock",
    opacity: movingSolidOpacity,
  },
  {
    templeCrackedBlock: true,
    "XaphanHelper/BreakBlock": { name: "BreakBlock" },
  },
);

group(
  {
    color: colors.towels,
    name: "Towels",
    opacity: movingSolidOpacity,
  },
  {
    redBlocks: true,
  },
);
group(
  {
    color: colors.books,
    name: "Books",
    opacity: movingSolidOpacity,
  },
  {
    greenBlocks: true,
  },
);
group(
  {
    color: colors.crates,
    name: "Crates",
    opacity: movingSolidOpacity,
  },
  {
    yellowBlocks: true,
  },
);
ssm["CustomClutterHelper/customClutterBlock"] = {
  opacity: movingSolidOpacity,
  color: (attr) =>
    attr.color === "red"
      ? colors.towels
      : attr.color === "green"
        ? colors.books
        : attr.color === "yellow"
          ? colors.crates
          : colors.solid,
  name: (attr) =>
    attr.color === "red"
      ? "Towels"
      : attr.color === "green"
        ? "Books"
        : attr.color === "yellow"
          ? "Crates"
          : "CustomClutterBlock",
};

ssm["CustomClutterHelper/customClutterSwitch"] = {
  color: (attr) =>
    attr.type === "red"
      ? colors.towels
      : attr.type === "green"
        ? colors.books
        : attr.type === "yellow"
          ? colors.crates
          : colors.solid,
  name: "ClutterSwitch",
  width: 32,
  height: 16,
};

group(
  {
    name: "CassetteBlock",
    color: (attr) => defaultCassetteColor(attr.index),
    opacity: movingSolidOpacity,
  },
  {
    cassetteBlock: true,
    "CommunalHelper/CassetteZipMover": { name: "CassetteZipMover" },
    "dsides/invisibleCassetteBlock": {
      name: "InvisibleCassetteBlock",
      outline: "dashed",
      opacity: 0.1,
    },
    "CommunalHelper/CustomCassetteBlock": true,
  },
);
ssm["SJ2021/WonkyCassetteBlock"] = {
  name: "WonkyCassetteBlock",
  color: (attr) => validateColorOr(attr.color, colors.switchGate),
  opacity: movingSolidOpacity,
};
ssm["XaphanHelper/JumpBlock"] = {
  name: "JumpBlock",
  color: (attr) => validateColorOr(attr.color, colors.solid),
  opacity: movingSolidOpacity,
};

ssm["VivHelper/CornerBoostBlock"] = { color: "white", name: "CornerBoostBlock", opacity: movingSolidOpacity };
ssm["cpopBlock"] = { color: "white", name: "CPOP\nBlock", opacity: movingSolidOpacity };
ssm.goldenBlock = { color: colors.golden, name: "GoldenBlock", opacity: movingSolidOpacity };
ssm["CollabUtils2/SilverBlock"] = { color: colors.silver, name: "SilverBlock", opacity: movingSolidOpacity };
ssm["PlatinumStrawberry/PlatinumBlock"] = {
  color: colors.platinum,
  name: "PlatinumBlock",
  opacity: movingSolidOpacity,
};

ssm["vitellary/kaizoblock"] = {
  color: colors.movingPlatform,
  name: "KaizoBlock",
  opacity: 0.1,
  outline: "dashed",
  anchorX: "center",
  anchorY: "center",
  width: 16,
  height: 16,
};

ssm["canyon/pushblock"] = {
  color: colors.pushBlock,
  name: "PushBlock",
  opacity: movingSolidOpacity,
  anchorX: "center",
  anchorY: "center",
  width: 32,
  height: 32,
};
//#endregion

//#region Semi-Solids
group(
  { color: colors.swapBlock, height: 5, name: "JumpThrough" },
  {
    jumpThru: true,
    "VivHelper/CrumbleJumpThru": { name: "CrumbleJumpThrough" },
    "VortexHelper/AttachedJumpThru": true,
    "JungleHelper/InvisibleJumpthruPlatform": { name: "InvisibleJumpThrough", outline: "dashed" },
  },
);

group(
  {
    color: colors.swapBlock,
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
  { color: colors.swapBlock, height: 5, offset: [0, 3], name: "DownJumpThrough" },
  {
    "MaxHelpingHand/UpsideDownJumpThru": true,
    "SpringCollab2020/UpsideDownJumpThru": true,
    "GravityHelper/UpsideDownJumpThru": true,
  },
);

group(
  {
    color: (attr) => (attr.fragile ? colors.cloudFragile : colors.cloud),
    height: 5,
    width: (attr) => (attr.small ? 26 : 32),
    name: "Cloud",
  },
  {
    cloud: true,
    "FlaglinesAndSuch/CustomCloud": true,
    "Anonhelper/WindCloud": { name: "[Cloud]" },
    "Anonhelper/AnonCloud": "Anonhelper/WindCloud",
  },
);

ssm["SJ2021/SolarElevator"] = {
  color: colors.elevator,
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
    color: (attr) => ((attr.twoDash ?? attr.twoDashes) ? colors.refillTwoDash : colors.refill),
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
      color: colors.jumpRefill,
      name: (attr) => (attr.oneUse ? "(JumpRefill)" : "JumpRefill"),
    },
    "ExtendedVariantMode/ExtraJumpRefill": {
      color: colors.jumpRefill,
      name: (attr) => (attr.oneUse ? "(ExtraJumpRefill)" : "ExtraJumpRefill"),
    },
    "vitellary/timecrystal": { color: colors.jumpRefill, name: "TimeCrystal" },
    "GravityHelper/GravityRefill": { color: colors.specialRefill, name: "GravityRefill" },
    "MoreDasheline/SpecialRefill": {
      color: (attr) => (attr.dashes === 2 ? colors.refillTwoDash : colors.refill),
      name: "SpecialRefill",
    },
    "CommunalHelper/DreamRefill": {
      color: colors.dream,
      name: (attr) => (attr.oneUse ? "(DreamRefill)" : "DreamRefill"),
    },
    "vitellary/forcejumpcrystal": {
      color: colors.specialRefill,
      name: (attr) => (attr.oneUse ? "(ForceJumpCrystal)" : "ForceJumpCrystal"),
    },
    "LunaticHelper/CustomRefill": true,
    "BounceHelper/BounceRefill": { name: (attr) => (attr.oneUse ? "(BounceRefill)" : "BounceRefill") },
    "TwigHelper/LargeRefill": { name: (attr) => (attr.oneUse ? "(LargeRefill)" : "LargeRefill") },
    "CherryHelper/ShadowDashRefill": { color: colors.shadowDash, name: "ShadowDashRefill" },
    "vitellary/forcedashcrystal": {
      name: (attr) => (attr.oneUse ? "(ForceDashRefill)" : "ForceDashRefill"),
      color: colors.specialRefill,
    },
    "VivHelper/VariantRefill": {
      color: colors.specialRefill,
      name: (attr) => (attr.oneUse ? "(VariantRefill)" : "VariantRefill"),
    },
    "JackalHelper/TracerRefill": {
      color: colors.specialRefill,
      name: (attr) => (attr.oneUse ? "(TracerRefill)" : "TracerRefill"),
    },
    "Anonhelper/FeatherRefill": {
      color: colors.feather,
      name: (attr) => (attr.oneUse ? "(FeatherRefill)" : "FeatherRefill"),
    },
    "Anonhelper/JellyRefill": {
      color: colors.jelly,
      name: (attr) => (attr.oneUse ? "(JellyRefill)" : "JellyRefill"),
    },
    "CommunalHelper/ResetStateCrystal": {
      color: colors.specialRefill,
      name: (attr) => (attr.oneUse ? "(ResetStateCrystal)" : "ResetStateCrystal"),
    },
    "CommunalHelper/ShieldedRefill": {
      name: (attr) => (attr.oneUse ? "(ShieldedRefill)" : "ShieldedRefill"),
    },
    "XaphanHelper/TimerRefill": {
      color: colors.specialRefill,
      name: (attr) => (attr.oneUse ? "(TimerRefill)" : "TimerRefill"),
    },
  },
);
ssm["VivHelper/RefillWallWrapper"] = {
  color: colors.refill,
  name: "RefillWallWrapper",
};

ssm.lightning = { color: "yellow", name: "", depth: LAYERS.ENTITIES - 1, outline: "dashed" };

const spring = group(
  { color: colors.spring, name: "Spring", anchorX: "center", anchorY: "bottom", width: 16, height: 6 },
  {
    spring: true,
    "FrostHelper/SpringFloor": true,
    "MaxHelpingHand/CustomDashRefillSpring": { color: colors.springSpecial, name: "CustomDashRefillSpring" },
    "GravityHelper/GravitySpringFloor": { color: colors.springSpecial, name: "GravitySpring" },
    "FrostHelper/SpringCeiling": { anchorY: "top" },
    "MaxHelpingHand/NoDashRefillSpring": { color: colors.springSpecial, name: "NoDashRefillSpring" },
    "BrokemiaHelper/dashSpringDown": { name: "IronSpring", color: colors.springIron },
  },
);

group(
  { ...spring, anchorX: "left", anchorY: "center", height: 16, width: 6 },
  {
    wallSpringLeft: true,
    "FrostHelper/SpringLeft": true,
    "BrokemiaHelper/wallDashSpringLeft": true,
    "MaxHelpingHand/CustomDashRefillSpringLeft": {
      color: colors.springSpecial,
      name: "CustomDashRefillSpring",
    },
    "GravityHelper/GravitySpringWallLeft": { color: colors.springSpecial, name: "GravitySpring" },
    "MaxHelpingHand/NoDashRefillSpringLeft": { color: colors.springSpecial, name: "NoDashRefillSpring" },
    "SpringCollab2020/wallDashSpringLeft": { color: colors.springIron, name: "IronSpring" },
  },
);

group(
  { ...spring, anchorX: "right", anchorY: "center", height: 16, width: 6 },
  {
    wallSpringRight: true,
    "FrostHelper/SpringRight": true,
    "MaxHelpingHand/CustomDashRefillSpringRight": {
      color: colors.springSpecial,
      name: "CustomDashRefillSpring",
    },
    "GravityHelper/GravitySpringWallRight": { color: colors.springSpecial, name: "GravitySpring" },
    "MaxHelpingHand/NoDashRefillSpringRight": { color: colors.springSpecial, name: "NoDashRefillSpring" },
    "SpringCollab2020/wallDashSpringRight": { color: colors.springIron, name: "IronSpring" },
  },
);

ssm["DJMapHelper/springGreen"] = {
  width: (attr) => (attr.orientation === "Floor" ? 16 : 6),
  height: (attr) => (attr.orientation === "Floor" ? 6 : 16),
  color: colors.springSpecial,
  name: "GreenSpring",
  offset: (attr) =>
    attr.orientation === "Floor" ? [-8, -6] : attr.orientation === "WallRight" ? [-5, -8] : [0, -8],
};

group(
  {
    name: "GravitySpring",
    color: colors.springSpecial,
    anchorX: "center",
    anchorY: "top",
    width: 16,
    height: 6,
  },
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
  {
    color: colors.switchGate,
    name: "TouchSwitch",
    anchorX: "center",
    anchorY: "center",
    width: 16,
    height: 16,
  },
  {
    touchSwitch: true,
    "MaxHelpingHand/FlagTouchSwitch": true,
    "SpringCollab2020/FlagTouchSwitch": true,
    "MaxHelpingHand/MovingFlagTouchSwitch": { name: "MovingTouchSwitch" },
    "outback/movingtouchswitch": { name: "MovingTouchSwitch" },
    "outback/timedtouchswitch": { name: "TimedTouchSwitch" },
    "MaxHelpingHand/FlagTouchSwitchWall": {
      name: "TouchSwitchWall",
      width: undefined,
      height: undefined,
      anchorX: "left",
      anchorY: "top",
    },
    "VivHelper/TouchSwitchWall": "MaxHelpingHand/FlagTouchSwitchWall",
    "vitellary/customtouchswitch": true,
  },
);

group(
  {
    color: colors.dashSwitch,
    name: "DashSwitch",
    width: (attr) => (attr.direction === "Down" ? 16 : 8),
    height: (attr) => (attr.direction === "Down" ? 8 : 16),
  },
  {
    "vitellary/paireddashswitch": { name: "[DashSwitch]" },
    "SJ2021/FlagDashSwitch": {
      name: "[DashSwitch]",
      width: (attr) => (attr.orientation === "Down" || attr.orientation === "Up" ? 16 : 8),
      height: (attr) => (attr.orientation === "Down" || attr.orientation === "Up" ? 8 : 16),
    },
  },
);

group(
  { color: colors.dashSwitch, name: "DashSwitch", width: 8, height: 16 },
  {
    dashSwitchH: true,
    dashSwitchV: { width: 16, height: 8 },
    "SSMHelper/BarrierDashSwitch": "dashSwitchH",
  },
);

ssm["batteries/battery_switch"] = {
  color: colors.dashSwitch,
  name: "BatterySwitch",
  width: (attr) => (attr.horizontal ? 8 : 16),
  height: (attr) => (attr.horizontal ? 16 : 8),
};

group(
  {
    color: colors.lightning,
    name: "BreakerBox",
    width: 32,
    height: 32,
    opacity: movingSolidOpacity,
  },
  {
    lightningBlock: true,
    "CommunalHelper/TrackSwitchBox": { name: "TrackSwitchBox" },
  },
);

ssm["FactoryHelper/BoomBox"] = {
  color: colors.coreFire,
  name: "BoomBox",
  width: 24,
  height: 24,
};

group(
  {
    color: colors.bird,
    name: "FlingBird",
    shape: "circle",
    radius: 16,
  },
  {
    flingBird: true,
    "GooberHelper/GooberFlingBird": true,
  },
);

group(
  {
    color: colors.movingBlock,
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
  { color: colors.movingBlock, name: "FinalBoss", shape: "circle", radius: 14, offset: [0, -6] },
  {
    finalBoss: true,
    "DJMapHelper/finalBossReversed": { name: "FinalBossReversed" },
  },
);

group(
  {
    color: (attr) => (attr.red ? colors.bubbleRed : colors.bubble),
    name: "Bubble",
    shape: "circle",
    radius: 10,
  },
  {
    booster: true,
    "FrostHelper/IncrementBooster": { name: "IncrementBubble" },
    "GravityHelper/GravityBooster": { color: colors.bubbleSpecial, name: "GravityBubble" },
    "SJ2021/DashBoostField": { color: colors.bubbleSpecial, name: "DashBoostField" },
    "FrostHelper/BlueBooster": { color: colors.bubbleDashless, name: "DashlessBubble" },
    "GlassHelper/ReverseBooster": { color: colors.bubbleSpecial, name: "ReverseBubble" },
    "JackalCollabHelper/FlagBooster": { color: colors.bubbleSpecial, name: "FlagBubble" },
    "EmHelper/Monumentbooster": { color: colors.bubbleSpecial, name: "MonumentBubble" },
    "CommunalHelper/DreamBooster": { color: colors.dream, name: "DreamBubble" },
    "CommunalHelper/SpiralDreamBooster": { color: colors.dream, name: "SpiralDreamBubble" },
    "Anonhelper/OneUseBooster": { name: "OneUseBubble" },
    "CommunalHelper/CurvedBooster": { color: colors.bubbleSpecial, name: "CurvedBubble" },
    "FrostHelper/GrayBooster": { color: colors.gray3, name: "GrayBubble" },
    "vitellary/energybooster": { color: colors.bubbleSpecial, name: "EnergyBubble" },
    "FrostHelper/YellowBooster": { color: colors.bubbleSpecial, name: "YellowBubble" },
    "JackalHelper/CryoBooster": { color: colors.bubbleSpecial, name: "CryoBubble" },
    "VivHelper/VariantSpecificBooster": { name: "VariantSpecificBubble" },
    "VortexHelper/DashBubble": { color: colors.bubbleSpecial, name: "DashBubble" },
    "EeveeHelper/PatientBooster": { color: colors.bubbleSpecial, name: "PatientBubble" },
    "JackalHelper/RoundKevin": { color: colors.bubbleSpecial, name: "CoreBubble" },
  },
);

group(
  {
    color: colors.feather,
    name: "Feather",
    width: 20,
    height: 20,
    anchorX: "center",
    anchorY: "center",
  },
  {
    infiniteStar: true,
    "FrostHelper/CustomFeather": { name: "[Feather]" },
    "DJMapHelper/colorfulFlyFeather": {
      name: "[Feather]",
      color: (attr) => validateColorOr(attr.color, colors.feather),
    },
  },
);

group(
  {
    color: colors.toggleSwitch,
    anchorX: "center",
    anchorY: "center",
    width: 16,
    height: 24,
  },
  {
    coreModeToggle: {
      name: "CoreModeToggle",
      color: (attr) => (attr.onlyIce ? colors.coreIce : colors.coreFire),
    },
    "pandorasBox/flagToggleSwitch": { name: "FlagToggleSwitch" },
    "GravityHelper/GravitySwitch": { name: "GravitySwitch" },
    "bgSwitch/bgModeToggle": { name: "BGModeToggle" },
    "EmHelper/Monumentflipswitch": { name: "MonumentFlipSwitch" },
  },
);

group(
  { shape: "spinner", color: colors.spinner, name: "TrackSpinner" },
  {
    trackSpinner: true,
    "AdventureHelper/DustTrackSpinnerMultinode": true,
    "SpringCollab2020/FlagToggleStarTrackSpinner": { name: "TrackSpinner" },
    rotateSpinner: { name: "RotateSpinner" },
    "SpringCollab2020/FlagToggleStarRotateSpinner": { name: "RotateSpinner" },
    "isaBag/dreamSpinner": { name: "DreamSpinner", color: colors.dream },
    "VivHelper/AnimatedSpinner": { name: "AnimatedSpinner" },
    "spirialis/timerotatespinner": { name: "TimeRotateSpinner" },
    "FemtoHelper/CustomSpeedRotateSpinner": { name: "RotateSpinner" },
    "AdventureHelper/BladeTrackSpinnerMultinode": { name: "TrackSpinner" },
  },
);

group(
  {
    color: (attr) => (attr.notCoreMode ? colors.coreIce : colors.coreFire),
    outline: "dashed",
    name: (attr) => (attr.notCoreMode ? "IceWall" : "WallBooster"),
    width: 2,
    offset: (attr) => (attr.left ? [0, 0] : [6, 0]),
  },
  {
    wallBooster: true,
    "CommunalHelper/AttachedWallBooster": true,
    "ShroomHelper/AttachedIceWall": { name: "IceWall", color: colors.coreIce },
    "cavern/icyfloor": {
      name: "IcyFloor",
      color: colors.coreIce,
      height: 2,
      width: undefined,
      offset: [0, 6],
    },
  },
);

ssm.seeker = { color: colors.seeker, name: "Seeker", shape: "seeker" };

group(
  { color: colors.theo, name: "TheoCrystal", shape: "theo" },
  {
    theoCrystal: true,
    "cavern/crystalbomb": { name: "CrystalBomb" },
    "batteries/battery": { name: "Battery" },
    "ExtendedVariantMode/TheoCrystal": true,
    "JungleHelper/Lantern": { name: "Lantern", offset: [0, 8] },
    "VortexHelper/BowlPuffer": { name: "BowlPuffer", offset: [0, 8] },
  },
);

group(
  { color: colors.jelly, name: "Jelly", shape: "jelly" },
  {
    glider: true,
    "MaxHelpingHand/RespawningJellyfish": { name: "RespawningJelly" },
    "VivHelper/ReskinnableJelly": true,
    "BounceHelper/BounceJellyfish": { name: "BounceJelly" },
    "CommunalHelper/DreamJellyfish": { color: colors.dream, name: "DreamJelly" },
  },
);

ssm.introCar = { color: colors.gray3, name: "IntroCar", shape: "car" };

group(
  { color: colors.solid, name: "TriggerSpikes", outline: "dashed" },
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
  { color: colors.solid, name: "GroupedTriggerSpikes", outline: "dashed" },
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
      { name: "DashThroughSpikes", color: colors.dream },
    ],
    "SJ2021/DashThroughSpikesDown": [
      "SpringCollab2020/GroupedTriggerSpikesDown",
      { name: "DashThroughSpikes", color: colors.dream },
    ],
    "SJ2021/DashThroughSpikesLeft": [
      "SpringCollab2020/GroupedTriggerSpikesLeft",
      { name: "DashThroughSpikes", color: colors.dream },
    ],
    "SJ2021/DashThroughSpikesRight": [
      "SpringCollab2020/GroupedTriggerSpikesRight",
      { name: "DashThroughSpikes", color: colors.dream },
    ],
    "NerdHelper/DashThroughSpikesLeft": [
      "SpringCollab2020/GroupedTriggerSpikesLeft",
      { name: "DashThroughSpikes", color: colors.dream },
    ],
    "NerdHelper/DashThroughSpikesRight": [
      "SpringCollab2020/GroupedTriggerSpikesRight",
      { name: "DashThroughSpikes", color: colors.dream },
    ],
    "NerdHelper/DashThroughSpikesUp": [
      "SpringCollab2020/GroupedTriggerSpikesUp",
      { name: "DashThroughSpikes", color: colors.dream },
    ],
    "NerdHelper/DashThroughSpikesDown": [
      "SpringCollab2020/GroupedTriggerSpikesDown",
      { name: "DashThroughSpikes", color: colors.dream },
    ],
  },
);

group(
  { color: colors.solid, name: "CoreModeSpikes", outline: "dashed" },
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
  { name: "BouncySpikes", outline: "dashed", color: colors.specialArea },
  {
    "HonlyHelper/BouncySpikesLeft": { width: 3, anchorX: "right" },
    "HonlyHelper/BouncySpikesRight": { width: 3, anchorX: "left" },
    "HonlyHelper/BouncySpikesUp": [
      "HonlyHelper/BouncySpikesRight",
      { anchorY: "bottom", height: 3, width: undefined },
    ],
    "HonlyHelper/BouncySpikesDown": ["HonlyHelper/BouncySpikesUp", { anchorY: "top" }],
  },
);

group(
  {
    color: (attr) => validateColorOr(attr.color, colors.solid),
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
  color: (attr) => validateColorOr(attr.readyColor, colors.coreIce),
  width: (attr) => (attr.direction === "Left" || attr.direction === "Right" ? 6 : 10),
  height: (attr) => (attr.direction === "Left" || attr.direction === "Right" ? 10 : 6),
  anchorX: "center",
  anchorY: "center",
};

group(
  {
    shape: "circle",
    color: colors.bumper,
    name: "Bumper",
    radius: 12,
  },
  {
    bigSpinner: true,
    "FrostHelper/StaticBumper": {
      color: (attr) => (attr.sprite === "bumper_white" ? "#ffffff" : colors.bumper),
    },
    "VivHelper/RefilllessBumper": { name: "RefilllessBumper" },
    "MaxHelpingHand/RotatingBumper": { name: "RotatingBumper" },
    "VortexHelper/VortexCustomBumper": {
      color: (attr) => validateColorOr(attr.style, colors.bumper),
    },
    "vitellary/boostbumper": { name: "BoostBumper" },
    "VivHelper/EvilBumper": { name: "EvilBumper" },
    "CherryHelper/ShadowBumper": { color: colors.shadowDash, name: "ShadowBumper" },
    "MaxHelpingHand/MultiNodeBumper": { name: "MultiNodeBumper" },
  },
);

group(
  {
    width: 16,
    height: 16,
    anchorX: "center",
    anchorY: "center",
    name: "CardinalBumper",
    color: colors.bumper,
  },
  {
    "JackalHelper/CardinalBumper": true,
    "JackalHelper/LinkedCardinalBumper": { name: "LinkedCardinalBumper" },
  },
);

ssm.fireBall = { shape: "circle", color: colors.bubbleRed, name: "FireBall", radius: 6 };
group(
  {
    color: colors.gray3,
    name: "ReturnBubble",
    outline: "dashed",
  },
  {
    "FrostHelper/Bubbler": true,
    "CommunalHelper/PlayerBubbleRegion": { name: "ReturnBubbleRegion" },
  },
);

ssm["JungleHelper/SpinyPlant"] = {
  color: (attr) => validateColorOr(attr.color, colors.plant),
  name: "SpinyPlant",
};

group(
  {
    color: colors.fish,
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
  color: (attr) => validateColorOr(attr.color, colors.kevin),
  name: "KevinBarrier",
  opacity: 0.3,
  outline: "dashed",
};
//#endregion

//#region Triggers
group(
  { color: colors.solid, name: "SeekerBarrier", outline: "dashed" },
  {
    seekerBarrier: true,
    "MaxHelpingHand/CustomSeekerBarrier": true,
    "DJMapHelper/theoCrystalBarrier": { name: "TheoCrystalBarrier" },
    "SpringCollab2020/moveBlockBarrier": { name: "MoveBlockBarrier" },
    "VivHelper/HoldableBarrier": { name: "HoldableBarrier" },
    "cavern/crystalBombField": { name: "CrystalBombField" },
    "VortexHelper/PufferBarrier": { name: "PufferBarrier" },
    "BrokemiaHelper/moveBlockBarrier": "SpringCollab2020/moveBlockBarrier",
    "DJMapHelper/featherBarrier": {
      name: "FeatherBarrier",
      color: (attr) => validateColorOr(attr.color, colors.feather),
    },
  },
);
ssm["VivHelper/SolidModifier"] = {
  color: colors.gray3,
  name: "SolidModifier",
  outline: "dashed",
};
//#endregion

//#region Large Background Entities
const fakeWallBase = group(
  {
    color: colors.fakeWall,
    opacity: 0.01,
    outline: "dashed",
    depth: LAYERS.SOLIDS + 1,
    name: "FakeWall",
    renderer: LargeBlockContentRenderer,
  },
  {
    fakeWall: true,
    "XaphanHelper/LinkedFakeWall": true,
    "XaphanHelper/CustomFakeWall": true,
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
    "GravityHelper/GravityField": { name: "GravityField", color: colors.coreIce },
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
    color: colors.water,
    opacity: 0.1,
    outline: "dashed",
    depth: LAYERS.SOLIDS + 1,
    name: "Water",
    renderer: LargeBlockContentRenderer,
  },
  {
    water: true,
    fireBarrier: { color: colors.fire, name: "Fire" },
    "FrostHelper/CustomFireBarrier": [
      "fireBarrier",
      { color: (attr) => validateColorOr(attr.surfaceColor, colors.fire) },
    ],
    iceBlock: { color: colors.coreIce, name: "Ice" },
  },
);

group(
  {
    color: (attr) => (attr.liquidType === "lava" ? colors.fire : colors.water),
    opacity: 0.1,
    outline: "dashed",
    depth: LAYERS.SOLIDS + 1,
    name: (attr) => (attr.liquidType === "lava" ? "Lava" : attr.liquidType === "acid" ? "Acid" : "Water"),
    renderer: LargeBlockContentRenderer,
  },
  {
    "XaphanHelper/Liquid": true,
    "SpringCollab2020/FlagToggleWater": { color: colors.water, name: "Water" },
    "pandorasBox/coloredWater": {
      color: (attr) => validateColorOr(attr.color, colors.water),
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
  color: colors.specialArea,
  opacity: 0.05,
  outline: "dotted",
};

ssm.darkChaser = {
  color: colors.baddy,
  name: "BaddyChaser",
};
ssm.darkChaserEnd = {
  ...fakeWallBase,
  name: "BaddyChaserEnd",
  color: colors.baddy,
};
ssm["SJ2021/SineDustSpinner"] = {
  ...fakeWallBase,
  name: "Sine\nDust\nSpinner",
  color: colors.spinner,
};

ssm["JackalCollabHelper/DarkMatter"] = {
  color: colors.darkMatter,
  name: "DarkMatter",
  opacity: 0.25,
  outline: "dashed",
};

ssm["CommunalHelper/StationBlockTrack"] = {
  ...fakeWallBase,
  color: colors.swapBlock,
  name: "StationBlockTrack",
};

ssm["FactoryHelper/DashNegator"] = {
  ...fakeWallBase,
  color: colors.coreFire,
  name: "DashNegator",
  opacity: 0.25,
};
//#endregion

//#region Room Markers
group(
  {
    color: colors.respawn,
    width: 8,
    height: 10,
    name: "Respawn",
    anchorX: "center",
    anchorY: "bottom",
  },
  {
    player: true,
    "VivHelper/InterRoomSpawnTarget2": { name: "InterRoomSpawn" },
    "VivHelper/InterRoomSpawner": { name: "InterRoomSpawner" },
    "EmHelper/Walkeline": { color: colors.shadowDash, name: "Walkeline" },
  },
);

group(
  { color: colors.bino, width: 8, height: 10, name: "TowerViewer", anchorX: "center", anchorY: "bottom" },
  {
    towerviewer: true,
    "PrismaticHelper/AttachedWatchtower": true,
    "VivHelper/CustomPlaybackWatchtower": true,
    "CommunalHelper/NoOverlayLookout": true,
    "Sardine7/HumbleLookout": true,
    "VivHelper/PlatinumWatchtower": true,
    "CelestialArchive/FlagWatchtower": true,
  },
);

group(
  {
    color: colors.solid,
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
  color: colors.solid,
  width: 20,
  height: 24,
  anchorX: "center",
  anchorY: "bottom",
  name: "Checkpoint",
};

group(
  {
    color: colors.key,
    width: 12,
    height: 12,
    anchorX: "center",
    anchorY: "center",
  },
  {
    key: { name: "Key" },
    "FrostHelper/KeyIce": { color: colors.coreIce, name: "KeyIce" },
    "FrostHelper/TemporaryKey": { color: colors.coreIce, name: "TemporaryKey" },
  },
);

ssm["CollabUtils2/SpeedBerry"] = {
  color: colors.speedberry,
  width: 18,
  height: 16,
  anchorX: "center",
  anchorY: "center",
};
ssm["SpringCollab2020/CustomBirdTutorial"] = {
  color: colors.gray2,
  width: 16,
  height: 16,
  anchorX: "center",
  anchorY: "bottom",
};
ssm.fakeHeart = { color: colors.heart, width: 16, height: 16, anchorX: "center", anchorY: "center" };

group(
  { color: colors.npc, width: (attr) => attr.approachDistance ?? 8, height: 8, offset: [-8, -4] },
  {
    npc: { height: 10, offset: [-4, 0], anchorY: "bottom" },
    "everest/npc": true,
    "MaxHelpingHand/MoreCustomNPC": true,
    "luaCutscenes/luaTalker": { width: undefined, height: undefined },
  },
);

group(
  {
    color: colors.heart,
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
    color: colors.specialArea,
    name: "DashCode",
  },
  {
    "vitellary/dashcodecontroller": true,
    "Sardine7/DashCodeTrigger": true,
  },
);

group(
  { color: colors.solid, name: "Memorial", outline: "dashed", width: 60, height: 80, offset: [-30, -60] },
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

group(
  {
    width: 16,
    height: 16,
    anchorX: "center",
    anchorY: "center",
    color: colors.strawberry,
  },
  {
    "BrokemiaHelper/trollStrawberry": { name: "TrollStrawberry" },
    "MaxHelpingHand/SecretBerry": {
      name: (attr) => strawberrySpriteMap[attr.strawberrySprite] || "SecretBerry",
      color: (attr) => validateColorOr(attr.particleColor1, colors.strawberry),
    },
    "MaxHelpingHand/MultiRoomStrawberry": {
      name: (attr) => "MultiRoomStrawberry{" + attr.name + "}",
    },
    "MaxHelpingHand/MultiRoomStrawberrySeed": {
      name: (attr) => "MultiRoomStrawberrySeed{" + attr.strawberryName + "}",
    },
    "SpringCollab2020/MultiRoomStrawberry": "MaxHelpingHand/MultiRoomStrawberry",
    "SpringCollab2020/MultiRoomStrawberrySeed": "MaxHelpingHand/MultiRoomStrawberrySeed",
  },
);
const strawberrySpriteMap = {
  gemberry: "GemBerry",
  bouncyberry: "BouncyBerry",
  voidberry: "VoidBerry",
  nullberry: "NullBerry",
};

group(
  {
    color: colors.chapterPanel,
  },
  {
    "CollabUtils2/ChapterPanelTrigger": {
      name: (attr) => "ChapterPanelTrigger{" + validateMapName(attr.map) + "}",
    },
    "CollabUtils2/JournalTrigger": true,
  },
);

ssm["XaphanHelper/UpgradeCollectable"] = {
  color: colors.specialArea,
  name: (attr) => "Upgrade:{" + attr.upgrade + "}",
  width: 16,
  height: 16,
};

ssm["HonlyHelper/PettableCat"] = {
  color: colors.specialArea,
  name: "Cat",
  width: 16,
  height: 16,
  anchorX: "center",
  anchorY: "center",
};
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
    "vitellary/nograbtrigger",
    "vitellary/nojumptrigger",
    "vitellary/nomovetrigger",
    "FrostHelper/NoDashArea",
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
    "VivHelper/InLevelTeleporter",
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
    "MaxHelpingHand/PopStrawberrySeedsTrigger",
    "Bitsbolts/NoRetry",
    "FlaglinesAndSuch/ChangeDreaming",
    "MaxHelpingHand/InstantLavaBlockerTrigger",
    "DJMapHelper/changeBossPatternTrigger",
    "vitellary/dropholdables",
    "EeveeHelper/GlobalModifier",
    "SJ2021/bubbleEmitterFireTrigger",
    "everest/entityTrigger",
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
    "pandorasBox/entityActivator",
    "FrostHelper/OnBerryCollectActivator",
    "FrostHelper/OnPlayerDashingActivator",
    "FrostHelper/OnPlayerOnGroundActivator",
    "FrostHelper/OnCassetteSwapActivator",
    "FrostHelper/OnPlayerEnterActivator",
    "FrostHelper/DelayActivator",
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
    "Bitsbolts/ResizeTriggers",
    "MaxHelpingHand/SetFlagOnActionController",
    "FrostHelper/FlagIfVisibleTrigger",
    "CommunalHelper/InputFlagController",
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
    "Sardine7/SmoothieCameraTargetTrigger",
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
    "CommunalHelper/HintController",
    "BrokemiaHelper/persistentMiniTextboxTrigger",
    "FemtoHelper/SimpleText",
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
    "clutterCabinet",
    "coloredlights/hanginglamp",
    "everest/ambienceTrigger",
    "everest/musicLayerTrigger",
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
    "ShroomHelper/MultilayerMusicFadeTrigger",
    "FrostHelper/BloomPoint",
    "JungleHelper/AttachTriggerController",
    "CommunalHelper/SurfaceSoundPanel",
    "AdamsAddons/CameraCorrectionController",
    "CherryHelper/AudioPlayTrigger",
    "JungleHelper/MossyWall",
    "MaxHelpingHand/SetBloomBaseTrigger",
    "FemtoHelper/CustomCliffsideWindFlag",
    "CommunalHelper/SoundAreaTrigger",
    "ExtendedVariantMode/DisplaySpeedometerTrigger",
    "KoseiHelper/EvilHoldableController",
    "MaxHelpingHand/CustomizableGlassBlockController",
    "XaphanHelper/UpgradeController",
    "PrismaticHelper/CustomHangingLamp",
    "BrokemiaHelper/vineinator",
    "FrostHelper/ArbitraryLight",
    "FrostHelper/DustSprite",
    "MaxHelpingHand/TempleEyeTrackingMadeline",
    "JungleHelper/Firefly",
    "Microlith57Misc/LockPauseController",
    "everest/ambienceVolumeTrigger",
    "MaxHelpingHand/HintsFlagController",
    "MaxHelpingHand/DarknessAlphaFadeTrigger",
    "XaphanHelper/CustomEndScreenController",
    "payphone",
    "VivHelper/SoundMuter",
    "EeveeHelper/LenientCeilingPopController",
    "pandorasBox/dustSpriteColorController",
    "Sardine7/LightSource",
    "FemtoHelper/EHIController",
    "StyleMaskHelper/ColorGradeMask",
    "CommunalHelper/Chain",
    "FactoryHelper/KillerDebris",
    "FactoryHelper/RustyLamp",
    "MaxHelpingHand/SetBloomStrengthTrigger",
    "SJ2021/MaskedDecal",
    "coloredlights/flashlightColorTrigger",
    "CommunalHelper/CoreModeMusicController",
    "SorbetHelper/BigWaterfall",
    "VivHelper/CurveEntity",
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
cd["CustomPoints/CustomPointsGolden"] = cd.goldenBerry;
cd.memorialTextController = [
  { match: () => true, collectible: { name: "Winged Golden Berry", formValue: "4" } },
];
cd["JungleHelper/TreeDepthController"] = cd.memorialTextController;
cd["RosewoodHelper/OneDashWingedStrawberry"] = cd.memorialTextController;
cd["ShroomHelper/OneDashWingedStrawberry"] = cd.memorialTextController;

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
cd["MaxHelpingHand/CustomizableBerry"] = cd.strawberry;

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

cd["MaxHelpingHand/SecretBerry"] = [
  {
    match: (attr) => attr.strawberrySprite === "bouncyberry",
    collectible: { name: "Bouncy Berry", formValue: "13", formVariant: "2" },
  },
  {
    match: (attr) => attr.strawberrySprite === "gemberry",
    collectible: { name: "Gem Berry", formValue: "13", formVariant: "6" },
  },
  {
    match: () => true,
    collectible: { name: "Strawberry", formValue: "2" },
  },
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

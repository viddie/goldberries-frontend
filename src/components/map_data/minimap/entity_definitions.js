import {
  CassetteRenderer,
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
  goldenBerry: () => GoldenBerryRenderer,
  "MaxHelpingHand/GoldenStrawberryCustomConditions": () => GoldenBerryRenderer,
  "CollabUtils2/SilverBerry": () => SilverBerryRenderer,
  strawberry: () => StrawberryRenderer,
  "DSidesHelper/TeleportMoonBerry": () => StrawberryRenderer,
  "SpringCollab2020/returnBerry": () => StrawberryRenderer,
  "LunaticHelper/StrawberryWithReturn": () => StrawberryRenderer,
  "SorbetHelper/ReturnBerry": () => StrawberryRenderer,
  blackGem: () => CrystalHeartRenderer,
  "MaxHelpingHand/ReskinnableCrystalHeart": () => CrystalHeartRenderer,
  "AdventureHelper/CustomCrystalHeart": () => CrystalHeartRenderer,
  "CollabUtils2/MiniHeart": () => MiniHeartRenderer,
  "CollabUtils2/FakeMiniHeart": () => MiniHeartRenderer,
  cassette: () => CassetteRenderer,
  "XaphanHelper/CustomCollectable": (attr) =>
    attr.sprite?.indexOf("cassette") >= 0 ? CassetteRenderer : null,
  "ParrotHelper/FlagBerry": () => StrawberryRenderer,
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

//#region Solids
ssm["FancyTileEntities/FancySolidTiles"] = {
  color: "#ffffff",
  name: "Solid",
  opacity: movingSolidOpacity,
};

ssm.floatySpaceBlock = { color: "white", name: "MoonBlock", opacity: movingSolidOpacity };
ssm["SpringCollab2020/floatierSpaceBlock"] = { ...ssm.floatySpaceBlock, name: "FloatierMoonBlock" };
ssm["BrokemiaHelper/floatierSpaceBlock"] = ssm["SpringCollab2020/floatierSpaceBlock"];
ssm["MaxHelpingHand/FloatySpaceBlockWithAttachedSidewaysJumpthruSupport"] = {
  ...ssm.floatySpaceBlock,
  name: "MoonBlockWithJumpThrough",
};

ssm.swapBlock = { color: "orange", name: "S", opacity: movingSolidOpacity };
ssm["FrostHelper/ToggleSwapBlock"] = {
  ...ssm.swapBlock,
  name: "[S]",
};
ssm.zipMover = { color: "orange", name: "Z", opacity: movingSolidOpacity };
ssm["AdventureHelper/ZipMoverNoReturn"] = {
  ...ssm.zipMover,
  name: "[Z]",
};
ssm.fallingBlock = { color: "#12fffb", name: "F", opacity: movingSolidOpacity };
ssm["FancyTileEntities/FancyFallingBlock"] = ssm.fallingBlock;
ssm["VortexHelper/AutoFallingBlock"] = ssm.fallingBlock;
ssm["VivHelper/CustomFallingBlock"] = ssm.fallingBlock;
ssm["HonlyHelper/RisingBlock"] = {
  ...ssm.fallingBlock,
  name: "R",
};
ssm.finalBossFallingBlock = { ...ssm.fallingBlock, color: "#cc00ff" };
ssm.finalBossMovingBlock = {
  ...ssm.finalBossFallingBlock,
  name: "M",
};
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
ssm["SafeRespawnCrumble/SafeRespawnCrumble"] = ssm["SpringCollab2020/safeRespawnCrumble"];

ssm.dashBlock = { color: "#12fffb", name: "D", opacity: movingSolidOpacity };
ssm["VivHelper/CustomDashBlock"] = ssm.dashBlock;
ssm["FrostHelper/DashBlockDestroyAttached"] = ssm.dashBlock;
ssm.crushBlock = { color: "#285aff", name: "Kevin", opacity: movingSolidOpacity };
ssm["MaxHelpingHand/ReskinnableCrushBlock"] = ssm.crushBlock;

ssm.bounceBlock = {
  color: "#f62121",
  name: "CoreBlock",
  opacity: movingSolidOpacity,
};

ssm.movingPlatform = { color: "#dda94a", name: "MovingPlatform", opacity: movingSolidOpacity };
ssm.sinkingPlatform = { ...ssm.movingPlatform, name: "SinkingPlatform" };
ssm["SpringCollab2020/MultiNodeMovingPlatform"] = ssm.movingPlatform;

ssm.dreamBlock = { color: "#777777", name: "DreamBlock", opacity: movingSolidOpacity };
ssm["FrostHelper/CustomDreamBlock"] = ssm.dreamBlock;
ssm["CommunalHelper/ConnectedDreamBlock"] = {
  ...ssm.dreamBlock,
  name: "ConnectedDreamBlock",
};
ssm.switchGate = { color: "#00a6ff", name: "SwitchGate", opacity: movingSolidOpacity };
ssm["MaxHelpingHand/FlagSwitchGate"] = ssm.switchGate;
ssm["SpringCollab2020/FlagSwitchGate"] = ssm.switchGate;
ssm["MaxHelpingHand/ShatterFlagSwitchGate"] = ssm.switchGate;
ssm["VortexHelper/VortexSwitchGate"] = ssm.switchGate;
ssm.introCrusher = { ...ssm.switchGate, name: "IntroCrusher" };
ssm["VivHelper/FlagIntroCrusher"] = ssm.introCrusher;

ssm.templeGate = { color: "#dddddd", name: "TempleGate", opacity: movingSolidOpacity };
ssm["XaphanHelper/FlagTempleGate"] = {
  ...ssm.templeGate,
  name: "FlagTempleGate",
};

ssm.moveBlock = { color: "#9400ae", renderer: MoveBlockContentRenderer };
ssm.lockBlock = { color: "orange", name: "LockBlock", width: 32, height: 32 };
ssm["PrismaticHelper/MultiLockedDoor"] = {
  ...ssm.lockBlock,
  name: (attr) => (attr.keys || 1) + (attr.keys === 1 ? "Key" : "Keys") + "LockBlock",
};
ssm["XaphanHelper/CollectableDoor"] = {
  color: (attr) => validateColorOr(attr.interiorColor, "#9400ae"),
  name: "CollectibleDoor",
};

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

ssm.redBlocks = {
  color: "#d900ff",
  name: "Towels",
  opacity: movingSolidOpacity,
};
ssm.greenBlocks = {
  color: "#26e615",
  name: "Books",
  opacity: movingSolidOpacity,
};
ssm.yellowBlocks = {
  color: "#e4b611",
  name: "Crates",
  opacity: movingSolidOpacity,
};

ssm.cassetteBlock = {
  name: "CassetteBlock",
  color: (attr) => {
    if (attr.index === 1) return "#f049be";
    if (attr.index === 1) return "#fcdc3a";
    if (attr.index === 1) return "#38e04e";
    return "#49aaf0";
  },
  opacity: movingSolidOpacity,
};
ssm["CommunalHelper/CassetteZipMover"] = {
  ...ssm.cassetteBlock,
  name: "CassetteZipMover",
};
ssm["SJ2021/WonkyCassetteBlock"] = {
  name: "WonkyCassetteBlock",
  color: (attr) => validateColorOr(attr.color, "#49aaf0"),
  opacity: movingSolidOpacity,
};

ssm["VivHelper/CornerBoostBlock"] = {
  color: "white",
  name: "CornerBoostBlock",
  opacity: movingSolidOpacity,
};

ssm.goldenBlock = {
  color: "#ffdf00",
  name: "GoldenBlock",
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
  offset: (attr) => (attr.left ? [1, 0] : [3, 0]),
  name: (attr) => (attr.left ? "Left" : "Right") + "JumpThrough",
};
ssm["SpringCollab2020/SidewaysJumpThru"] = {
  ...ssm["MaxHelpingHand/SidewaysJumpThru"],
  offset: (attr) => (attr.left ? [0, 0] : [3, 0]),
};
ssm["MaxHelpingHand/AttachedSidewaysJumpThru"] = {
  ...ssm["MaxHelpingHand/SidewaysJumpThru"],
};
ssm["MaxHelpingHand/UpsideDownJumpThru"] = {
  ...ssm.jumpThru,
  offset: [0, 3],
  name: "DownJumpThrough",
};
ssm["SpringCollab2020/UpsideDownJumpThru"] = ssm["MaxHelpingHand/UpsideDownJumpThru"];
ssm["GravityHelper/UpsideDownJumpThru"] = ssm["MaxHelpingHand/UpsideDownJumpThru"];
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
  width: 16,
  height: 16,
  anchorX: "center",
  anchorY: "center",
  name: (attr) => (attr.oneUse ? "(Refill)" : "Refill"),
};
ssm["MaxHelpingHand/CustomizableRefill"] = ssm.refill;
ssm["DJMapHelper/colorfulRefill"] = ssm.refill;
ssm["VivHelper/RefillWall"] = {
  color: (attr) => (attr.twoDash ? "#ff4be7" : "#5eff5e"),
  anchorX: "left",
  anchorY: "top",
  width: undefined,
  height: undefined,
  name: (attr) => (attr.oneUse ? "(RefillWall)" : "RefillWall"),
};
ssm["ExtendedVariantMode/RecoverJumpRefill"] = {
  ...ssm.refill,
  color: "#77bde6",
  name: (attr) => (attr.oneUse ? "(JumpRefill)" : "JumpRefill"),
};
ssm["vitellary/timecrystal"] = {
  ...ssm.refill,
  color: "#00d9ff",
  name: "TimeCrystal",
};

ssm.lightning = { color: "yellow", name: "", depth: LAYERS.ENTITIES - 1, outline: "dashed" };

ssm.spring = { color: "#c96800", name: "Spring", anchorX: "center", anchorY: "bottom", width: 16, height: 6 };
ssm["MaxHelpingHand/CustomDashRefillSpring"] = {
  ...ssm.spring,
  color: "#16bd00",
  name: "CustomDashRefillSpring",
};
ssm["GravityHelper/GravitySpringFloor"] = {
  ...ssm["MaxHelpingHand/CustomDashRefillSpring"],
  name: "GravitySpring",
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
ssm["GravityHelper/GravitySpringWallLeft"] = {
  ...ssm["MaxHelpingHand/CustomDashRefillSpringLeft"],
  name: "GravitySpring",
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
ssm["GravityHelper/GravitySpringWallRight"] = {
  ...ssm["MaxHelpingHand/CustomDashRefillSpringRight"],
  name: "GravitySpring",
};
ssm["FrostHelper/SpringRight"] = ssm.wallSpringRight;
ssm["FrostHelper/SpringFloor"] = ssm.spring;
ssm["DJMapHelper/springGreen"] = {
  width: (attr) => (attr.orientation === "Floor" ? 16 : 6),
  height: (attr) => (attr.orientation === "Floor" ? 6 : 16),
  color: "#16bd00",
  name: "GreenSpring",
  offset: (attr) => (attr.orientation === "Floor" ? [-8, -6] : [0, -8]),
};

ssm["GravityHelper/GravitySpringCeiling"] = {
  name: "GravitySpring",
  color: "#16bd00",
  anchorX: "center",
  anchorY: "top",
  width: 16,
  height: 6,
};
ssm["GravityHelper/GravitySpring"] = {
  ...ssm["GravityHelper/GravitySpringCeiling"],
  anchorX: (attr) => (attr.orientation === "Floor" ? "center" : attr.left ? "left" : "right"),
  anchorY: (attr) => (attr.orientation === "Floor" ? "bottom" : "center"),
  width: (attr) => (attr.orientation === "Floor" ? 16 : 6),
  height: (attr) => (attr.orientation === "Floor" ? 6 : 16),
};

ssm.touchSwitch = {
  color: "#00a6ff",
  name: "TouchSwitch",
  anchorX: "center",
  anchorY: "center",
  width: 16,
  height: 16,
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
ssm["SSMHelper/BarrierDashSwitch"] = ssm.dashSwitchH;

ssm.lightningBlock = {
  color: "#d3b548",
  name: "BreakerBox",
  width: 32,
  height: 32,
  opacity: movingSolidOpacity,
};

ssm.flingBird = { color: "#00a6ff", name: "FlingBird", shape: "circle", radius: 16 };
ssm.badelineBoost = { color: "#cc00ff", name: "BadelineBoost", shape: "circle", radius: 16 };
ssm.finalBoss = { color: "#cc00ff", name: "FinalBoss", shape: "circle", radius: 14, offset: [0, -6] };
ssm["DJMapHelper/finalBossReversed"] = {
  ...ssm.finalBoss,
  name: "FinalBossReversed",
};
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

ssm.coreModeToggle = {
  color: (attr) => (attr.onlyIce ? "#00d9ff" : "#e12525"),
  name: "CoreModeToggle",
  anchorX: "center",
  anchorY: "center",
  width: 16,
  height: 24,
};
ssm["pandorasBox/flagToggleSwitch"] = {
  ...ssm.coreModeToggle,
  color: "#15b800",
  name: "FlagToggleSwitch",
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
  offset: (attr) => (attr.left ? [0, 0] : [6, 0]),
};
ssm["CommunalHelper/AttachedWallBooster"] = ssm.wallBooster;

ssm.seeker = { color: "#a832a8", name: "Seeker", shape: "seeker" };
ssm.theoCrystal = { color: "#00d0ff", name: "TheoCrystal", shape: "theo" };
ssm["cavern/crystalbomb"] = {
  ...ssm.theoCrystal,
  name: "CrystalBomb",
};
ssm.glider = { color: "#0077ff", name: "Jelly", shape: "jelly" };
ssm["MaxHelpingHand/RespawningJellyfish"] = {
  ...ssm.glider,
  name: "RespawningJelly",
};

ssm.introCar = { color: "#9b9b9b", name: "IntroCar", shape: "car" };

ssm.triggerSpikesLeft = {
  color: "#ffffff",
  name: "TriggerSpikes",
  outline: "dashed",
  width: 3,
  anchorX: "right",
};
ssm.triggerSpikesRight = {
  ...ssm.triggerSpikesLeft,
  anchorX: "left",
};
ssm.triggerSpikesUp = {
  ...ssm.triggerSpikesRight,
  anchorY: "bottom",
  height: 3,
  width: undefined,
};
ssm.triggerSpikesDown = {
  ...ssm.triggerSpikesUp,
  anchorY: "top",
};

ssm["SpringCollab2020/GroupedTriggerSpikesLeft"] = {
  ...ssm["triggerSpikesLeft"],
  name: "GroupedTriggerSpikes",
};
ssm["SpringCollab2020/GroupedTriggerSpikesRight"] = {
  ...ssm["triggerSpikesRight"],
  name: "GroupedTriggerSpikes",
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
ssm["MaxHelpingHand/GroupedTriggerSpikesLeft"] = ssm["SpringCollab2020/GroupedTriggerSpikesLeft"];
ssm["MaxHelpingHand/GroupedTriggerSpikesRight"] = ssm["SpringCollab2020/GroupedTriggerSpikesRight"];
ssm["MaxHelpingHand/GroupedTriggerSpikesUp"] = ssm["SpringCollab2020/GroupedTriggerSpikesUp"];
ssm["MaxHelpingHand/GroupedTriggerSpikesDown"] = ssm["SpringCollab2020/GroupedTriggerSpikesDown"];
ssm["VivHelper/RainbowTriggerSpikesUp"] = ssm["SpringCollab2020/GroupedTriggerSpikesUp"];
ssm["VivHelper/RainbowTriggerSpikesDown"] = ssm["SpringCollab2020/GroupedTriggerSpikesDown"];
ssm["VivHelper/RainbowTriggerSpikesLeft"] = ssm["SpringCollab2020/GroupedTriggerSpikesLeft"];
ssm["VivHelper/RainbowTriggerSpikesRight"] = ssm["SpringCollab2020/GroupedTriggerSpikesRight"];

ssm["CommunalHelper/TimedTriggerSpikesRight"] = {
  ...ssm["SpringCollab2020/GroupedTriggerSpikesRight"],
  name: "TimedTriggerSpikes",
};

ssm["outback/portal"] = {
  name: "Portal",
  color: (attr) => validateColorOr(attr.readyColor, "#00d9ff"),
  width: 10,
  height: 6,
  anchorX: "center",
  anchorY: "center",
};

ssm.bigSpinner = {
  shape: "circle",
  color: "#3d44ff",
  name: "Bumper",
  radius: 12,
};
ssm.fireBall = {
  shape: "circle",
  color: "#ff3d3d",
  name: "FireBall",
  radius: 6,
};

ssm["CommunalHelper/PlayerBubbleRegion"] = {
  color: "#8d8d8d",
  name: "PlayerBubbleRegion",
  outline: "dashed",
};
//#endregion

//#region Triggers
ssm.seekerBarrier = { color: "white", name: "SeekerBarrier", outline: "dashed" };
ssm["MaxHelpingHand/CustomSeekerBarrier"] = ssm.seekerBarrier;
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
ssm["SpringCollab2020/caveWall"] = ssm.fakeWall;
ssm["BrokemiaHelper/caveWall"] = ssm.fakeWall;

ssm["GravityHelper/GravityField"] = {
  ...ssm.fakeWall,
  name: "GravityField",
  color: "#00d9ff",
};

ssm.water = {
  color: "#0066ff",
  opacity: 0.1,
  outline: "dashed",
  depth: LAYERS.SOLIDS + 1,
  name: "Water",
  renderer: LargeBlockContentRenderer,
};
ssm.fireBarrier = {
  ...ssm.water,
  color: "#ff4000",
  name: "Fire",
};
ssm["FrostHelper/CustomFireBarrier"] = {
  ...ssm.fireBarrier,
  color: (attr) => validateColorOr(attr.surfaceColor, "#ff4000"),
};
ssm.iceBlock = {
  ...ssm.water,
  color: "#66ccff",
  name: "Ice",
};
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
  color: (attr) => validateColorOr(attr.color, "#0066ff"),
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
ssm["MaxHelpingHand/OneWayInvisibleBarrierHorizontal"] = ssm.invisibleBarrier;
ssm["FrostHelper/CustomInvisibleBarrier"] = ssm.invisibleBarrier;

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
  ...ssm.fakeWall,
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
ssm["PrismaticHelper/AttachedWatchtower"] = ssm.towerviewer;
ssm["VivHelper/CustomPlaybackWatchtower"] = ssm.towerviewer;
ssm.summitcheckpoint = {
  color: "#ffffff",
  width: 8,
  height: 16,
  name: (attr) => "Flag " + attr.number,
  anchorX: "center",
  anchorY: "top",
};
ssm["MaxHelpingHand/CustomSummitCheckpoint"] = {
  ...ssm.summitcheckpoint,
  name: "CustomFlag",
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
ssm["SpringCollab2020/CustomBirdTutorial"] = {
  color: "#a2a2a2",
  width: 16,
  height: 16,
  anchorX: "center",
  anchorY: "bottom",
};
ssm["fakeHeart"] = {
  color: "#3962e1",
  width: 16,
  height: 16,
  anchorX: "center",
  anchorY: "center",
};
ssm["SpringCollab2020/MultiRoomStrawberry"] = {
  color: "#ff4b4b",
  width: 10,
  height: 10,
  anchorX: "center",
  anchorY: "center",
};
ssm["SpringCollab2020/MultiRoomStrawberrySeed"] = ssm["SpringCollab2020/MultiRoomStrawberry"];
ssm["everest/npc"] = {
  color: "#ffb700",
  width: (attr) => attr.approachDistance ?? 8,
  height: 8,
  offset: [-8, -4],
};
ssm["MaxHelpingHand/MoreCustomNPC"] = ssm["everest/npc"];
ssm["luaCutscenes/luaTalker"] = {
  ...ssm["everest/npc"],
  width: undefined,
  height: undefined,
};

ssm["FemtoHelper/CustomFakeHeart"] = {
  color: "#3962e1",
  width: 16,
  height: 16,
  anchorX: "center",
  anchorY: "center",
  name: "CustomFakeHeart",
};

ssm["VivHelper/HideRoomInMap"] = {
  color: "#000000",
};
ssm["vitellary/dashcodecontroller"] = {
  color: "#ff00ff",
  name: "DashCodeController",
};
ssm.memorialTextController = {
  color: "#ffffff",
  name: "Memorial",
  width: 60,
  height: 80,
  offset: [-30, -60],
};
ssm["MaxHelpingHand/CustomMemorialWithDreamingAttribute"] = {
  ...ssm.memorialTextController,
  offset: [0, 0],
  anchorX: "center",
  anchorY: "bottom",
};
//#endregion

export const IgnoreUnhandled = {
  //#region Important Triggers
  importantTriggers: new Set([
    "noRefillTrigger",
    "windTrigger",
    "everest/changeInventoryTrigger",
    "DJMapHelper/maxDashesTrigger",
    "MoreDasheline/HairColorTrigger",
    "FrostHelper/NoMovementTrigger",
    "vitellary/nodashtrigger",
    "VivHelper/BasicInstantTeleportTrigger",
    "VivHelper/CustomInstantTeleportTrigger",
    "VivHelper/ITPT1Way",
    "VivHelper/TeleportTarget",
    "ContortHelper/TeleportationTriggerLevel1",
    "ContortHelper/TeleportationTarget",
    "VivHelper/MainInstantTeleportTrigger",
    "ContortHelper/MomentumModifierTrigger",
    "StrawberryJam2021/liftBoostTrigger",
    "XaphanHelper/TeleportToChapterTrigger",
    "DJMapHelper/badelineBoostTeleport",
    "AurorasHelper/ForcedMovementTrigger",
    "MaxHelpingHand/SetCustomInventoryTrigger",
    "SSMHelper/DashCancelTrigger",
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
  ]),
  //#endregion
  //#region Misc Gameplay Triggers
  miscGameplayTriggers: new Set([
    "changeRespawnTrigger",
    "goldenBerryCollectTrigger",
    "CollabUtils2/SilverBerryCollectTrigger",
    "CollabUtils2/GoldenBerryPlayerRespawnPoint",
    "killbox",
    "SorbetHelper/FlagToggledKillbox",
    "DJMapHelper/killBoxTrigger",
    "spawnFacingTrigger",
    "everest/crystalShatterTrigger",
    "CherryHelper/PlayerStateChange",
    "SpringCollab2020/BlockJellySpawnTrigger",
    "SpringCollab2020/StrawberryCollectionField",
    "SpringCollab2020/LeaveTheoBehindTrigger",
    "FrostHelper/CassetteTempoTrigger",
    "BounceHelper/BounceHelperTrigger",
    "detachFollowersTrigger",
    "everest/coreModeTrigger",
    "GameHelper/EntityModifier",
    "Bitsbolts/BlockTransition",
    "FrostHelper/CapDashOnGroundTrigger",
    "vitellary/canceltimecrystaltrigger",
    "AurorasHelper/ResetStateTrigger",
    "GravityHelper/SpawnGravityTrigger",
    "MaxHelpingHand/PauseBadelineBossesTrigger",
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
  ]),
  //#endregion
  //#region Camera Triggers
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
    "SpringCollab2020/SmoothCameraOffsetTrigger",
    "SpringCollab2020/FlagToggleSmoothCameraOffsetTrigger",
    "MaxHelpingHand/OneWayCameraTrigger",
    "HonlyHelper/CameraTargetCrossfadeTrigger",
    "ExCameraDynamics/CameraZoomTrigger",
    "Bitsbolts/UnlockCamera",
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
  ]),
  //#endregion
};

//#endregion

//#region Collectibles
export const COLLECTIBLE_DEFS = {};
const cd = COLLECTIBLE_DEFS;

cd.goldenBerry = [
  { match: (attr) => !attr.winged, collectible: { name: "Golden Berry", formValue: "0" } },
  { match: (attr) => !!attr.winged, collectible: { name: "Winged Golden Berry", formValue: "4" } },
];
cd["MaxHelpingHand/GoldenStrawberryCustomConditions"] = [
  { match: (attr) => !attr.winged, collectible: { name: "Golden Berry", formValue: "0" } },
];

cd.strawberry = [
  { match: (attr) => !attr.moon && !attr.winged, collectible: { name: "Strawberry", formValue: "2" } },
  { match: (attr) => !!attr.moon && !attr.winged, collectible: { name: "Moon Berry", formValue: "3" } },
  {
    match: (attr) => !attr.moon && !!attr.winged,
    collectible: { name: "Winged Strawberry", formValue: "2" },
  },
];

const returnBerryDef = [
  { match: (attr) => !attr.moon && !attr.winged, collectible: { name: "Strawberry", formValue: "2" } },
];
cd["SpringCollab2020/returnBerry"] = returnBerryDef;
cd["LunaticHelper/StrawberryWithReturn"] = returnBerryDef;
cd["SorbetHelper/ReturnBerry"] = returnBerryDef;
cd["ParrotHelper/FlagBerry"] = returnBerryDef;

cd["DSidesHelper/TeleportMoonBerry"] = [
  { match: (attr) => !!attr.moon && !attr.winged, collectible: { name: "Moon Berry", formValue: "3" } },
];

cd["CollabUtils2/SilverBerry"] = [
  { match: () => true, collectible: { name: "Silver Berry", formValue: "1" } },
];
cd["CollabUtils2/SpeedBerry"] = [
  { match: () => true, collectible: { name: "Speed Berry", formValue: "10" } },
];
cd.cassette = [{ match: () => true, collectible: { name: "Cassette", formValue: "6" } }];

const crystalHeartDef = [{ match: () => true, collectible: { name: "Crystal Heart", formValue: "7" } }];
cd.blackGem = crystalHeartDef;
cd["CollabUtils2/CrystalHeart"] = crystalHeartDef;
cd["CollabUtils2/MiniHeart"] = crystalHeartDef;
cd["MaxHelpingHand/ReskinnableCrystalHeart"] = crystalHeartDef;
cd["AdventureHelper/CustomCrystalHeart"] = crystalHeartDef;

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
    counts[item.formValue] = (counts[item.formValue] || 0) + 1;
  }
  return Object.entries(counts).map(([value, count]) => [value, "", "", String(count), ""]);
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

function isValidCssColor(str) {
  const s = new Option().style;
  s.color = str;
  return s.color !== "";
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

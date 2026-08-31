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
cd.memorialTextController = [{ collectible: { name: "Winged Golden Berry", formValue: "4" } }];
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
cd["MaxHelpingHand/NonPoppingStrawberry"] = cd.strawberry;

cd["DSidesHelper/TeleportMoonBerry"] = [
  { match: (attr) => !!attr.moon && !attr.winged, collectible: { name: "Moon Berry", formValue: "3" } },
];

cd["CollabUtils2/SilverBerry"] = [{ collectible: { name: "Silver Berry", formValue: "1" } }];
cd["CollabUtils2/SpeedBerry"] = [{ collectible: { name: "Speed Berry", formValue: "10" } }];
cd["CollabUtils2/RainbowBerry"] = [
  { collectible: { name: "Rainbow Berry", formValue: "13", formVariant: "3" } },
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
    match: (attr) => attr.strawberrySprite === "blueraspberry",
    collectible: { name: "Blue Raspberry", formValue: "3", formVariant: "19" },
  },
  {
    collectible: { name: "Strawberry", formValue: "2" },
  },
];
cd["ScuffedHelper/WaterBerry"] = [
  { collectible: { name: "Water Berry", formValue: "13", formVariant: "9" } },
];
cd["FrostHelper/CoreBerry"] = [
  {
    collectible: { name: "Core Berry", formValue: "2", formVariant: "14" },
  },
];
cd["CommunalHelper/DreamStrawberry"] = [
  {
    collectible: { name: "Dream Berry", formValue: "13", formVariant: "7" },
  },
];
cd["FactoryHelper/RustBerry"] = [
  {
    collectible: { name: "Rust Berry", formValue: "13", formVariant: "8" },
  },
];

cd["PlatinumStrawberry/PlatinumStrawberry"] = [{ collectible: { name: "Platinum Berry", formValue: "5" } }];
cd["DSidesPlatinum/PlatinumStrawberry"] = cd["PlatinumStrawberry/PlatinumStrawberry"];

cd.cassette = [{ collectible: { name: "Cassette", formValue: "6" } }];
cd["AltSidesHelper/AltSideCassette"] = cd.cassette;

const crystalHeartDef = [{ collectible: { name: "Crystal Heart", formValue: "7" } }];
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
        if (def.match === undefined || def.match(entity.attributes || {})) {
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

/**
 * Checks if a room should be hidden in anti-spoiler mode.
 * A room is hidden if it contains a "VivHelper/HideRoomInMap" entity.
 */
export function isRoomHidden(room) {
  return room.entities?.some((e) => e.name === "VivHelper/HideRoomInMap") ?? false;
}

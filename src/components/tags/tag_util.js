import { useMemo } from "react";

import { getQueryData, useGetTagTree } from "../../hooks/useApi";
import { isValidColor, safeDarken } from "../basic";

export const DEFAULT_TAG_COLOR = "#9e9e9e";
export const TAG_SELECTION_MODES = ["single", "multi"];

//#region Lookup
export function useTagLookup() {
  const query = useGetTagTree();
  const tree = getQueryData(query);
  const lookup = useMemo(() => (tree ? buildTagLookup(tree) : null), [tree]);
  return { query, lookup };
}

// Turns the category tree from GET /tag into maps for quick access by id
export function buildTagLookup(categories) {
  const categoriesById = {};
  const tagsById = {};
  const valuesById = {};
  for (const category of categories) {
    categoriesById[category.id] = category;
    for (const tag of category.tags ?? []) {
      tagsById[tag.id] = { tag, category };
      tag.values.forEach((value, index) => {
        valuesById[value.id] = { value, tag, category, index };
      });
    }
  }
  return { categories, categoriesById, tagsById, valuesById };
}
//#endregion

//#region Formatting
export function isImplicitTag(tag) {
  return tag.values.length === 1 && tag.values[0].name === null;
}

export function getTagValueLabel(tag, value) {
  if (value === null || value === undefined || value.name === null) return tag.name;
  return tag.name + " (" + value.name + ")";
}

export function getTagValueDescription(tag, value) {
  return value?.description ?? tag.description;
}

export function getTagCategoryColor(category) {
  return isValidColor(category?.color) ? category.color : DEFAULT_TAG_COLOR;
}

// Used for the qualifier and count segments of tag chips
export function getTagCategoryShadeColor(category) {
  return safeDarken(getTagCategoryColor(category), 0.4);
}
//#endregion

//#region Sorting
// Joins [{ tag_value_id, count, ... }] with the lookup, drops unknown values and sorts by category, then count desc.
// Values of 'single' tags are mutually exclusive: all values below the tag's highest count are flagged with `isOutvoted`.
// Values of 'multi' tags can all apply at once, so they are never out-voted.
export function resolveTagCounts(counts, lookup) {
  if (!lookup || !counts) return [];
  const resolved = [];
  const maxCountByTag = {};
  for (const entry of counts) {
    const info = lookup.valuesById[entry.tag_value_id];
    if (!info) continue;
    resolved.push({ ...entry, ...info });
    maxCountByTag[info.tag.id] = Math.max(maxCountByTag[info.tag.id] ?? 0, entry.count);
  }
  for (const entry of resolved) {
    entry.isOutvoted = entry.tag.selection_mode !== "multi" && entry.count < maxCountByTag[entry.tag.id];
  }
  resolved.sort((a, b) => {
    if (a.category.sort !== b.category.sort) return a.category.sort - b.category.sort;
    if (a.category.id !== b.category.id) return a.category.id - b.category.id;
    if (a.count !== b.count) return b.count - a.count;
    if (a.tag.sort !== b.tag.sort) return a.tag.sort - b.tag.sort;
    return a.index - b.index;
  });
  return resolved;
}
//#endregion

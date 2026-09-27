import {
  faChevronDown,
  faChevronRight,
  faStar,
  faUserShield,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Chip, Collapse, Divider, Grid, Stack, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ErrorDisplay, LoadingSpinner, SegmentedChip, safeAlpha } from "../basic";

import { getTagCategoryColor, getTagCategoryShadeColor, isImplicitTag, useTagLookup } from "./tag_util";

const ROW_BACKGROUND = "rgba(255,255,255,0.04)";

//#region TagsEditor
// Controlled editor for the tag values one player assigns to a challenge. `value` is an array of tag value ids.
// Values of tags that aren't shown (archived categories, team-only tags) are kept untouched in `value`.
export function TagsEditor({ value, onChange, canEditTeamTags = false, disabled = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags.editor" });
  const [rangeAnchors, setRangeAnchors] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const { query, lookup } = useTagLookup();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const selected = new Set(value);
  const groups = lookup.categories
    .filter((category) => !category.is_archived)
    .map((category) => ({
      category,
      tags: (category.tags ?? []).filter((tag) => canEditTeamTags || tag.is_player_assignable),
    }))
    .filter((group) => group.tags.length > 0);

  const setTagValues = (tag, tagValueIds) => {
    const ownIds = new Set(tag.values.map((v) => v.id));
    onChange([...value.filter((id) => !ownIds.has(id)), ...tagValueIds]);
  };
  const setAnchor = (tagId, index) => {
    setRangeAnchors((anchors) => ({ ...anchors, [tagId]: index }));
  };
  const toggleCollapsed = (categoryId) => {
    setCollapsed((c) => ({ ...c, [categoryId]: !c[categoryId] }));
  };

  if (groups.length === 0) {
    return <Typography variant="body2">{t("no_tags_available")}</Typography>;
  }

  return (
    <Stack direction="column" gap={1.5}>
      {groups.map(({ category, tags }) => (
        <Box key={category.id}>
          <Divider
            textAlign="left"
            sx={{
              "&::before, &::after": { borderColor: getTagCategoryColor(category), borderTopWidth: 2 },
              "&::before": { width: "2%" },
            }}
          >
            <CategoryHeaderChip
              category={category}
              isCollapsed={!!collapsed[category.id]}
              onClick={() => toggleCollapsed(category.id)}
            />
          </Divider>
          <Collapse in={!collapsed[category.id]}>
            <Stack direction="column" gap={1} sx={{ pt: 1 }}>
              {tags.map((tag) => (
                <TagEditorRow
                  key={tag.id}
                  tag={tag}
                  selected={selected}
                  onChangeTag={(ids) => setTagValues(tag, ids)}
                  anchor={rangeAnchors[tag.id] ?? null}
                  setAnchor={(index) => setAnchor(tag.id, index)}
                  disabled={disabled}
                />
              ))}
            </Stack>
          </Collapse>
        </Box>
      ))}
    </Stack>
  );
}
//#endregion

//#region CategoryHeaderChip
function CategoryHeaderChip({ category, isCollapsed, onClick }) {
  const chip = (
    <SegmentedChip
      size="medium"
      onClick={onClick}
      segments={[
        {
          key: "name",
          label: category.name,
          color: getTagCategoryColor(category),
          sx: { fontWeight: "bold" },
        },
        {
          key: "toggle",
          label: <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronDown} fixedWidth size="sm" />,
          color: getTagCategoryShadeColor(category),
          sx: { px: 1 },
        },
      ]}
    />
  );
  if (!category.description) return chip;
  return (
    <Tooltip title={category.description} arrow placement="top">
      {chip}
    </Tooltip>
  );
}
//#endregion

//#region TagEditorRow
function TagEditorRow({ tag, selected, onChangeTag, anchor, setAnchor, disabled }) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags.editor" });
  const selectedIds = tag.values.filter((v) => selected.has(v.id)).map((v) => v.id);
  // Tags without qualifiers have no title, their name is shown in the (single) toggle chip instead
  const implicit = isImplicitTag(tag);

  const onValueClick = (valueIndex) => {
    const valueId = tag.values[valueIndex].id;
    const isSelected = selected.has(valueId);

    if (implicit) {
      onChangeTag(isSelected ? [] : [valueId]);
    } else if (tag.selection_mode === "multi") {
      onChangeTag(isSelected ? selectedIds.filter((id) => id !== valueId) : [...selectedIds, valueId]);
    } else if (tag.selection_mode === "range") {
      if (anchor === null) {
        onChangeTag([valueId]);
        setAnchor(valueIndex);
      } else {
        const start = Math.min(anchor, valueIndex);
        const end = Math.max(anchor, valueIndex);
        onChangeTag(tag.values.slice(start, end + 1).map((v) => v.id));
        setAnchor(null);
      }
    } else {
      onChangeTag(isSelected ? [] : [valueId]);
    }
  };
  const onClear = () => {
    onChangeTag([]);
    setAnchor(null);
  };

  return (
    <Box sx={{ p: 1.25, borderRadius: 1, backgroundColor: ROW_BACKGROUND }}>
      <Grid container rowSpacing={1} columnSpacing={2} alignItems="center">
        <Grid item xs={12} sm={8}>
          {!implicit && (
            <Typography variant="body1" fontWeight="bold" component="div" sx={{ mb: 0.5 }}>
              <TagNameLabel tag={tag} />
            </Typography>
          )}
          <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
            {tag.values.map((value, index) => (
              <TagValueToggle
                key={value.id}
                label={implicit ? <TagNameLabel tag={tag} /> : value.name}
                description={value.description}
                isSelected={selected.has(value.id)}
                isAnchor={!implicit && tag.selection_mode === "range" && anchor === index}
                disabled={disabled}
                onClick={() => onValueClick(index)}
              />
            ))}
            {tag.selection_mode === "range" && !implicit && selectedIds.length > 0 && (
              <Tooltip title={t("clear")} arrow>
                <Chip
                  size="small"
                  variant="outlined"
                  label={<FontAwesomeIcon icon={faXmark} />}
                  onClick={onClear}
                  disabled={disabled}
                />
              </Tooltip>
            )}
          </Stack>
          {tag.selection_mode === "range" && !implicit && (
            <Typography variant="caption" color="text.secondary">
              {anchor === null ? t("range_hint") : t("range_pick_end")}
            </Typography>
          )}
          {tag.selection_mode === "multi" && !implicit && (
            <Typography variant="caption" color="text.secondary">
              {t("multi_hint")}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="div"
            sx={{ whiteSpace: "pre-line" }}
          >
            {tag.description}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
//#endregion

//#region TagNameLabel
function TagNameLabel({ tag }) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags.editor" });
  return (
    <Stack direction="row" alignItems="center" gap={0.75} component="span">
      <span>{tag.name}</span>
      {tag.is_common && (
        <Tooltip title={t("common_tooltip")} arrow placement="top">
          <FontAwesomeIcon icon={faStar} size="xs" color="#d4a000" />
        </Tooltip>
      )}
      {!tag.is_player_assignable && (
        <Tooltip title={t("team_only_tooltip")} arrow placement="top">
          <FontAwesomeIcon icon={faUserShield} size="xs" />
        </Tooltip>
      )}
    </Stack>
  );
}
//#endregion

//#region TagValueToggle
function TagValueToggle({ label, description, isSelected, isAnchor = false, disabled, onClick }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  // The anchor of a range is highlighted with an outline, since a thicker border would shift the layout
  const chip = (
    <Chip
      size="small"
      label={label}
      color={isSelected || isAnchor ? "primary" : "default"}
      variant={isSelected && !isAnchor ? "filled" : "outlined"}
      onClick={onClick}
      disabled={disabled}
      sx={
        isAnchor
          ? {
              backgroundColor: safeAlpha(primary, 0.2),
              outline: "1px dashed " + primary,
              outlineOffset: "2px",
            }
          : undefined
      }
    />
  );
  if (!description) return chip;
  return (
    <Tooltip title={description} arrow placement="top">
      {chip}
    </Tooltip>
  );
}
//#endregion

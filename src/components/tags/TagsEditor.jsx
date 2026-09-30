import { faChevronDown, faChevronRight, faStar, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Chip, Collapse, Divider, Grid, Stack, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ErrorDisplay, LoadingSpinner, SegmentedChip } from "../basic";

import { getTagCategoryColor, getTagCategoryShadeColor, isImplicitTag, useTagLookup } from "./tag_util";

const ROW_BACKGROUND = "rgba(255,255,255,0.04)";

//#region TagsEditor
// Controlled editor for the tag values one player assigns to a challenge. `value` is an array of tag value ids.
// The values of a tag are mutually exclusive, so at most one value per tag can be selected.
// Values of tags that aren't shown (archived categories, team-only tags) are kept untouched in `value`.
// `allowedValueIds`: if set, only these values can be newly selected (others can still be deselected)
export function TagsEditor({
  value,
  onChange,
  canEditTeamTags = false,
  disabled = false,
  allowedValueIds = null,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags.editor" });
  const [collapsed, setCollapsed] = useState({});
  const { query, lookup } = useTagLookup();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const selected = new Set(value);
  const allowed = allowedValueIds === null ? null : new Set(allowedValueIds);
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
                  disabled={disabled}
                  allowed={allowed}
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
      size="large"
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
function TagEditorRow({ tag, selected, onChangeTag, disabled, allowed }) {
  // Tags without qualifiers have no title, their name is shown in the (single) toggle chip instead
  const implicit = isImplicitTag(tag);

  const onValueClick = (valueId) => {
    onChangeTag(selected.has(valueId) ? [] : [valueId]);
  };

  return (
    <Box sx={{ p: 1.25, borderRadius: 1, backgroundColor: ROW_BACKGROUND }}>
      <Grid container rowSpacing={1} columnSpacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          {!implicit && (
            <Typography variant="body1" fontWeight="bold" component="div" sx={{ mb: 0.5 }}>
              <TagNameLabel tag={tag} />
            </Typography>
          )}
          <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
            {tag.values.map((value) => (
              <TagValueToggle
                key={value.id}
                label={implicit ? <TagNameLabel tag={tag} /> : value.name}
                description={value.description}
                isSelected={selected.has(value.id)}
                disabled={disabled || (allowed !== null && !selected.has(value.id) && !allowed.has(value.id))}
                onClick={() => onValueClick(value.id)}
              />
            ))}
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
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
          <FontAwesomeIcon
            icon={faStar}
            size="xs"
            color="#d4a000"
            style={{ position: "relative", bottom: "2px" }}
          />
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
function TagValueToggle({ label, description, isSelected, disabled, onClick }) {
  const chip = (
    <Chip
      size="small"
      label={label}
      color={isSelected ? "primary" : "default"}
      variant={isSelected ? "filled" : "outlined"}
      onClick={onClick}
      disabled={disabled}
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

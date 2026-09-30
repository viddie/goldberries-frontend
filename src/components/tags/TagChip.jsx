import { Stack, Tooltip, Typography } from "@mui/material";

import { SegmentedChip } from "../basic";

import {
  getTagCategoryColor,
  getTagCategoryShadeColor,
  getTagValueDescription,
  getTagValueLabel,
} from "./tag_util";

const TOOLTIP_DELAY = 50;

//#region TagChip
// Segments: [tag name (category color)] [qualifier (darker shade)] [count (darker shade)]
// `dimmed` greys the chip out a bit, e.g. for values that were out-voted by another value of the same tag
// `tooltip` replaces the default tooltip content (category, name and description)
export function TagChip({
  tag,
  value,
  category,
  count = null,
  onClick,
  highlighted = false,
  dimmed = false,
  showTooltip = true,
  tooltip = null,
  size = "medium",
  sx,
  ...props
}) {
  const color = getTagCategoryColor(category);
  const shade = getTagCategoryShadeColor(category);
  const description = getTagValueDescription(tag, value);
  const hasQualifier = value !== null && value !== undefined && value.name !== null;

  const chip = (
    <SegmentedChip
      size={size}
      onClick={onClick}
      highlighted={highlighted}
      segments={[
        { key: "tag", label: tag.name, color, sx: { fontWeight: 500 } },
        hasQualifier && { key: "value", label: value.name, color: shade },
        count !== null && {
          key: "count",
          label: count,
          color: shade,
          sx: {
            fontWeight: "bold",
            borderLeft: hasQualifier ? "1px solid rgba(0,0,0,0.3)" : undefined,
          },
        },
      ]}
      sx={dimmed ? { ...getDimmedSx(!!onClick), ...sx } : sx}
      {...props}
    />
  );

  if (!showTooltip || (tooltip === null && !description)) return chip;
  return (
    <Tooltip
      title={tooltip ?? <TagTooltipContent tag={tag} value={value} category={category} />}
      enterDelay={TOOLTIP_DELAY}
      enterNextDelay={TOOLTIP_DELAY}
      arrow
    >
      {chip}
    </Tooltip>
  );
}
//#endregion

//#region TagTooltipContent
export function TagTooltipContent({ tag, value, category }) {
  return (
    <Stack direction="column" gap={0.25}>
      <Typography variant="caption" sx={{ opacity: 0.75 }}>
        {category?.name}
      </Typography>
      <Typography variant="body2" fontWeight="bold">
        {getTagValueLabel(tag, value)}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {getTagValueDescription(tag, value)}
      </Typography>
    </Stack>
  );
}
//#endregion

//#region Utility Functions
function getDimmedSx(isClickable) {
  const filter = "saturate(0.25)";
  return {
    opacity: 0.6,
    filter,
    ...(isClickable && { "&:hover": { filter: filter + " brightness(1.2)" } }),
  };
}
//#endregion

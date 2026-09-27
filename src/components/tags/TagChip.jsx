import { Stack, Tooltip, Typography } from "@mui/material";

import { SegmentedChip } from "../basic";

import {
  getTagCategoryColor,
  getTagCategoryShadeColor,
  getTagValueDescription,
  getTagValueLabel,
} from "./tag_util";

//#region TagChip
// Segments: [tag name (category color)] [qualifier (darker shade)] [count (darker shade)]
export function TagChip({
  tag,
  value,
  category,
  count = null,
  onClick,
  highlighted = false,
  showTooltip = true,
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
      sx={sx}
      {...props}
    />
  );

  if (!showTooltip || !description) return chip;
  return (
    <Tooltip title={<TagTooltipContent tag={tag} value={value} category={category} />} arrow>
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

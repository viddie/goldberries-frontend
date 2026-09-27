import { Box, ButtonBase, alpha, darken, decomposeColor, lighten } from "@mui/material";
import { useTheme } from "@emotion/react";
import { forwardRef } from "react";

// Drawn with box-shadow, so it doesn't affect the layout
const HIGHLIGHT_SHADOW = "0 0 0 1.5px rgba(255,255,255,0.9), 0 0 6px 1px rgba(255,255,255,0.45)";

const SIZES = {
  small: { height: 20, outerPx: 0.75, innerPx: 0.5, fontSize: "0.7125rem" },
  medium: { height: 24, outerPx: 1, innerPx: 0.75, fontSize: "0.8125rem" },
  large: { height: 32, outerPx: 1.5, innerPx: 1.25, fontSize: "0.875rem" },
};

// A chip made up of multiple colored segments. Only the outer ends of the chip are rounded, inner segments are flush.
// segments: [{ key?, label, color, textColor?, sx? }], falsy entries are skipped
// highlighted: draws a bright ring around the chip
export const SegmentedChip = forwardRef(function SegmentedChip(
  { segments, size = "medium", onClick, disabled = false, highlighted = false, sx, ...props },
  ref,
) {
  const theme = useTheme();
  const dims = SIZES[size] ?? SIZES.medium;
  const visibleSegments = segments.filter(Boolean);
  const isClickable = !!onClick && !disabled;

  const rootSx = {
    display: "inline-flex",
    alignItems: "stretch",
    verticalAlign: "middle",
    height: dims.height,
    maxWidth: "100%",
    flexShrink: 0,
    borderRadius: dims.height / 2 + "px",
    overflow: "hidden",
    fontFamily: theme.typography.fontFamily,
    fontSize: dims.fontSize,
    lineHeight: 1,
    userSelect: "none",
    opacity: disabled ? 0.5 : 1,
    transition: "filter 150ms, box-shadow 150ms",
    boxShadow: highlighted ? HIGHLIGHT_SHADOW : undefined,
    ...(isClickable && {
      cursor: "pointer",
      "&:hover": { filter: "brightness(1.2)" },
    }),
    ...sx,
  };

  const content = visibleSegments.map((segment, index) => (
    <Box
      key={segment.key ?? index}
      component="span"
      sx={{
        display: "flex",
        alignItems: "center",
        minWidth: 0,
        pl: index === 0 ? dims.outerPx : dims.innerPx,
        pr: index === visibleSegments.length - 1 ? dims.outerPx : dims.innerPx,
        whiteSpace: "nowrap",
        backgroundColor: segment.color,
        color: segment.textColor ?? getSegmentTextColor(theme, segment.color),
        ...segment.sx,
      }}
    >
      {segment.label}
    </Box>
  ));

  if (isClickable) {
    return (
      <ButtonBase ref={ref} onClick={onClick} sx={rootSx} {...props}>
        {content}
      </ButtonBase>
    );
  }
  return (
    <Box ref={ref} component="span" sx={rootSx} {...props}>
      {content}
    </Box>
  );
});

//#region Utility Functions
function getSegmentTextColor(theme, color) {
  try {
    return theme.palette.getContrastText(color);
  } catch (e) {
    return theme.palette.text.primary;
  }
}

export function isValidColor(color) {
  if (!color) return false;
  try {
    decomposeColor(color);
    return true;
  } catch (e) {
    return false;
  }
}

// Color helpers that don't throw for unparseable colors (e.g. named colors), but return the fallback instead
export function safeDarken(color, amount, fallback = "#9e9e9e") {
  return darken(isValidColor(color) ? color : fallback, amount);
}
export function safeLighten(color, amount, fallback = "#9e9e9e") {
  return lighten(isValidColor(color) ? color : fallback, amount);
}
export function safeAlpha(color, opacity, fallback = "#9e9e9e") {
  return alpha(isValidColor(color) ? color : fallback, opacity);
}
//#endregion

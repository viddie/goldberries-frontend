import { Box, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import Color from "color";

import { MarkdownRenderer } from "../../pages/Post";
import { hasFlag } from "../../pages/Account";
import { BADGE_FLAGS } from "../forms/Badge";

export function Badge({ badge }) {
  const theme = useTheme();
  return (
    <Tooltip
      title={<BadgeExplanation badge={badge} />}
      placement="bottom"
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: theme.palette.tooltip.background,
            color: theme.palette.text.primary,
          },
        },
      }}
    >
      <Box height={32}>
        <BadgeImage badge={badge} />
      </Box>
    </Tooltip>
  );
}

function BadgeTitle({ badge }) {
  return <Typography variant="h6">{badge.title}</Typography>;
}
function BadgeImage({ badge, full = false }) {
  const borderColor = badge.color ? badge.color : "#ffffff";
  const borderWidth = full ? "4px" : "2px";
  const shinyClass = hasFlag(badge.flags, BADGE_FLAGS.shiny.flag) ? " shine" : "";
  const glowClass = hasFlag(badge.flags, BADGE_FLAGS.glow.flag) ? " glow" : "";
  const level1Class = hasFlag(badge.flags, BADGE_FLAGS.level1.flag) ? " level bronze" : "";
  const level2Class = hasFlag(badge.flags, BADGE_FLAGS.level2.flag) ? " level silver" : "";
  const level3Class = hasFlag(badge.flags, BADGE_FLAGS.level3.flag) ? " level gold" : "";
  const levelClass = level3Class || level2Class || level1Class || "";
  const fullClass = full ? " large" : "";

  var backgroundColor = new Color(borderColor).darken(0.45).desaturate(0.4).hex();

  return (
    <Stack
      className={"badge-container" + fullClass + shinyClass + glowClass + levelClass}
      sx={{ height: full ? "128px" : "32px", width: full ? "128px" : "32px" }}
    >
      <img
        src={badge.icon_url}
        className="badge"
        height={full ? 128 : 32}
        loading="lazy"
        alt={badge.title}
        style={{
          borderRadius: "4px",
          border: "solid " + borderWidth + " " + borderColor,
          background: backgroundColor,
        }}
      />
    </Stack>
  );
}
function BadgeExplanation({ badge }) {
  return (
    <Stack direction="column" gap={1} sx={{ maxWidth: "300px", minWidth: "200px" }} alignItems="center">
      <BadgeTitle badge={badge} />
      <BadgeImage badge={badge} full />
      <Stack sx={{ textAlign: "center" }}>
        <MarkdownRenderer markdown={badge.description} isCentered />
      </Stack>
    </Stack>
  );
}

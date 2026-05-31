import { Box, LinearProgress, Stack } from "@mui/material";

import { getQueryData, useGetStampSubmissionsForPlayer } from "../hooks/useApi";

import { StyledLink } from "./basic";

const SUMMER_STAMP_EVENT_START = new Date(2026, 5, 1); // June 1st 2026
const SUMMER_STAMP_EVENT_END = new Date(2026, 8, 1); // September 1st 2026 (3 months later)
const SUMMER_STAMP_TOTAL = 10;

function getSummerStampRemainingString() {
  const now = new Date();
  const target = now < SUMMER_STAMP_EVENT_START ? SUMMER_STAMP_EVENT_START : SUMMER_STAMP_EVENT_END;
  const diffMs = target - now;
  if (diffMs <= 0) return null;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return `${days}d`;
}

export function SummerStampLink({ playerId }) {
  const stampsQuery = useGetStampSubmissionsForPlayer(playerId);
  const stamps = getQueryData(stampsQuery) ?? [];
  const count = Math.min(stamps.length, SUMMER_STAMP_TOTAL);
  const progress = (count / SUMMER_STAMP_TOTAL) * 100;
  const remaining = getSummerStampRemainingString();

  if (remaining === null) return null;

  const imageSize = 64;

  return (
    <StyledLink
      to={`/summer-stamp-ralley/${playerId}`}
      style={{ textDecoration: "none", display: "inline-block" }}
    >
      <Stack
        direction="column"
        alignItems="center"
        sx={{
          width: imageSize + 12,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          transition: "all 0.3s",
          border: "1px solid transparent",
          "&:hover": {
            background: "#555",
            border: "1px solid #aaa",
          },
        }}
      >
        <Box sx={{ position: "relative", width: imageSize, height: imageSize }}>
          <img
            src="/img/stamp/sss2.png"
            alt="Summer Stamp Rally"
            style={{ width: imageSize, height: imageSize, objectFit: "contain" }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              transform: "translate(50%, -50%)",
              backgroundColor: "rgba(0,0,0,0.85)",
              color: "white",
              borderRadius: "8px",
              px: 0.5,
              py: "1px",
              fontSize: "0.65rem",
              lineHeight: 1.2,
              fontWeight: "bold",
              border: "1px solid rgba(255,255,255,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {remaining}
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            width: "100%",
            mt: 0.5,
            height: 5,
            borderRadius: 5,
            backgroundColor: "transparent",
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              background: "linear-gradient(to right, #4caf50, #8bc34a)",
            },
            border: "1px solid #888888",
          }}
        />
      </Stack>
    </StyledLink>
  );
}

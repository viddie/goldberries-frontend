import { useTheme } from "@emotion/react";
import { Tooltip } from "@mui/material";
import Color from "color";
import { TooltipLineBreaks } from "./BasicComponents";

const heightMap = {
  small: 16,
  medium: 20,
  large: 24,
};
const fontSizeMap = {
  small: 12,
  medium: 14,
  large: 16,
};

// Renders a competing votes bar with votes for in green on the left, votes against in red on the right, and indifferent votes in gray in the middle.
// Give it a white outline border and a slight shadow. If isSecondary is true, give it a more grayish outline and shadow.
// Props:
// - size: "small" | "medium" | "large". default is "medium". determines the height of the bar.
// - votesFor: number of votes for. must be >= 0
// - votesAgainst: number of votes against. must be >= 0
// - votesIndifferent: number of indifferent votes. must be >= 0 or null/undefined
// - ownVoteType: "for" | "against" | "indifferent" | null. If the user has voted, this indicates their vote type. render as a brighter color for that particular section of the bar.
// - isSecondary: whether the bar is in secondary mode
// Show the vote count for each section on the bar section. the bar is never too small to fit the text, except if its 0 votes, then dont show that section at all.
export function VotesBar({
  size = "medium",
  votesFor,
  votesAgainst,
  votesIndifferent,
  ownVoteType = null,
  style = {},
}) {
  const theme = useTheme();
  const borderColor = theme.palette.grey[800];
  const colors = {
    for: "#156217",
    against: "#591813ff",
    indifferent: "#1c1c1cff",
    indifferent_own: "#7c7c7cff",
  };
  const alpha = 0.7;
  colors.for_own = new Color(colors.for).saturate(alpha).lighten(alpha).string();
  colors.against_own = new Color(colors.against).saturate(alpha).lighten(alpha).string();

  const colorFor = ownVoteType === "for" ? colors.for_own : colors.for;
  const contrastFor = new Color(colorFor).isDark() ? "white" : "black";
  const colorAgainst = ownVoteType === "against" ? colors.against_own : colors.against;
  const contrastAgainst = new Color(colorAgainst).isDark() ? "white" : "black";
  const colorIndifferent = ownVoteType === "indifferent" ? colors.indifferent_own : colors.indifferent;
  const contrastIndifferent = new Color(colorIndifferent).isDark() ? "white" : "black";

  const height = heightMap[size] || heightMap.medium;
  const fontSize = fontSizeMap[size] || fontSizeMap.medium;
  const minWidth = size === "small" ? 24 : size === "large" ? 40 : 30;

  const totalVotes = votesFor + votesAgainst + (votesIndifferent ?? 0);
  const noVotes = totalVotes === 0;

  // Convert to relative weights for flex layout
  const segments = [
    { key: "for", votes: votesFor, color: colorFor, contrast: contrastFor },
    {
      key: "indifferent",
      votes: votesIndifferent ?? 0,
      color: colorIndifferent,
      contrast: contrastIndifferent,
    },
    { key: "against", votes: votesAgainst, color: colorAgainst, contrast: contrastAgainst },
  ].filter((s) => s.votes > 0);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height,
        width: "100%",
        border: `1px solid ${borderColor}`,
        borderRadius: "8px",
        ...style,
      }}
    >
      {noVotes && (
        <div
          style={{
            backgroundColor: theme.palette.background.paper,
            width: "100%",
            borderRadius: "8px",
            ...centerStyle,
          }}
        >
          <span style={{ color: theme.palette.text.secondary, fontSize }}>---</span>
        </div>
      )}

      {!noVotes &&
        segments.map((seg, i) => (
          <div
            key={seg.key}
            style={{
              backgroundColor: seg.color,
              flexGrow: seg.votes,
              flexBasis: 0,
              height: "100%",
              minWidth,
              ...centerStyle,
              boxShadow: ownVoteType === seg.key ? `0 0 10px ${seg.color}` : "none",
              borderTopLeftRadius: i === 0 ? "8px" : "0px",
              borderBottomLeftRadius: i === 0 ? "8px" : "0px",
              borderTopRightRadius: i === segments.length - 1 ? "8px" : "0px",
              borderBottomRightRadius: i === segments.length - 1 ? "8px" : "0px",
            }}
          >
            <span style={{ color: seg.contrast, fontSize, lineHeight: 1 }}>{seg.votes}</span>
          </div>
        ))}
    </div>
  );
}

const centerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

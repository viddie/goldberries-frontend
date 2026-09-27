import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  getCampaignName,
  getChallengeCampaign,
  getChallengeNameShort,
  getChallengeSuffix,
  getMapName,
  isMapSameNameAsCampaign,
} from "../../util/data_util";
import { StyledLink } from "../basic";

import { ChallengeFcIcon } from "./ChallengeFcIcon";
import { ObjectiveIcon } from "./ObjectiveIcon";

// Rendered as inline text (instead of a flex container), so long names wrap naturally like regular text.
// The challenge part (name, suffix, icons) is kept together and never wraps internally.
export function ChallengeInline({
  challenge,
  submission,
  separateChallenge = false,
  showChallenge,
  hideCampaign = false,
  flexWrap,
  size,
  sx,
  ...props
}) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);

  const nameIsSame = isMapSameNameAsCampaign(map, campaign);
  const showMap = !nameIsSame && map;
  const hasPrefix = !hideCampaign || showMap;
  const showSeparator = (showChallenge || separateChallenge) && hasPrefix;

  return (
    <Box
      component="span"
      sx={{ display: "inline", whiteSpace: flexWrap === "nowrap" ? "nowrap" : undefined, ...sx }}
      {...props}
    >
      {!hideCampaign && (
        <StyledLink to={"/campaign/" + campaign.id}>{getCampaignName(campaign, t_g, true)}</StyledLink>
      )}
      {showMap && (
        <>
          {!hideCampaign && <InlineSeparator />}
          <StyledLink to={"/map/" + map.id}>{getMapName(map, campaign, false)}</StyledLink>
        </>
      )}
      {showSeparator ? <InlineSeparator /> : hasPrefix && " "}
      <Box
        component="span"
        sx={{ display: "inline-flex", alignItems: "center", columnGap: 0.5, whiteSpace: "nowrap" }}
      >
        {showChallenge && (
          <StyledLink to={"/challenge/" + challenge.id}>
            {getChallengeNameShort(challenge, false, false)}
          </StyledLink>
        )}
        {getChallengeSuffix(challenge) !== null && (
          <Typography variant="body2" color="textSecondary" component="span">
            [{getChallengeSuffix(challenge)}]
          </Typography>
        )}
        {showChallenge && (
          <ObjectiveIcon
            objective={challenge.objective}
            challenge={challenge}
            height="1.1em"
            style={{ marginBottom: "-2px" }}
          />
        )}
        {submission ? (
          <StyledLink to={"/submission/" + submission.id} style={{ lineHeight: "1" }}>
            <ChallengeFcIcon showClear allowTextIcons challenge={challenge} height="1.1em" />
          </StyledLink>
        ) : (
          <StyledLink to={"/challenge/" + challenge.id} style={{ lineHeight: "0" }}>
            <ChallengeFcIcon showClear allowTextIcons challenge={challenge} height="1.1em" />
          </StyledLink>
        )}
      </Box>
    </Box>
  );
}

// The "/" sticks to the preceding name, a line break is only possible after it
function InlineSeparator() {
  return (
    <>
      <span style={{ margin: "0 0.2em 0 0.45em" }}>/</span>{" "}
    </>
  );
}

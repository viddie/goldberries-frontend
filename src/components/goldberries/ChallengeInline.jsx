import { Stack, Typography } from "@mui/material";
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

export function ChallengeInline({
  challenge,
  submission,
  separateChallenge = false,
  showChallenge,
  ...props
}) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);

  const nameIsSame = isMapSameNameAsCampaign(map, campaign);

  return (
    <Stack
      display={"inline-flex"}
      direction="row"
      alignItems="center"
      columnGap={1}
      flexWrap="wrap"
      {...props}
    >
      <StyledLink to={"/campaign/" + campaign.id}>{getCampaignName(campaign, t_g, true)}</StyledLink>
      {!nameIsSame && map && (
        <>
          {"/"}
          <StyledLink to={"/map/" + map.id}>{getMapName(map, campaign, false)}</StyledLink>
        </>
      )}
      {(showChallenge || separateChallenge) && "/"}
      <Stack direction="row" alignItems="center" columnGap={0.5}>
        {showChallenge && (
          <StyledLink to={"/challenge/" + challenge.id}>
            {getChallengeNameShort(challenge, false, false)}
          </StyledLink>
        )}
        {getChallengeSuffix(challenge) !== null && (
          <Typography variant="body2" color="textSecondary">
            [{getChallengeSuffix(challenge)}]
          </Typography>
        )}
        {showChallenge && (
          <ObjectiveIcon objective={challenge.objective} height="1.1em" style={{ marginBottom: "-2px" }} />
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
      </Stack>
    </Stack>
  );
}

import { Chip, Divider, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CampaignSelect } from "./CampaignSelect";
import { MapSelect } from "./MapSelect";
import { ChallengeSelect } from "./ChallengeSelect";
import { CampaignChallengeSelect } from "./CampaignChallengeSelect";

export function FullChallengeSelect({ challenge, setChallenge, disabled }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.full_challenge_select" });
  const [campaign, setCampaign] = useState(challenge?.map?.campaign ?? challenge?.campaign ?? null);
  const [map, setMap] = useState(challenge?.map ?? null);

  const onCampaignSelect = (campaign) => {
    setCampaign(campaign);
    if (campaign !== null && campaign.maps.length === 1) {
      setMap(campaign.maps[0]);
      if (campaign.maps[0].challenges.length === 1) {
        setChallenge(campaign.maps[0].challenges[0]);
      } else {
        setChallenge(null);
      }
    } else {
      setMap(null);
      setChallenge(null);
    }
  };
  const onMapSelect = (map) => {
    setMap(map);
    if (map !== null && map.challenges.length === 1) {
      setChallenge(map.challenges[0]);
    } else {
      setChallenge(null);
    }
  };

  useEffect(() => {
    if (challenge !== null && challenge.map !== null) {
      setCampaign(challenge.map?.campaign);
      setMap(challenge.map);
    } else if (challenge !== null && challenge.campaign !== null) {
      setCampaign(challenge.campaign);
      setMap(null);
    }
  }, [challenge]);

  return (
    <Stack direction="column" gap={2}>
      <CampaignSelect selected={campaign} setSelected={onCampaignSelect} disabled={disabled} />
      {campaign && (
        <MapSelect campaign={campaign} selected={map} setSelected={onMapSelect} disabled={disabled} />
      )}
      {campaign && map && (
        <ChallengeSelect map={map} selected={challenge} setSelected={setChallenge} disabled={disabled} />
      )}
      {campaign && map === null && campaign.challenges?.length > 0 && (
        <>
          <Divider>
            <Chip label={t("full_game_label")} size="small" />
          </Divider>
          <CampaignChallengeSelect campaign={campaign} selected={challenge} setSelected={setChallenge} />
        </>
      )}
    </Stack>
  );
}

import { Button, Chip, Divider, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import { CampaignSelect } from "./CampaignSelect";
import { MapSelect } from "./MapSelect";
import { ChallengeSelect } from "./ChallengeSelect";
import { CampaignChallengeSelect } from "./CampaignChallengeSelect";

export function OpenUrlButton({ url }) {
  return (
    <Button
      component="a"
      variant="text"
      color="inherit"
      size="small"
      aria-label="Open link in a new tab"
      aria-disabled={!url}
      href={url || undefined}
      target={url ? "_blank" : undefined}
      rel={url ? "noreferrer" : undefined}
      tabIndex={url ? 0 : -1}
      sx={{
        minWidth: 0,
        px: 1,
        alignSelf: "stretch",
        pointerEvents: url ? "auto" : "none",
        opacity: url ? 1 : 0.38,
      }}
    >
      <FontAwesomeIcon icon={faExternalLinkAlt} />
    </Button>
  );
}

export function FullChallengeSelect({ challenge, setChallenge, disabled, showOpenButtons = false }) {
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
      <Stack direction="row" gap={1} alignItems="center">
        <CampaignSelect selected={campaign} setSelected={onCampaignSelect} disabled={disabled} />
        {showOpenButtons && (
          <OpenUrlButton url={campaign && `/campaign/${campaign.id}`} />
        )}
      </Stack>
      {campaign && (
        <Stack direction="row" gap={1} alignItems="center">
          <MapSelect campaign={campaign} selected={map} setSelected={onMapSelect} disabled={disabled} />
          {showOpenButtons && (
            <OpenUrlButton url={map && `/map/${map.id}`} />
          )}
        </Stack>
      )}
      {campaign && map && (
        <Stack direction="row" gap={1} alignItems="center">
          <ChallengeSelect map={map} selected={challenge} setSelected={setChallenge} disabled={disabled} />
          {showOpenButtons && (
            <OpenUrlButton url={challenge && `/challenge/${challenge.id}`} />
          )}
        </Stack>
      )}
      {campaign && map === null && campaign.challenges?.length > 0 && (
        <>
          <Divider>
            <Chip label={t("full_game_label")} size="small" />
          </Divider>
          <Stack direction="row" gap={1} alignItems="center">
            <CampaignChallengeSelect campaign={campaign} selected={challenge} setSelected={setChallenge} />
            {showOpenButtons && (
              <OpenUrlButton url={challenge && `/challenge/${challenge.id}`} />
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
}

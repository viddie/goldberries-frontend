import { Stack } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CampaignSelect } from "./CampaignSelect";
import { MapSelect } from "./MapSelect";

export function FullMapSelect({ value, setValue, disabled }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.full_map_select" });
  const [campaign, setCampaign] = useState(value?.campaign ?? null);

  const onCampaignSelect = (campaign) => {
    setCampaign(campaign);
    if (campaign !== null && campaign.maps.length === 1) {
      setValue(campaign.maps[0]);
    } else {
      setValue(null);
    }
  };

  return (
    <Stack direction="column" gap={2}>
      <CampaignSelect selected={campaign} setSelected={onCampaignSelect} disabled={disabled} />
      {campaign && (
        <MapSelect campaign={campaign} selected={value} setSelected={setValue} disabled={disabled} />
      )}
    </Stack>
  );
}

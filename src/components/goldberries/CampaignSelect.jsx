import { Autocomplete, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

import { getCampaignName } from "../../util/data_util";
import { getQueryData, useGetAllCampaigns } from "../../hooks/useApi";

export function CampaignSelect({
  selected,
  setSelected,
  filter = null,
  disabled = false,
  empty = false,
  rejected = false,
}) {
  const { t } = useTranslation();
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useGetAllCampaigns(empty, rejected);

  let rawCampaigns = getQueryData(query);
  let campaigns = rawCampaigns ?? [];
  if (filter !== null) {
    campaigns = campaigns.filter(filter);
  }
  campaigns.sort((a, b) => a.name.localeCompare(b.name));

  const getOptionLabel = (campaign) => {
    if (rawCampaigns === null) return t("general.loading");
    return getCampaignName(campaign, t_g);
  };

  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      getOptionKey={(campaign) => campaign.id}
      getOptionLabel={getOptionLabel}
      getOptionDisabled={(campaign) => rawCampaigns === null}
      options={campaigns.length === 0 ? [{ name: "test" }] : campaigns}
      value={selected}
      onChange={(event, newValue) => {
        setSelected(newValue);
      }}
      renderInput={(params) => <TextField {...params} label={t("general.campaign", { count: 1 })} />}
    />
  );
}

import { Autocomplete, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getQueryData, useGetAllMapsInCampaign } from "../../hooks/useApi";

export function MapSelect({ campaign, selected, setSelected, disabled, ...props }) {
  const { t } = useTranslation();
  const query = useGetAllMapsInCampaign(campaign?.id);

  const maps = campaign ? (getQueryData(query)?.maps ?? []) : [];

  const getOptionLabel = (map) => {
    const oldPrefix = map.is_archived ? "[Old] " : "";
    return oldPrefix + map.name;
  };

  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      getOptionKey={(map) => map.id}
      getOptionLabel={getOptionLabel}
      options={maps}
      value={selected}
      onChange={(event, newValue) => {
        setSelected(newValue);
      }}
      {...props}
      renderInput={(params) => <TextField {...params} label={t("general.map", { count: 1 })} />}
    />
  );
}

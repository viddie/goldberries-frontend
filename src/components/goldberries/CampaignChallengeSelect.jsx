import { Autocomplete, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getChallengeName } from "../../util/data_util";
import { getQueryData, useGetAllChallengesInCampaign } from "../../hooks/useApi";

export function CampaignChallengeSelect({ campaign, selected, setSelected, disabled, hideLabel = false }) {
  const { t } = useTranslation();
  const query = useGetAllChallengesInCampaign(campaign?.id);
  const challenges = getQueryData(query)?.challenges ?? [];

  const getOptionLabel = (challenge) => {
    return getChallengeName(challenge);
  };

  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      getOptionKey={(challenge) => challenge.id}
      getOptionLabel={getOptionLabel}
      options={challenges}
      disableListWrap
      value={selected}
      onChange={(event, newValue) => {
        setSelected(newValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label={hideLabel ? undefined : t("general.challenge", { count: 1 })} />
      )}
      renderOption={(props, challenge) => {
        return (
          <Stack direction="row" gap={1} {...props}>
            {getChallengeName(challenge)}
          </Stack>
        );
      }}
    />
  );
}

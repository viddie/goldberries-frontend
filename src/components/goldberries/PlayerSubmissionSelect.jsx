import { Autocomplete, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

import { getChallengeNameClean } from "../../util/data_util";
import { getQueryData, useGetPlayerSubmissions } from "../../hooks/useApi";

export function PlayerSubmissionSelect({ playerId, submission, setSubmission, ...props }) {
  const { t } = useTranslation();
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useGetPlayerSubmissions(playerId, true, true);

  let submissions = getQueryData(query) ?? [];

  const getOptionLabel = (submission) => {
    return getChallengeNameClean(submission.challenge, t_g);
  };

  return (
    <Autocomplete
      fullWidth
      getOptionKey={(submission) => submission.id}
      getOptionLabel={getOptionLabel}
      options={submissions}
      value={submission}
      onChange={(event, newValue) => {
        setSubmission(newValue);
      }}
      renderInput={(params) => <TextField {...params} label={t("general.submission", { count: 1 })} />}
      {...props}
    />
  );
}

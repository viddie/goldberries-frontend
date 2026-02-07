import { Autocomplete, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppSettings } from "../../hooks/AppSettingsProvider";
import { getDifficultyName } from "../../util/data_util";
import { DIFF_CONSTS, getOldDifficultyName } from "../../util/constants";
import { getQueryData, useGetAllDifficulties } from "../../hooks/useApi";

export function DifficultySelectControlled({
  difficultyId,
  setDifficultyId,
  setDifficulty,
  isSuggestion = false,
  minSort = null,
  maxSort = null,
  label,
  ...props
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.difficulty_select" });
  const { settings } = useAppSettings();

  const query = useGetAllDifficulties();

  const showOldTierNames = settings.general.showOldTierNames && false;
  const getOldName = (id) => {
    if (showOldTierNames) {
      return " (" + getOldDifficultyName(id) + ")";
    }
    return "";
  };

  const onChangeDifficulty = (id) => {
    const difficulty = getQueryData(query).find((d) => d.id === id);
    if (!difficulty) {
      if (setDifficulty) setDifficulty(null);
      if (setDifficultyId) setDifficultyId(null);
    } else {
      if (setDifficulty) setDifficulty(difficulty);
      if (setDifficultyId) setDifficultyId(id);
    }
  };

  let difficulties = getQueryData(query) ?? [{ id: difficultyId }];
  difficulties = JSON.parse(JSON.stringify(difficulties));
  if (isSuggestion) {
    difficulties = difficulties.filter(
      (d) => d.id !== DIFF_CONSTS.TRIVIAL_ID && d.id !== DIFF_CONSTS.UNTIERED_ID,
    );
  }
  if (minSort !== null) {
    difficulties = difficulties.filter((d) => d.sort >= minSort);
  }
  if (maxSort !== null) {
    difficulties = difficulties.filter((d) => d.sort <= maxSort);
  }
  //Add "No Selection" option at the start with id = 0
  difficulties.unshift({ id: 0 });

  const selectedDifficulty = difficulties.find((d) => d.id === difficultyId);

  return (
    <Autocomplete
      {...props}
      options={difficulties}
      getOptionLabel={(difficulty) => (difficulty.id === 0 ? "" : getDifficultyName(difficulty))}
      isOptionEqualToValue={(option, value) => {
        if (option?.id && value?.id) return option.id === value.id;
        return false;
      }}
      value={selectedDifficulty}
      onChange={(e, v) => onChangeDifficulty(v?.id)}
      noOptionsText={t("no_options")}
      loading={query.isLoading}
      loadingText={"Loading"}
      renderInput={(params) => (
        <TextField {...params} label={label ?? t(isSuggestion ? "label" : "label_no_opinion")} />
      )}
      renderOption={(props, difficulty) => {
        if (difficulty.id === 0) {
          return (
            <Stack direction="row" gap={1} {...props}>
              <em>{t(isSuggestion ? "no_suggestion" : "no_selection")}</em>
            </Stack>
          );
        }
        return (
          <Stack direction="row" gap={1} {...props}>
            <span>{getDifficultyName(difficulty)}</span>
            <span style={{ fontSize: "0.7em" }}>{getOldName(difficulty.id)}</span>
          </Stack>
        );
      }}
    />
  );
}

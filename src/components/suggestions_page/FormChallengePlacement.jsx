import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { Button, Chip, Divider, Grid, Stack, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";

import { getQueryData, useGetChallenge, usePostSuggestion } from "../../hooks/useApi";
import { ErrorDisplay, LoadingSpinner } from "../basic";
import { DifficultyChip, DifficultySelectControlled, FullChallengeSelect } from "../goldberries";
import { DIFFICULTIES } from "../../util/constants";
import { CharsCountLabel, DifficultyMoveDisplay } from "../../pages/Suggestions";
import { BackButton, ChallengeDetailsDisplay } from "./CreateSuggestionModal";

export function ChallengePlacementSuggestionForm({ onSuccess, onBack }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.create" });
  const { t: t_a } = useTranslation();
  const { mutate: postSuggestion, isLoading: postSuggestionLoading } = usePostSuggestion(() => {
    toast.success(t("feedback.created"));
    if (onSuccess) onSuccess();
  });

  const form = useForm({
    defaultValues: {
      challenge: null,
      suggested_difficulty_id: null,
      comment: "",
    },
  });

  const selectedChallenge = form.watch("challenge");
  const selectedDifficulty = form.watch("suggested_difficulty_id");
  const comment = form.watch("comment");
  const isDisabled = selectedChallenge === null || selectedDifficulty === null;

  const query = useGetChallenge(selectedChallenge?.id);
  const fetchedChallenge = getQueryData(query);

  const onSubmit = form.handleSubmit((data) => {
    postSuggestion({
      challenge_id: data.challenge?.id,
      suggested_difficulty_id: data.suggested_difficulty_id,
      comment: data.comment,
    });
  });

  return (
    <>
      <Grid item xs={12}>
        <Divider>
          <Chip label={t("select_challenge")} size="small" />
        </Divider>
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="challenge"
          control={form.control}
          render={({ field }) => (
            <FullChallengeSelect challenge={field.value} setChallenge={(c) => field.onChange(c)} />
          )}
        />
      </Grid>

      {query.isLoading && <LoadingSpinner />}
      {query.isError && <ErrorDisplay error={query.error} />}

      {selectedChallenge !== null && (
        <>
          <Grid item xs={12}>
            <Divider>
              <Chip label={t("suggested_placement")} size="small" />
            </Divider>
          </Grid>
          {fetchedChallenge && (
            <Grid item xs={12}>
              <Stack direction="row" gap={2} alignItems="center">
                <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                  {t("current_difficulty")}:
                </Typography>
                <DifficultyChip difficulty={fetchedChallenge.difficulty} />
              </Stack>
            </Grid>
          )}
          <Grid item xs={12}>
            <Controller
              name="suggested_difficulty_id"
              control={form.control}
              render={({ field }) => (
                <DifficultySelectControlled
                  label={t_a("components.difficulty_select.label")}
                  fullWidth
                  isSuggestion
                  difficultyId={field.value}
                  setDifficultyId={(d) => field.onChange(d)}
                />
              )}
            />
          </Grid>
          {fetchedChallenge && selectedDifficulty && (
            <Grid item xs={12}>
              <DifficultyMoveDisplay
                from={fetchedChallenge.difficulty}
                to={
                  DIFFICULTIES[selectedDifficulty]
                    ? { id: selectedDifficulty, ...DIFFICULTIES[selectedDifficulty] }
                    : null
                }
              />
            </Grid>
          )}
        </>
      )}

      {fetchedChallenge !== null && <ChallengeDetailsDisplay challenge={fetchedChallenge} t={t} />}

      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t("comment.label")}
          placeholder={t("comment.placeholder")}
          multiline
          minRows={3}
          variant="outlined"
          {...form.register("comment")}
        />
        <CharsCountLabel text={comment} maxChars={1000} />
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" gap={1} justifyContent="space-between">
          <BackButton onBack={onBack} />
          <Button
            variant="contained"
            color="primary"
            onClick={onSubmit}
            disabled={isDisabled || postSuggestionLoading}
          >
            {t("button")}
          </Button>
        </Stack>
      </Grid>
    </>
  );
}

import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import { Controller, useForm } from "react-hook-form";
import { Button, Chip, Divider, FormHelperText, Grid, Stack, TextField } from "@mui/material";
import { toast } from "react-toastify";

import { getQueryData, useGetChallenge, usePostSuggestion } from "../../hooks/useApi";
import { ErrorDisplay, LoadingSpinner } from "../basic";
import { FullChallengeSelect } from "../goldberries";
import { CharsCountLabel } from "../../pages/Suggestions";

import { BackButton, ChallengeDetailsDisplay } from "./CreateSuggestionModal";

export function ChallengeGeneralSuggestionForm({ onSuccess, onBack }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.create" });
  const theme = useTheme();
  const { mutate: postSuggestion, isLoading: postSuggestionLoading } = usePostSuggestion(() => {
    toast.success(t("feedback.created"));
    if (onSuccess) onSuccess();
  });

  const form = useForm({
    defaultValues: {
      challenge: null,
      comment: "",
    },
  });

  const selectedChallenge = form.watch("challenge");
  const comment = form.watch("comment");
  const isDisabled = selectedChallenge === null || comment.length < 10;

  const query = useGetChallenge(selectedChallenge?.id);
  const fetchedChallenge = getQueryData(query);

  const onSubmit = form.handleSubmit((data) => {
    postSuggestion({
      challenge_id: data.challenge?.id,
      suggested_difficulty_id: null,
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
      {fetchedChallenge !== null && <ChallengeDetailsDisplay challenge={fetchedChallenge} t={t} />}

      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t("comment.label")}
          placeholder={t("comment.placeholder")}
          required
          multiline
          minRows={3}
          variant="outlined"
          {...form.register("comment")}
        />
        <CharsCountLabel text={comment} maxChars={1000} minChars={10} />
        {comment.length < 10 && (
          <FormHelperText sx={{ color: theme.palette.error.main }}>{t("comment.required")}</FormHelperText>
        )}
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

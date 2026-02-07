import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";

import { getQueryData, useGetChallenge, usePostSuggestion } from "../../hooks/useApi";
import { ErrorDisplay, LoadingSpinner } from "../basic";
import { DifficultyChip, DifficultySelectControlled, FullChallengeSelect } from "../goldberries";
import { DIFFICULTIES } from "../../util/constants";
import { CharsCountLabel } from "../../pages/Suggestions";
import { BackButton, ChallengeDetailsDisplay } from "./CreateSuggestionModal";

export function ChallengeSplitSuggestionForm({ onSuccess, onBack }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.create" });
  const theme = useTheme();
  const { mutate: postSuggestion, isLoading: postSuggestionLoading } = usePostSuggestion(() => {
    toast.success(t("feedback.created"));
    if (onSuccess) onSuccess();
  });

  const form = useForm({
    defaultValues: {
      challenge: null,
      split_type: "c", // "c" or "fc"
      split_difficulty_id: null,
      comment: "",
    },
  });

  const selectedChallenge = form.watch("challenge");
  const splitType = form.watch("split_type");
  const splitDifficultyId = form.watch("split_difficulty_id");
  const comment = form.watch("comment");

  const query = useGetChallenge(selectedChallenge?.id);
  const fetchedChallenge = getQueryData(query);

  // Determine if the challenge is a combined C/FC challenge (has_fc = true means it can be split)
  const isCombinedChallenge = fetchedChallenge?.has_fc === true;
  const currentDifficulty = fetchedChallenge?.difficulty;

  // Check if selected difficulty is the same as current
  const isSameDifficulty = splitDifficultyId !== null && currentDifficulty?.id === splitDifficultyId;

  const isDisabled =
    selectedChallenge === null || splitDifficultyId === null || !isCombinedChallenge || isSameDifficulty;

  const onSubmit = form.handleSubmit((data) => {
    // Get difficulty names for the prefix
    const splitDifficultyName =
      DIFFICULTIES[data.split_difficulty_id]?.name || `ID ${data.split_difficulty_id}`;
    const currentDifficultyName = currentDifficulty?.name || "current";

    // Always keep C on the left and FC on the right in the prefix
    const cDifficulty = data.split_type === "c" ? splitDifficultyName : currentDifficultyName;
    const fcDifficulty = data.split_type === "fc" ? splitDifficultyName : currentDifficultyName;

    // Hardcoded English prefix since it's sent to the server
    const splitPrefix = `SPLIT: This is a suggestion to split the challenge: C → ${cDifficulty} | FC → ${fcDifficulty}`;

    const fullComment = data.comment.trim() ? `${splitPrefix}\n\n${data.comment}` : splitPrefix;

    postSuggestion({
      challenge_id: data.challenge?.id,
      suggested_difficulty_id: null,
      comment: fullComment,
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

      {fetchedChallenge !== null && !isCombinedChallenge && (
        <Grid item xs={12}>
          <FormHelperText sx={{ color: theme.palette.error.main }}>
            {t("split_error_not_combined")}
          </FormHelperText>
        </Grid>
      )}

      {fetchedChallenge !== null && isCombinedChallenge && (
        <>
          <Grid item xs={12}>
            <Divider>
              <Chip label={t("split_details")} size="small" />
            </Divider>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" gap={2} alignItems="center">
              <Typography variant="body2">{t("current_difficulty")}:</Typography>
              <DifficultyChip difficulty={currentDifficulty} />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Controller
                name="split_type"
                control={form.control}
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value="c">C (Clear)</MenuItem>
                    <MenuItem value="fc">FC (Full Clear)</MenuItem>
                  </Select>
                )}
              />
              <FormHelperText>{t("split_type_help")}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="split_difficulty_id"
              control={form.control}
              render={({ field }) => (
                <DifficultySelectControlled
                  label={t("split_difficulty_label")}
                  fullWidth
                  isSuggestion
                  difficultyId={field.value}
                  setDifficultyId={(d) => field.onChange(d)}
                />
              )}
            />
            {isSameDifficulty && (
              <FormHelperText sx={{ color: theme.palette.error.main }}>
                {t("split_error_same_difficulty")}
              </FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <SplitPreview
              splitType={splitType}
              splitDifficultyId={splitDifficultyId}
              currentDifficulty={currentDifficulty}
            />
          </Grid>
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
          placeholder={t("split_comment_placeholder")}
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

function SplitPreview({ splitType, splitDifficultyId, currentDifficulty }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.create" });
  const theme = useTheme();

  if (!splitDifficultyId) return null;

  // Create a difficulty object from the ID
  const splitDifficulty = DIFFICULTIES[splitDifficultyId]
    ? { id: splitDifficultyId, ...DIFFICULTIES[splitDifficultyId] }
    : null;

  // Always keep C on the left and FC on the right
  const cDifficulty = splitType === "c" ? splitDifficulty : currentDifficulty;
  const fcDifficulty = splitType === "fc" ? splitDifficulty : currentDifficulty;

  return (
    <Box sx={{ p: 1.5, backgroundColor: theme.palette.action.hover, borderRadius: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
        {t("split_preview")}:
      </Typography>
      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
        <Typography variant="body2">C:</Typography>
        <DifficultyChip difficulty={cDifficulty} />
        <Typography variant="body2">|</Typography>
        <Typography variant="body2">FC:</Typography>
        <DifficultyChip difficulty={fcDifficulty} />
      </Stack>
    </Box>
  );
}

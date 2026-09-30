import { Trans, useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { Button, Chip, Divider, Grid, Stack, TextField, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faCheck, faMinus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import { getQueryData, useGetChallenge, useGetLastPlacementSuggestion, usePostSuggestion } from "../../hooks/useApi";
import { ErrorDisplay, LoadingSpinner, StyledLink } from "../basic";
import { DifficultyChip, DifficultySelectControlled, FullChallengeSelect } from "../goldberries";
import { DIFFICULTIES } from "../../util/constants";
import { dateToTimeAgoString, jsonDateToJsDate } from "../../util/util";
import { CharsCountLabel, DifficultyMoveDisplay, isSuggestionExpired } from "../../pages/Suggestions";

import { BackButton, ChallengeDetailsDisplay } from "./CreateSuggestionModal";

export function ChallengePlacementSuggestionForm({ onSuccess, onBack }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.create" });
  const { t: t_a } = useTranslation();
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
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
  const lastPlacementSuggestionQuery = useGetLastPlacementSuggestion(selectedChallenge?.id);
  const lastPlacementSuggestion = getQueryData(lastPlacementSuggestionQuery);
  const lastSuggestionStatus =
    lastPlacementSuggestion?.is_accepted === true
      ? "accepted"
      : lastPlacementSuggestion?.is_accepted === false
        ? "rejected"
        : "undecided";
  const lastSuggestionStatusColor = {
    accepted: "success.main",
    rejected: "error.main",
    undecided: "text.secondary",
  }[lastSuggestionStatus];
  const lastSuggestionVotes = lastPlacementSuggestion?.votes ?? [];
  const lastSuggestionVoteCounts = {
    for: lastSuggestionVotes.filter((vote) => vote.vote === "+").length,
    against: lastSuggestionVotes.filter((vote) => vote.vote === "-").length,
    indifferent: lastSuggestionVotes.filter((vote) => vote.vote === "i").length,
  };

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
      {selectedChallenge !== null && (
        <Grid item xs={12}>
          {lastPlacementSuggestionQuery.isFetching ? (
            <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
              <FontAwesomeIcon icon={faSpinner} spin /> {t("checking_challenge")}
            </Typography>
          ) : lastPlacementSuggestionQuery.isError ? (
            <Typography variant="body2" color="error">
              {t("last_suggestion_error")}
            </Typography>
          ) : lastPlacementSuggestion === null ? (
            <Typography variant="body2" color="success.main" sx={{ whiteSpace: "nowrap" }}>
              <FontAwesomeIcon icon={faCheck} /> {t("no_prior_suggestions")}
            </Typography>
          ) : isSuggestionExpired(lastPlacementSuggestion) ? (
            <Typography
              component="div"
              variant="body2"
              sx={{ display: "flex", alignItems: "center", whiteSpace: "pre" }}
            >
              <Trans
                t={t}
                i18nKey="last_suggestion_with_votes"
                values={{
                  ...lastSuggestionVoteCounts,
                  timeAgo: dateToTimeAgoString(jsonDateToJsDate(lastPlacementSuggestion.date_created), t_g),
                  status: t(`last_suggestion_status.${lastSuggestionStatus}`),
                }}
                components={{
                  suggestionLink: (
                    <StyledLink
                      to={`/suggestions/${lastPlacementSuggestion.id}`}
                      target="_blank"
                      rel="noreferrer"
                    />
                  ),
                  upIcon: <FontAwesomeIcon icon={faArrowUp} />,
                  downIcon: <FontAwesomeIcon icon={faArrowDown} />,
                  indifferentIcon: <FontAwesomeIcon icon={faMinus} />,
                  difficultyMove: (
                    <DifficultyMoveDisplay
                      from={lastPlacementSuggestion.current_difficulty}
                      to={lastPlacementSuggestion.suggested_difficulty}
                    />
                  ),
                  status: <Typography component="span" variant="body2" color={lastSuggestionStatusColor} />,
                }}
              />
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
              <Trans
                t={t}
                i18nKey="ongoing_suggestion"
                components={{
                  suggestionLink: (
                    <StyledLink
                      to={`/suggestions/${lastPlacementSuggestion.id}`}
                      target="_blank"
                      rel="noreferrer"
                    />
                  ),
                }}
              />
            </Typography>
          )}
        </Grid>
      )}

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

import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import { Grid, IconButton, Pagination, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useDebounce } from "@uidotdev/usehooks";
import Color from "color";

import { getQueryData, useGetSuggestions } from "../../hooks/useApi";
import { useAuth } from "../../hooks/AuthProvider";
import { BasicBox, ErrorDisplay, HeadTitle, LoadingSpinner } from "../../components/BasicComponents";
import { DifficultyChip, OtherIcon, PlayerChip } from "../../components/GoldberriesComponents";
import { dateToTimeAgoString, jsonDateToJsDate } from "../../util/util";
import { getSortedSuggestedDifficulties } from "../../util/data_util";
import { VotesBar } from "../../components/VotesBar";
import { DifficultyMoveDisplay, SuggestionCommentDisplay, SuggestionName } from "./Suggestions";

export function SuggestionsList({
  expired,
  defaultPerPage,
  modalRefs,
  filterType,
  tab = null,
  search = null,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);

  const query = useGetSuggestions(page, perPage, expired, null, filterType, search);

  useEffect(() => {
    setPage(1);
  }, [filterType, tab, search]);

  if (query.isLoading) {
    return <LoadingSpinner sx={{ mt: 1 }} />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const response = getQueryData(query);
  const { suggestions, max_page, max_count } = response;

  return (
    <Stack direction="column" gap={2}>
      {expired === false && <HeadTitle title={t("title")} />}
      <Grid container alignItems="center" sx={{ mt: 1 }}>
        <Grid item xs={12} sm="auto">
          <Typography variant="body2" color="text.secondary">
            {t("showing", {
              from: max_count === 0 ? 0 : (page - 1) * perPage + 1,
              to: (page - 1) * perPage + suggestions.length,
              count: max_count,
            })}
          </Typography>
        </Grid>
        <Grid item xs={12} sm>
          <Pagination count={max_page} page={page} onChange={(e, value) => setPage(value)} />
        </Grid>
      </Grid>
      {suggestions.map((suggestion) => (
        <SuggestionDisplay
          key={suggestion.id}
          suggestion={suggestion}
          expired={expired}
          modalRefs={modalRefs}
        />
      ))}
    </Stack>
  );
}

export const SuggestionsSearch = memo(function SuggestionsSearch({ search, setSearch }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions" });
  const [localSearch, setLocalSearch] = useState(search);
  const localSearchDebounced = useDebounce(localSearch, 500);

  useEffect(() => {
    if (localSearch !== search) {
      setSearch(localSearch);
    }
  }, [localSearchDebounced]);

  return (
    <TextField
      label={t("search")}
      value={localSearch}
      onChange={(e) => setLocalSearch(e.target.value)}
      fullWidth
      size="small"
      sx={{ mt: 1 }}
    />
  );
});

function SuggestionDisplay({ suggestion, expired, modalRefs }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.display" });
  const { t: t_sv } = useTranslation(undefined, { keyPrefix: "suggestions.votes" });
  const theme = useTheme();
  const auth = useAuth();

  const viewSuggestion = () => {
    modalRefs.view.current(suggestion.id);
  };
  const askDeleteSuggestion = (e) => {
    e.stopPropagation();
    modalRefs.delete.current.open(suggestion);
  };

  const canDelete =
    auth.hasHelperPriv ||
    (suggestion.author_id !== null &&
      auth.user?.player_id === suggestion.author_id &&
      suggestion.is_verified !== true);

  const isGeneral = suggestion.challenge_id === null;
  const votesSubmission = suggestion.votes.filter((vote) => vote.submission !== null);
  const votesNoSubmission = suggestion.votes.filter((vote) => vote.submission === null);

  let acceptedColor =
    suggestion.is_accepted === null
      ? new Color(theme.palette.box.border).alpha(0.25).string()
      : suggestion.is_accepted
        ? theme.palette.success.main
        : theme.palette.error.main;
  const borderWidth = suggestion.is_accepted === null ? "1px" : "3px";
  const unverified = suggestion.is_verified !== true;

  const difficultiesSorted =
    suggestion.challenge_id !== null ? getSortedSuggestedDifficulties(suggestion.challenge) : [];
  const difficultiesCountTotal = difficultiesSorted ? difficultiesSorted.reduce((a, b) => a + b.value, 0) : 0;

  const didChallengeTooltip = t_sv("did_challenge");
  const othersTooltip = t_sv("others");

  return (
    <BasicBox
      sx={{
        width: "100%",
        borderColor: acceptedColor,
        borderWidth: borderWidth,
        cursor: "pointer",
        transition: "background 0.3s",
        "&:hover": {
          background: theme.palette.box.hover,
        },
        background: unverified ? theme.palette.errorBackground : theme.palette.background.other,
      }}
      onClick={viewSuggestion}
    >
      <Grid container sx={{ mb: 0 }}>
        <Grid item xs={12} sm>
          <SuggestionName suggestion={suggestion} expired={expired} />
        </Grid>
        {canDelete && (
          <Grid item xs={12} sm="auto">
            <IconButton color="error" onClick={askDeleteSuggestion} size="small">
              <FontAwesomeIcon icon={faTrash} />
            </IconButton>
          </Grid>
        )}
      </Grid>

      {suggestion.challenge !== null && suggestion.suggested_difficulty !== null && (
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          flexWrap={{ xs: "wrap", sm: "unset" }}
          sx={{ mb: 0.5 }}
        >
          <DifficultyMoveDisplay from={suggestion.current_difficulty} to={suggestion.suggested_difficulty} />
          {difficultiesSorted.length > 0 && (
            <Stack direction="row" gap={1}>
              ( {((difficultiesSorted[0].value / difficultiesCountTotal) * 100).toFixed(0)}%{" "}
              {difficultiesSorted.map((d, index) => {
                if (d.value !== difficultiesSorted[0].value) return null;
                return (
                  <>
                    {index > 0 && <span key={"k2" + d.difficulty.id}> / </span>}
                    <DifficultyChip key={"k1" + d.difficulty.id} difficulty={d.difficulty} />
                  </>
                );
              })}
              )
            </Stack>
          )}
        </Stack>
      )}

      <Grid container sx={{ mb: 1 }}>
        <Grid item xs={12} sm={12}>
          <Grid container columnSpacing={0.5}>
            <Grid item xs={12} sm>
              <Typography variant="body2" sx={{ mt: 0.25, overflowWrap: "anywhere" }}>
                <SuggestionCommentDisplay comment={suggestion.comment} />
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            sx={{ mt: 0.5, color: theme.palette.text.secondary }}
          >
            <Typography variant="body2">
              {suggestion.author_id === null ? (
                t("deleted_player")
              ) : (
                <PlayerChip player={suggestion.author} size="small" />
              )}
            </Typography>
            <Typography variant="body2">&middot;</Typography>
            <Typography variant="body2">
              <Tooltip
                title={jsonDateToJsDate(suggestion.date_created).toLocaleString(navigator.language)}
                arrow
                placement="top"
              >
                <span>{dateToTimeAgoString(jsonDateToJsDate(suggestion.date_created))}</span>
              </Tooltip>
            </Typography>
          </Stack>
        </Grid>
      </Grid>

      {suggestion.votes.length === 0 ? (
        <Typography variant="body2">{t("no_votes")}</Typography>
      ) : (
        <Grid container columnSpacing={1} rowSpacing={0.5}>
          {!isGeneral && (
            <>
              <Grid item xs={12} sm={12}>
                <Stack direction="row" gap={0.5} alignItems="center">
                  <OtherIcon
                    url={"/icons/golden-icon.png"}
                    title={didChallengeTooltip}
                    hideOutline
                    style={{ filter: "brightness(100%)" }}
                  />
                  <VotesDisplay votes={votesSubmission} hasSubmission={true} />
                </Stack>
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={isGeneral ? 12 : 12}>
            <Stack direction="row" gap={0.5} alignItems="center">
              {!isGeneral && (
                <OtherIcon
                  url={"/icons/golden-icon-slashed.png"}
                  title={othersTooltip}
                  hideOutline
                  style={{ filter: "brightness(100%)" }}
                />
              )}
              <VotesDisplay votes={votesNoSubmission} hasSubmission={false} />
            </Stack>
          </Grid>
        </Grid>
      )}
    </BasicBox>
  );
}

function VotesDisplay({ votes, hasSubmission, style = {} }) {
  const auth = useAuth();

  const countFor = votes.filter((vote) => vote.vote === "+").length;
  const votedFor =
    auth.hasPlayerClaimed &&
    votes.some((vote) => vote.vote === "+" && vote.player_id === auth.user.player_id);
  const countAgainst = votes.filter((vote) => vote.vote === "-").length;
  const votedAgainst =
    auth.hasPlayerClaimed &&
    votes.some((vote) => vote.vote === "-" && vote.player_id === auth.user.player_id);
  const countIndifferent = votes.filter((vote) => vote.vote === "i").length;
  const votedIndifferent =
    auth.hasPlayerClaimed &&
    votes.some((vote) => vote.vote === "i" && vote.player_id === auth.user.player_id);

  const ownVoteType = votedFor ? "for" : votedAgainst ? "against" : votedIndifferent ? "indifferent" : null;

  return (
    <VotesBar
      size="small"
      votesFor={countFor}
      votesAgainst={countAgainst}
      votesIndifferent={countIndifferent}
      ownVoteType={ownVoteType}
      style={style}
    />
  );
}

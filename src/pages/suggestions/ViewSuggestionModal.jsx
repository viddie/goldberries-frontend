import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faComment,
  faEquals,
  faHorse,
  faInfoCircle,
  faQuestion,
  faSpinner,
  faThumbsDown,
  faThumbsUp,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import {
  getQueryData,
  useDeleteSuggestionVote,
  useGetSuggestion,
  usePostSuggestion,
  usePostSuggestionVote,
} from "../../hooks/useApi";
import { useAuth } from "../../hooks/AuthProvider";
import {
  CustomizedMenu,
  ErrorDisplay,
  LoadingSpinner,
  TooltipLineBreaks,
} from "../../components/BasicComponents";
import { DifficultyChip, PlayerChip } from "../../components/GoldberriesComponents";
import { SuggestedDifficultyChart, SuggestedDifficultyTierCounts } from "../../components/Stats";
import { ChallengeSubmissionTable } from "../Challenge";
import { getChallengeNameShort } from "../../util/data_util";
import { toast } from "react-toastify";
import {
  CharsCountLabel,
  DifficultyMoveDisplay,
  SuggestionCommentDisplay,
  SuggestionName,
} from "./Suggestions";
import { CustomMenu } from "../../components/Menu";

export function ViewSuggestionModal({ id }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.view" });
  const { t: t_s } = useTranslation(undefined, { keyPrefix: "suggestions" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const auth = useAuth();
  const [userText, setUserText] = useState("");

  const query = useGetSuggestion(id);
  const suggestion = getQueryData(query);

  const { mutateAsync: deleteVote } = useDeleteSuggestionVote(() => {
    // query.refetch();
  });
  const { mutateAsync: postVote } = usePostSuggestionVote(() => {
    query.refetch();
  });
  const { mutate: postSuggestion, isLoading: postSuggestionLoading } = usePostSuggestion(() => {
    query.refetch();
    toast.success(t("feedback.updated"));
  });

  useEffect(() => {
    if (query.isSuccess) {
      //Find the users vote
      const userVote = !auth.hasPlayerClaimed
        ? null
        : suggestion.votes.find((vote) => vote.player_id === auth.user.player.id);
      if (userVote) {
        setUserText(userVote.comment ?? "");
      } else {
        setUserText("");
      }
    }
  }, [query.isSuccess]);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const dateCreated = new Date(suggestion.date_created);
  const isExpired =
    suggestion.is_accepted !== null || dateCreated < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const isGeneral = suggestion.challenge_id === null;
  const challenge = suggestion.challenge;
  const hasMap = challenge?.map_id;

  const hasVoted =
    auth.hasPlayerClaimed && suggestion.votes.some((vote) => vote.player_id === auth.user.player.id);
  const userVote = hasVoted
    ? suggestion.votes.find((vote) => vote.player_id === auth.user.player.id).vote
    : null;
  const selfHasDoneChallenge =
    auth.hasPlayerClaimed &&
    suggestion.challenge !== null &&
    challenge.submissions.some((s) => s.player_id === auth.user.player_id);
  const isPlacementSuggestion = suggestion.suggested_difficulty_id !== null;
  const requiresComment = !selfHasDoneChallenge && isPlacementSuggestion;
  const voteButtonsDisabled =
    (!auth.hasPlayerClaimed ||
      (isExpired && !auth.hasHelperPriv) ||
      (requiresComment && userText.trim().length < 10)) &&
    !hasVoted;

  const vote = (vote) => {
    if (hasVoted) {
      const voteObj = suggestion.votes.find((vote) => vote.player_id === auth.user.player.id);
      deleteVote(voteObj.id).then(() => {
        if (vote !== userVote) {
          postVote({
            suggestion_id: suggestion.id,
            vote: vote,
            comment: userText === "" ? null : userText,
          });
        } else {
          //Refetch manually
          query.refetch();
        }
      });
      return;
    } else {
      postVote({
        suggestion_id: suggestion.id,
        vote: vote,
        comment: userText === "" ? null : userText,
      });
    }
  };

  const isUnverified = suggestion.is_verified !== true;
  const updateSuggestion = (accept) => {
    if (isUnverified) {
      postSuggestion({
        ...suggestion,
        is_verified: accept,
      });
    } else {
      postSuggestion({
        ...suggestion,
        is_accepted: suggestion.is_accepted === accept ? null : accept,
      });
    }
  };

  const modifyItems = [];
  const loadingSpinner = <FontAwesomeIcon icon={faSpinner} size="lg" spin />;
  if (suggestion.is_accepted === null) {
    modifyItems.push({
      icon: postSuggestionLoading ? loadingSpinner : faCheck,
      text: t(isUnverified ? "buttons.verify" : "buttons.accept"),
      onClick: () => updateSuggestion(true),
      color: "success",
      disabled: postSuggestionLoading,
      keepOpen: true,
    });
    modifyItems.push({
      icon: postSuggestionLoading ? loadingSpinner : faXmark,
      text: t(isUnverified ? "buttons.reject_verification" : "buttons.reject_change"),
      onClick: () => updateSuggestion(false),
      color: "error",
      disabled: postSuggestionLoading,
      keepOpen: true,
    });
  } else {
    modifyItems.push({
      icon: postSuggestionLoading ? loadingSpinner : faQuestion,
      text: "Set to Pending",
      onClick: () => updateSuggestion(null),
      disabled: postSuggestionLoading,
      keepOpen: true,
    });
  }

  let highlightedPlayers = {};
  if (!isGeneral && hasMap) {
    //Go through the other challenges in the map and construct an array of players that associate to the challenges/submissions of the related challenges
    highlightedPlayers = {};
    challenge.map.challenges.forEach((challenge) => {
      challenge.submissions.forEach((submission) => {
        if (highlightedPlayers[submission.player_id] !== undefined) return;
        highlightedPlayers[submission.player_id] = {
          player: submission.player,
          submission: submission,
          challenge: challenge,
        };
      });
    });
  }

  let relatedChallenges = [];
  if (suggestion.challenge_id !== null) {
    const challenge = suggestion.challenge;
    if (challenge.map_id !== null) {
      relatedChallenges = challenge.map.challenges;
    } else if (challenge.campaign_id !== null) {
      relatedChallenges = challenge.campaign.challenges;
    }
  }

  return (
    <>
      <Grid container rowSpacing={1.5} columnSpacing={1}>
        <Grid item xs={12} sm>
          <SuggestionName suggestion={suggestion} expired={isExpired} />
        </Grid>
        {auth.hasHelperPriv && (
          <Grid item xs={12} sm="auto">
            <CustomMenu title="Modify" variant="outlined" items={modifyItems} />
          </Grid>
        )}
        {suggestion.challenge !== null && suggestion.suggested_difficulty !== null && (
          <Grid item xs={12}>
            <DifficultyMoveDisplay
              from={suggestion.current_difficulty}
              to={suggestion.suggested_difficulty}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Grid container columnSpacing={0.5}>
            <Grid item xs={12} sm="auto">
              <Typography variant="body2">
                {suggestion.author_id === null ? (
                  t_s("display.deleted_player")
                ) : (
                  <PlayerChip player={suggestion.author} size="small" />
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm>
              <Typography variant="body2" sx={{ mt: 0.25, overflowWrap: "anywhere" }}>
                <FontAwesomeIcon icon={faComment} /> <SuggestionCommentDisplay comment={suggestion.comment} />
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="column" gap={0.25}>
            <Stack direction="row" gap={0.5}>
              <Button
                variant={!auth.hasPlayerClaimed || !hasVoted || userVote !== "+" ? "outlined" : "contained"}
                color="success"
                fullWidth
                onClick={() => vote("+")}
                disabled={voteButtonsDisabled}
              >
                <FontAwesomeIcon icon={faThumbsUp} style={{ height: "1.4em" }} />
                <Box component="span" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  {t_s("votes.for")}
                </Box>
              </Button>
              <Button
                variant={!auth.hasPlayerClaimed || !hasVoted || userVote !== "-" ? "outlined" : "contained"}
                color="error"
                fullWidth
                onClick={() => vote("-")}
                disabled={voteButtonsDisabled}
              >
                <FontAwesomeIcon icon={faThumbsDown} style={{ height: "1.4em" }} />
                <Box component="span" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  {t_s("votes.against")}
                </Box>
              </Button>
              <Button
                variant={!auth.hasPlayerClaimed || !hasVoted || userVote !== "i" ? "outlined" : "contained"}
                fullWidth
                onClick={() => vote("i")}
                disabled={voteButtonsDisabled}
              >
                <FontAwesomeIcon icon={faHorse} style={{ height: "1.4em" }} />
                <Box component="span" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  {t_s("votes.indifferent")}
                </Box>
              </Button>
            </Stack>
            {!auth.hasPlayerClaimed && (
              <Typography variant="body2" gutterBottom>
                {t("claim_player")}
              </Typography>
            )}
          </Stack>
        </Grid>
        {auth.hasPlayerClaimed && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("your_comment")}
              multiline
              minRows={3}
              variant="outlined"
              disabled={hasVoted}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
            />
            <Stack direction="row" gap={1} alignItems="center">
              <CharsCountLabel text={userText} maxChars={1500} minChars={10} />
              {requiresComment && userText.trim().length < 10 && (
                <Typography variant="body2" color={(t) => t.palette.error.main} sx={{}}>
                  <FontAwesomeIcon icon={faInfoCircle} /> {t("comment_required")}
                </Typography>
              )}
            </Stack>
            <Typography variant="body2" color={(t) => t.palette.text.secondary} sx={{ mt: 0.25 }}>
              <FontAwesomeIcon icon={faInfoCircle} /> {t("comment_note")}
            </Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Divider>
            <Chip label={t_s("votes.label")} size="small" />
          </Divider>
        </Grid>
        {!isGeneral && (
          <>
            <Grid item xs={12} sm={12}>
              <Typography variant="body1">{t("done_challenge")}</Typography>
              <Grid container columnSpacing={1}>
                <Grid item xs={12} sm={4}>
                  <VotesDetailsDisplay votes={suggestion.votes} voteType="+" hasSubmission={true} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <VotesDetailsDisplay votes={suggestion.votes} voteType="-" hasSubmission={true} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <VotesDetailsDisplay votes={suggestion.votes} voteType="i" hasSubmission={true} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </>
        )}
        <Grid item xs={12} sm={12}>
          {!isGeneral && <Typography variant="body1">{t("not_done_challenge")}</Typography>}
          <Grid container columnSpacing={1}>
            <Grid item xs={12} sm={4}>
              <VotesDetailsDisplay
                votes={suggestion.votes}
                voteType="+"
                hasSubmission={false}
                highlightedPlayers={highlightedPlayers}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <VotesDetailsDisplay
                votes={suggestion.votes}
                voteType="-"
                hasSubmission={false}
                highlightedPlayers={highlightedPlayers}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <VotesDetailsDisplay
                votes={suggestion.votes}
                voteType="i"
                hasSubmission={false}
                highlightedPlayers={highlightedPlayers}
              />
            </Grid>
          </Grid>
        </Grid>

        {suggestion.challenge_id !== null && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ mt: 2 }}>
                <Chip label={t("stats")} size="small" />
              </Divider>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Stack direction="row" justifyContent="space-around">
                <SuggestedDifficultyChart challenge={suggestion.challenge} scale={0.75} />
              </Stack>
            </Grid>
            <Grid item xs={12} sm>
              <Divider orientation="vertical" />
            </Grid>
            <Grid item xs={12} sm>
              <Typography variant="body1" gutterBottom>
                {t("totals")}
              </Typography>
              <SuggestedDifficultyTierCounts challenge={suggestion.challenge} direction="column" stackGrid />
            </Grid>
            <Grid item xs={12}>
              <Divider>
                <Chip label={t_g("submission", { count: 30 })} size="small" />
              </Divider>
            </Grid>
            <Grid item xs={12}>
              <ChallengeSubmissionTable challenge={suggestion.challenge} onlyShowFirstFew />
            </Grid>
            {relatedChallenges.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Divider>
                    <Chip label={t("related_challenges", { count: 30 })} size="small" />
                  </Divider>
                </Grid>
                {relatedChallenges.map((challenge) => (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="body1">{getChallengeNameShort(challenge)}</Typography>
                      <ChallengeSubmissionTable challenge={challenge} onlyShowFirstFew />
                    </Grid>
                  </>
                ))}
              </>
            )}
          </>
        )}
      </Grid>
    </>
  );
}

function VotesDetailsDisplay({ votes, voteType, hasSubmission, highlightedPlayers = {} }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.votes" });
  const votesFiltered = votes.filter(
    (vote) => vote.vote === voteType && (hasSubmission ? vote.submission !== null : vote.submission === null),
  );
  const count = votesFiltered.length;
  const voteIcon = voteType === "+" ? faThumbsUp : voteType === "-" ? faThumbsDown : faEquals;
  const voteColor = voteType === "+" ? "green" : voteType === "-" ? "red" : "gray";

  return (
    <Stack direction="column" gap={1} alignItems="center">
      <Typography variant="body1">
        <FontAwesomeIcon icon={voteIcon} color={voteColor} />
      </Typography>
      <Typography variant="body2">{t("count", { count: count })}</Typography>
      <Stack direction="row" columnGap={2} rowGap={0.5} flexWrap="wrap">
        {votesFiltered.map((vote) => {
          const player = vote.player;
          const isHighlighted = highlightedPlayers[player.id] !== undefined;
          const relatedChallenge = highlightedPlayers[player.id]?.challenge;
          return (
            <Stack direction="row" gap={0.5} alignItems="center">
              <PlayerChip
                player={player}
                size="small"
                className={isHighlighted ? "player-highlighted" : ""}
              />
              {isHighlighted && (
                <Tooltip
                  title={t("related_challenge", { challenge: getChallengeNameShort(relatedChallenge) })}
                  arrow
                  placement="top"
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                </Tooltip>
              )}
              {vote.comment && (
                <TooltipLineBreaks title={vote.comment}>
                  <FontAwesomeIcon icon={faComment} />
                </TooltipLineBreaks>
              )}
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}

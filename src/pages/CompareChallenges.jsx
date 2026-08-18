import { Box, Checkbox, FormControlLabel, Grid, Stack, Typography } from "@mui/material";
import { useLocalStorage } from "@uidotdev/usehooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { BasicContainerBox, ErrorDisplay, HeadTitle, LoadingSpinner } from "../components/basic";
import { ChallengeInline, FullChallengeSelect } from "../components/goldberries";
import { getQueryData, useGetChallenge } from "../hooks/useApi";
import { getChallengeCampaign, getGamebananaEmbedUrl, getMapName } from "../util/data_util";

import { ChallengeSubmissionTable, FadingMapBanner } from "./Challenge";

const mapBannerSx = {
  mb: 0,
  borderTopLeftRadius: 1,
  borderTopRightRadius: 1,
};

export function PageCompareChallenges() {
  const { t } = useTranslation(undefined, { keyPrefix: "compare_challenges" });
  const navigate = useNavigate();
  const { id_a, id_b } = useParams();
  const [onlyShowBoth, setOnlyShowBoth] = useLocalStorage("compare_challenges_only_show_both", false);
  const [matchOrder, setMatchOrder] = useLocalStorage("compare_challenges_match_order", true);

  const challengeAId = parseChallengeId(id_a);
  const challengeBId = parseChallengeId(id_b);
  const challengeAQuery = useGetChallenge(challengeAId);
  const challengeBQuery = useGetChallenge(challengeBId);
  const challengeA = getQueryData(challengeAQuery);
  const challengeB = getQueryData(challengeBQuery);

  const commonPlayerIds = useMemo(() => {
    if (challengeA === null || challengeB === null) return null;

    const challengeAPlayerIds = new Set(
      (challengeA.submissions ?? []).map((submission) => submission.player_id),
    );
    return new Set(
      (challengeB.submissions ?? [])
        .filter((submission) => challengeAPlayerIds.has(submission.player_id))
        .map((submission) => submission.player_id),
    );
  }, [challengeA, challengeB]);

  const displayedChallengeA = useMemo(
    () => getDisplayedChallenge(challengeA, onlyShowBoth ? commonPlayerIds : null),
    [challengeA, commonPlayerIds, onlyShowBoth],
  );
  const displayedChallengeB = useMemo(
    () =>
      getDisplayedChallenge(
        challengeB,
        onlyShowBoth ? commonPlayerIds : null,
        onlyShowBoth && matchOrder ? getSubmissionOrder(challengeA) : null,
      ),
    [challengeA, challengeB, commonPlayerIds, matchOrder, onlyShowBoth],
  );

  const updateSelectedChallenge = (slot, challenge) => {
    let nextChallengeAId = challengeAId;
    let nextChallengeBId = challengeBId;

    if (slot === "a") {
      nextChallengeAId = challenge?.id ?? null;
    } else {
      nextChallengeBId = challenge?.id ?? null;
    }

    // A URL with one ID always represents challenge A.
    if (nextChallengeAId === null && nextChallengeBId !== null) {
      nextChallengeAId = nextChallengeBId;
      nextChallengeBId = null;
    }

    navigate(getCompareChallengesPath(nextChallengeAId, nextChallengeBId), { replace: true });
  };

  const isLoading =
    (challengeAId && challengeAQuery.isLoading) || (challengeBId && challengeBQuery.isLoading);
  const hasBothChallenges = challengeA !== null && challengeB !== null;

  return (
    <BasicContainerBox
      maxWidth="lg"
      sx={{
        backgroundColor: "#282828",
        border: "none",
        p: 0,
        pt: 0,
        pb: 0,
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <HeadTitle title={t("title")} />
        <Typography variant="h4" textAlign="center" gutterBottom>
          {t("title")}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <FullChallengeSelect
              challenge={challengeA}
              setChallenge={(challenge) => updateSelectedChallenge("a", challenge)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={2}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Stack alignItems="center" justifyContent="center" gap={0.5}>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <FontAwesomeIcon icon={faArrowRightArrowLeft} />
              </Box>
              <Typography textAlign="center">{t("compare_to")}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={5}>
            <FullChallengeSelect
              challenge={challengeB}
              setChallenge={(challenge) => updateSelectedChallenge("b", challenge)}
            />
          </Grid>
        </Grid>

        {isLoading && <LoadingSpinner sx={{ mt: 2 }} />}
        {challengeAQuery.isError && <ErrorDisplay error={challengeAQuery.error} />}
        {challengeBQuery.isError && <ErrorDisplay error={challengeBQuery.error} />}

        {hasBothChallenges && (
          <>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <ChallengeSummary challenge={challengeA} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ChallengeSummary challenge={challengeB} />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  label={t("only_show_both")}
                  checked={onlyShowBoth}
                  onChange={(event) => setOnlyShowBoth(event.target.checked)}
                  control={<Checkbox />}
                />
              </Grid>
              {onlyShowBoth && (
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    label={t("match_order")}
                    checked={matchOrder}
                    onChange={(event) => setMatchOrder(event.target.checked)}
                    control={<Checkbox />}
                  />
                </Grid>
              )}
            </Grid>

            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <ChallengeSubmissionTable challenge={displayedChallengeA} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ChallengeSubmissionTable challenge={displayedChallengeB} />
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </BasicContainerBox>
  );
}

function ChallengeSummary({ challenge }) {
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);

  return (
    <Stack gap={1}>
      {map ? (
        <FadingMapBanner id={map.id} alt={getMapName(map, campaign, false)} size="large" sx={mapBannerSx} />
      ) : (
        <FadingMapBanner
          alt={campaign.name}
          src={getGamebananaEmbedUrl(campaign.url, "large")}
          size="large"
          sx={mapBannerSx}
        />
      )}
      <ChallengeInline challenge={challenge} showChallenge />
    </Stack>
  );
}

function getDisplayedChallenge(challenge, playerIds, submissionOrder = null) {
  if (challenge === null || playerIds === null) return challenge;

  const submissions = (challenge.submissions ?? []).filter((submission) =>
    playerIds.has(submission.player_id),
  );
  if (submissionOrder !== null) {
    submissions.sort(
      (submissionA, submissionB) =>
        (submissionOrder.get(submissionA.player_id) ?? Number.MAX_SAFE_INTEGER) -
        (submissionOrder.get(submissionB.player_id) ?? Number.MAX_SAFE_INTEGER),
    );
  }

  return {
    ...challenge,
    submissions,
  };
}

function getSubmissionOrder(challenge) {
  if (challenge === null) return null;

  return new Map((challenge.submissions ?? []).map((submission, index) => [submission.player_id, index]));
}

function parseChallengeId(id) {
  if (id === undefined) return null;

  const parsedId = Number(id);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
}

function getCompareChallengesPath(challengeAId, challengeBId) {
  const path = "/compare-challenges";
  if (challengeAId === null) return path;
  if (challengeBId === null) return `${path}/${challengeAId}`;
  return `${path}/${challengeAId}/${challengeBId}`;
}

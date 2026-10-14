import {
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { BasicContainerBox, ErrorDisplay, HeadTitle, LoadingSpinner, StyledLink } from "../components/basic";
import { ChallengeInline, DifficultyChip, PlayerSelect } from "../components/goldberries";
import { ChallengeTagsSection } from "../components/tags";
import { useAuth } from "../hooks/AuthProvider";
import {
  getQueryData,
  useGetChallengesForTagging,
  useGetPlayer,
  useGetUntaggedChallengeIds,
} from "../hooks/useApi";
import { getCampaignName, getChallengeCampaign } from "../util/data_util";

const PER_PAGE = 25;

export function PageMyUntaggedChallenges() {
  const { t } = useTranslation(undefined, { keyPrefix: "my_untagged_challenges" });
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPlayerId = Number(searchParams.get("player_id") ?? auth.user.player.id);
  const playerId = Number.isSafeInteger(requestedPlayerId) && requestedPlayerId > 0 ? requestedPlayerId : null;
  const playerQuery = useGetPlayer(playerId);
  const player = getQueryData(playerQuery);
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);

  const setPage = (newPage) => {
    const next = new URLSearchParams(searchParams);
    if (newPage === 1) next.delete("page");
    else next.set("page", newPage);
    setSearchParams(next);
    window.scrollTo(0, 0);
  };

  return (
    <BasicContainerBox maxWidth="lg" modern>
      <HeadTitle title={t("title")} />
      <Typography variant="h4" gutterBottom>
        {t("title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("description")}
      </Typography>
      <PlayerSelect
        type="all"
        value={player}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        disableClearable
        onChange={(event, selectedPlayer) => {
          const next = new URLSearchParams(searchParams);
          next.set("player_id", selectedPlayer.id);
          next.delete("page");
          setSearchParams(next);
        }}
        sx={{ maxWidth: 400, mb: 3 }}
      />
      {playerId === null ? (
        <ErrorDisplay error={new Error(t("invalid_player"))} />
      ) : playerQuery.isLoading ? (
        <LoadingSpinner />
      ) : playerQuery.isError ? (
        <ErrorDisplay error={playerQuery.error} />
      ) : (
        <UntaggedChallengeList key={playerId} playerId={playerId} page={page} setPage={setPage} />
      )}
    </BasicContainerBox>
  );
}

function UntaggedChallengeList({ playerId, page, setPage }) {
  const { t } = useTranslation(undefined, { keyPrefix: "my_untagged_challenges" });
  const idsQuery = useGetUntaggedChallengeIds(playerId);
  const ids = getQueryData(idsQuery) ?? [];
  const maxPage = Math.max(1, Math.ceil(ids.length / PER_PAGE));
  const currentPage = Math.min(page, maxPage);
  const pageIds = ids.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const challengesQuery = useGetChallengesForTagging(pageIds);
  const challenges = getQueryData(challengesQuery) ?? [];
  const challengesById = new Map(challenges.map((challenge) => [challenge.id, challenge]));
  const orderedChallenges = pageIds.map((id) => challengesById.get(id)).filter(Boolean);

  if (idsQuery.isLoading || (pageIds.length > 0 && challengesQuery.isLoading)) {
    return <LoadingSpinner />;
  } else if (idsQuery.isError || challengesQuery.isError) {
    return <ErrorDisplay error={idsQuery.error ?? challengesQuery.error} />;
  }

  return (
    <Stack gap={2}>
      <Typography variant="body2" color="text.secondary">
        {t("count", { count: ids.length })}
      </Typography>
      {ids.length === 0 ? (
        <Typography>{t("empty")}</Typography>
      ) : (
        <UntaggedChallengesTable challenges={orderedChallenges} />
      )}
      {maxPage > 1 && (
        <Pagination
          count={maxPage}
          page={currentPage}
          onChange={(event, value) => setPage(value)}
          sx={{ alignSelf: "center" }}
        />
      )}
    </Stack>
  );
}

function UntaggedChallengesTable({ challenges }) {
  const { t } = useTranslation(undefined, { keyPrefix: "my_untagged_challenges" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t_g("campaign", { count: 1 })}</TableCell>
            <TableCell>{t_g("challenge", { count: 1 })}</TableCell>
            <TableCell>{t("tags")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {challenges.map((challenge) => {
            const campaign = getChallengeCampaign(challenge);
            return (
              <TableRow key={challenge.id}>
                <TableCell sx={{ verticalAlign: "top" }}>
                  <StyledLink to={"/campaign/" + campaign.id}>
                    {getCampaignName(campaign, t_g)}
                  </StyledLink>
                </TableCell>
                <TableCell sx={{ verticalAlign: "top", minWidth: 220 }}>
                  <Stack direction="row" gap={0.75} alignItems="center">
                    <DifficultyChip difficulty={challenge.difficulty} size="small" />
                    <ChallengeInline challenge={challenge} showChallenge hideCampaign />
                  </Stack>
                </TableCell>
                <TableCell sx={{ minWidth: 280 }}>
                  <ChallengeTagsSection
                    challenge={challenge}
                    maxVisible={null}
                    showIcon={false}
                    hideOutvoted={false}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

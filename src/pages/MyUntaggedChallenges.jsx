import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Autocomplete,
  Box,
  Button,
  FormHelperText,
  Grid,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { BasicContainerBox, ErrorDisplay, HeadTitle, LoadingSpinner, StyledLink } from "../components/basic";
import { ChallengeInline, DifficultyChip, PlayerSelect } from "../components/goldberries";
import { ChallengeTagsSection, useTagLookup } from "../components/tags";
import { useAuth } from "../hooks/AuthProvider";
import {
  getQueryData,
  useGetChallengesForTagging,
  useGetPlayer,
  useGetTagAssignment,
  useGetUntaggedChallengeIds,
} from "../hooks/useApi";
import { getCampaignName, getChallengeCampaign } from "../util/data_util";

const PER_PAGE = 25;
export const PARAMETERS_BACKGROUND = "#303030";

export function PageMyUntaggedChallenges() {
  const { t } = useTranslation(undefined, { keyPrefix: "my_untagged_challenges" });
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPlayerId = Number(searchParams.get("player_id") ?? auth.user.player.id);
  const playerId = Number.isSafeInteger(requestedPlayerId) && requestedPlayerId > 0 ? requestedPlayerId : null;
  const playerQuery = useGetPlayer(playerId);
  const player = getQueryData(playerQuery);
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const tagIdsParam = searchParams.get("tags") ?? "";
  const tagIds = useMemo(
    () =>
      [...new Set(tagIdsParam.split(",").map(Number))]
        .filter((id) => Number.isSafeInteger(id) && id > 0)
        .sort((a, b) => a - b),
    [tagIdsParam],
  );

  const onApply = (newPlayerId, newTagIds) => {
    const next = new URLSearchParams(searchParams);
    next.set("player_id", newPlayerId);
    if (newTagIds.length === 0) next.delete("tags");
    else next.set("tags", newTagIds.join(","));
    next.delete("page");
    setSearchParams(next);
  };

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
      {/* Remount when the applied parameters change (e.g. browser navigation) to reset the draft */}
      <ParametersBox key={playerId + "|" + tagIdsParam} player={player} tagIds={tagIds} onApply={onApply} />
      {playerId === null ? (
        <ErrorDisplay error={new Error(t("invalid_player"))} />
      ) : playerQuery.isLoading ? (
        <LoadingSpinner />
      ) : playerQuery.isError ? (
        <ErrorDisplay error={playerQuery.error} />
      ) : (
        <UntaggedChallengeList
          key={playerId}
          playerId={playerId}
          tagIds={tagIds}
          page={page}
          setPage={setPage}
        />
      )}
    </BasicContainerBox>
  );
}

function ParametersBox({ player, tagIds, onApply }) {
  const { t } = useTranslation(undefined, { keyPrefix: "my_untagged_challenges" });
  // Drafts are only sent to the server once "Apply" is pressed
  const [draftPlayer, setDraftPlayer] = useState(null);
  const [draftTagIds, setDraftTagIds] = useState(tagIds);
  const selectedPlayer = draftPlayer ?? player ?? null;
  const isChanged =
    (draftPlayer !== null && draftPlayer.id !== player?.id) ||
    draftTagIds.length !== tagIds.length ||
    draftTagIds.some((id, index) => id !== tagIds[index]);

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 3,
        borderRadius: 2,
        backgroundColor: PARAMETERS_BACKGROUND,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} md={4}>
          <PlayerSelect
            type="all"
            value={selectedPlayer}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableClearable={selectedPlayer !== null}
            onChange={(event, newPlayer) => newPlayer && setDraftPlayer(newPlayer)}
            size="small"
            fullWidth
          />
          <FormHelperText sx={{ mx: 1.75 }}>{t("description")}</FormHelperText>
        </Grid>
        <Grid item xs={12} md>
          <TagFilterSelect tagIds={draftTagIds} setTagIds={setDraftTagIds} />
          <FormHelperText sx={{ mx: 1.75 }}>{t("tag_filter.help")}</FormHelperText>
        </Grid>
        <Grid item xs={12} md="auto">
          <Button
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faCheck} size="sm" />}
            disabled={selectedPlayer === null || !isChanged}
            onClick={() => onApply(selectedPlayer.id, draftTagIds)}
            fullWidth
            sx={{ height: 40 }}
          >
            {t("apply")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

function TagFilterSelect({ tagIds, setTagIds }) {
  const { t } = useTranslation(undefined, { keyPrefix: "my_untagged_challenges" });
  const { hasHelperPriv } = useAuth();
  const { lookup } = useTagLookup();

  const options = useMemo(() => {
    if (!lookup) return [];
    return lookup.categories
      .filter((category) => !category.is_archived)
      .flatMap((category) =>
        (category.tags ?? [])
          .filter((tag) => hasHelperPriv || tag.is_player_assignable)
          .map((tag) => ({ tag, category })),
      );
  }, [lookup, hasHelperPriv]);
  const value = lookup ? tagIds.map((id) => lookup.tagsById[id]).filter(Boolean) : [];

  return (
    <Autocomplete
      multiple
      options={options}
      value={value}
      onChange={(event, selected) => setTagIds(selected.map((option) => option.tag.id).sort((a, b) => a - b))}
      groupBy={(option) => option.category.name}
      getOptionLabel={(option) => option.tag.name}
      isOptionEqualToValue={(option, selected) => option.tag.id === selected.tag.id}
      loading={!lookup}
      disableCloseOnSelect
      filterSelectedOptions
      size="small"
      fullWidth
      renderOption={(props, option) => (
        <li {...props} key={option.tag.id}>
          <Stack direction="column">
            <span>{option.tag.name}</span>
            <Typography variant="caption" color="text.secondary">
              {option.tag.description}
            </Typography>
          </Stack>
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={t("tag_filter.label")} />}
    />
  );
}

function UntaggedChallengeList({ playerId, tagIds, page, setPage }) {
  const { t } = useTranslation(undefined, { keyPrefix: "my_untagged_challenges" });
  const idsQuery = useGetUntaggedChallengeIds(playerId, tagIds);
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
        <Typography>{tagIds.length > 0 ? t("empty_tags") : t("empty")}</Typography>
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
                  <OwnHighlightedTagsSection challenge={challenge} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Highlights the values the logged-in player voted for, without moving them to the front
function OwnHighlightedTagsSection({ challenge }) {
  const auth = useAuth();
  const assignmentQuery = useGetTagAssignment(challenge.id, auth.user?.player?.id);
  const ownValueIds = getQueryData(assignmentQuery)?.tag_value_ids;
  const highlightedValueIds = useMemo(() => new Set(ownValueIds ?? []), [ownValueIds]);

  return (
    <ChallengeTagsSection
      challenge={challenge}
      maxVisible={null}
      showIcon={false}
      hideOutvoted={false}
      highlightedValueIds={highlightedValueIds}
      sortHighlightedFirst={false}
    />
  );
}

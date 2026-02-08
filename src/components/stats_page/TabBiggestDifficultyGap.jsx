import { useTranslation } from "react-i18next";
import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "../../hooks/AuthProvider";
import { getQueryData, useGetStatsBiggestDifficultyGap } from "../../hooks/useApi";
import { ErrorDisplay, LoadingSpinner } from "../basic";
import { DifficultyChip, PlayerChip, PlayerIdSelect } from "../goldberries";
import { ChallengeInline } from "../../pages/Player";


const DEFAULT_SHOW_COUNT = 20;

const reducedPadding = { px: 0.5 };

export function TabBiggestDifficultyGap() {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.biggest_difficulty_gap" });
  const { t: t_s } = useTranslation(undefined, { keyPrefix: "stats" });
  const { user } = useAuth();

  const [highlightPlayerId, setHighlightPlayerId] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // Use logged-in player's ID if no custom highlight is set
  const effectivePlayerId = highlightPlayerId ?? user?.player?.id ?? null;

  const query = useGetStatsBiggestDifficultyGap(effectivePlayerId);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const data = getQueryData(query);
  const { list, player: highlightedPlayerData } = data;

  const displayList = expanded ? list : list.slice(0, DEFAULT_SHOW_COUNT);
  const highlightedInList = highlightedPlayerData
    ? displayList.some((entry) => entry.player.id === highlightedPlayerData.player.id)
    : false;

  // Calculate ranks (accounting for ties)
  const getRank = (index, currentGap) => {
    if (index === 0) return 1;
    const prevGap = list[index - 1].difficulty_gap;
    if (currentGap === prevGap) {
      // Same gap as previous, find the first occurrence of this gap
      for (let i = index - 1; i >= 0; i--) {
        if (list[i].difficulty_gap !== currentGap) {
          return i + 2;
        }
      }
      return 1;
    }
    return index + 1;
  };

  // Calculate highlighted player's rank
  const getHighlightedPlayerRank = () => {
    if (!highlightedPlayerData) return null;
    const gap = highlightedPlayerData.difficulty_gap;
    // Find rank by counting how many entries have a higher gap
    let rank = 1;
    for (const entry of list) {
      if (entry.difficulty_gap > gap) {
        rank++;
      }
    }
    return rank;
  };

  let highlightedPlayerRank = getHighlightedPlayerRank();
  if (!highlightedInList) {
    highlightedPlayerRank = "?";
  }

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h4" gutterBottom>
        {t("header")}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t("text")}
      </Typography>

      <Grid container>
        <Grid item xs={12} md={4}>
          <PlayerIdSelect
            type="all"
            value={highlightPlayerId}
            onChange={(e, id) => {
              setHighlightPlayerId(id);
            }}
            sx={{ mb: 2, mt: 1 }}
          />
        </Grid>
      </Grid>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={1} sx={reducedPadding}></TableCell>
              <TableCell sx={reducedPadding}>{t("player")}</TableCell>
              <TableCell sx={reducedPadding}>{t("second_hardest")}</TableCell>
              <TableCell width={1} sx={reducedPadding}></TableCell>
              <TableCell align="center" width={1} sx={reducedPadding}>
                {t("gap")}
              </TableCell>
              <TableCell width={1} sx={reducedPadding}></TableCell>
              <TableCell sx={reducedPadding}>{t("hardest")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayList.map((entry, index) => {
              const rank = getRank(index, entry.difficulty_gap);
              const isHighlighted =
                highlightedPlayerData && entry.player.id === highlightedPlayerData.player.id;

              return (
                <DifficultyGapRow
                  key={entry.player.id}
                  entry={entry}
                  rank={rank}
                  isHighlighted={isHighlighted}
                />
              );
            })}

            {/* Show highlighted player if not in list */}
            {highlightedPlayerData && !highlightedInList && (
              <DifficultyGapRow
                entry={highlightedPlayerData}
                rank={highlightedPlayerRank}
                showRank={true}
                isHighlighted={true}
                isSeparated={true}
              />
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Expand/collapse button */}
      {list.length > DEFAULT_SHOW_COUNT && (
        <Button variant="outlined" onClick={() => setExpanded(!expanded)} sx={{ mt: 1, alignSelf: "center" }}>
          {expanded ? t_s("show_less") : t_s("show_all", { count: list.length })}
        </Button>
      )}
    </Stack>
  );
}

function DifficultyGapRow({ entry, rank, isHighlighted, isSeparated = false }) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const wrap = isMobile ? "nowrap" : "wrap";
  const firstChallenge = entry.first_submission.challenge;
  const secondChallenge = entry.second_submission.challenge;

  return (
    <TableRow
      sx={{
        ...(isHighlighted ? { backgroundColor: "rgba(255, 215, 0, 0.15)" } : {}),
        ...(isSeparated ? { borderTop: "2px solid grey" } : {}),
      }}
    >
      <TableCell width={1} align="center" sx={reducedPadding}>
        <Typography variant="body1" fontWeight="bold">
          #{rank}
        </Typography>
      </TableCell>
      <TableCell sx={reducedPadding}>
        <PlayerChip player={entry.player} size="small" />
      </TableCell>
      <TableCell sx={reducedPadding}>
        <Stack direction="row" alignItems="center" gap={1}>
          <ChallengeInline challenge={secondChallenge} submission={entry.second_submission} flexWrap={wrap} />
        </Stack>
      </TableCell>
      <TableCell align="center" width={1} sx={reducedPadding}>
        <DifficultyChip difficulty={secondChallenge.difficulty} />
      </TableCell>
      <TableCell width={1} sx={reducedPadding}>
        <Stack direction="row" alignItems="center" justifyContent="center" gap={1} flexWrap="nowrap">
          <FontAwesomeIcon icon={faArrowRight} />
          <Typography variant="body1" fontWeight="bold">
            {entry.difficulty_gap}
          </Typography>
          <FontAwesomeIcon icon={faArrowRight} />
        </Stack>
      </TableCell>
      <TableCell align="center" width={1} sx={reducedPadding}>
        <DifficultyChip difficulty={firstChallenge.difficulty} />
      </TableCell>
      <TableCell sx={reducedPadding}>
        <Stack direction="row" alignItems="center" gap={1}>
          <ChallengeInline challenge={firstChallenge} submission={entry.first_submission} flexWrap={wrap} />
        </Stack>
      </TableCell>
    </TableRow>
  );
}

import {
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ErrorDisplay, getErrorFromMultiple, LoadingSpinner } from "../../components/BasicComponents";
import { PlayerIdSelect, PlayerLink } from "../../components/GoldberriesComponents";
import { getQueryData, useGetAllDifficulties, useGetStatsPlayerTierClearCounts } from "../../hooks/useApi";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { DIFF_CONSTS, getNewDifficultyColors } from "../../util/constants";
import { getDifficultyName } from "../../util/data_util";
import { useAppSettings } from "../../hooks/AppSettingsProvider";
import { useAuth } from "../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import Color from "color";
import { useState } from "react";

export function TabTierClears() {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.tier_clears" });

  return (
    <Stack>
      <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
        {t("header")}
      </Typography>
      <TierClearCounts />
      <Divider sx={{ my: 2 }} />
      <TotalClears />
    </Stack>
  );
}

function TierClearCounts() {
  const { user } = useAuth();
  const [highlightPlayerId, setHighlightPlayerId] = useState();
  const diffQuery = useGetAllDifficulties();
  const query = useGetStatsPlayerTierClearCounts();

  if (query.isLoading || diffQuery.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError || diffQuery.isError) {
    return <ErrorDisplay error={getErrorFromMultiple(query, diffQuery)} />;
  }

  const data = getQueryData(query);
  const difficulties = getQueryData(diffQuery).filter(
    (diff) => diff.id !== DIFF_CONSTS.UNTIERED_ID && diff.id !== DIFF_CONSTS.TRIVIAL_ID,
  );

  // Make a list of the top 10 players for each difficulty
  const topPlayersByDifficulty = {};
  const totalClearsByDifficulty = {};

  const doHighlightPlayerId = highlightPlayerId || user?.player?.id;
  const highlightPlayer = data.find((player) => doHighlightPlayerId === player.player.id);
  const highlightPlayerRanksByDifficulty = {};

  difficulties.forEach((diff) => {
    const sortedPlayers = [...data].sort((a, b) => b.clears[diff.id] - a.clears[diff.id]);
    if (highlightPlayer) {
      const rank = sortedPlayers.findIndex((player) => player.player.id === highlightPlayer.player.id);
      highlightPlayerRanksByDifficulty[diff.id] = rank !== -1 ? rank + 1 : null;
    }
    topPlayersByDifficulty[diff.id] = sortedPlayers.slice(0, 10);
    // Filter out players with 0 clears for this difficulty
    topPlayersByDifficulty[diff.id] = topPlayersByDifficulty[diff.id].filter(
      (player) => player.clears[diff.id] > 0,
    );

    totalClearsByDifficulty[diff.id] = sortedPlayers.reduce((sum, player) => sum + player.clears[diff.id], 0);
  });

  // Also top 10 for total clears
  const totalSortedPlayers = [...data].sort((a, b) => b.total_clears - a.total_clears);
  const topPlayersByTotalClears = totalSortedPlayers.slice(0, 10);
  const totalClearsOverall = data.reduce((sum, player) => sum + player.total, 0);

  // Find own player
  let highlightPlayerRankOverall = null;
  if (highlightPlayer) {
    highlightPlayerRankOverall = totalSortedPlayers.findIndex(
      (player) => player.player.id === highlightPlayer.player.id,
    );
    highlightPlayerRankOverall = highlightPlayerRankOverall !== -1 ? highlightPlayerRankOverall + 1 : null;
  }

  return (
    <>
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
      <Grid container spacing={2}>
        {difficulties.map((diff) => (
          <Grid key={diff.id} item xs={12} md={4}>
            <SingleTierClearCounts
              key={diff.id}
              difficulty={diff}
              topPlayers={topPlayersByDifficulty[diff.id]}
              highlightPlayer={highlightPlayer}
              highlightPlayerRank={highlightPlayerRanksByDifficulty[diff.id]}
              totalClears={totalClearsByDifficulty[diff.id]}
            />
          </Grid>
        ))}
        <Grid item xs={12} md={4}>
          <SingleTierClearCounts
            difficulty={null}
            topPlayers={topPlayersByTotalClears}
            highlightPlayer={highlightPlayer}
            highlightPlayerRank={highlightPlayerRankOverall}
            totalClears={totalClearsOverall}
          />
        </Grid>
      </Grid>
    </>
  );
}
function SingleTierClearCounts({
  difficulty,
  topPlayers,
  highlightPlayer,
  highlightPlayerRank,
  totalClears,
}) {
  const { settings } = useAppSettings();
  const name = difficulty === null ? "Total Submissions" : getDifficultyName(difficulty);
  const color = difficulty === null ? "white" : getNewDifficultyColors(settings, difficulty.id).color;
  const valueGetter = (row) => (difficulty === null ? row.total : row.clears[difficulty.id]);

  const backgroundColor = new Color(color).darken(0.95).string();
  const backgroundColorHover = new Color(color).darken(0.9).string();
  const highlightIsInTop = highlightPlayer
    ? topPlayers.some((entry) => entry.player.id === highlightPlayer.player.id)
    : false;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        border: `2px solid ${color}`,
        borderRadius: 2,
        boxShadow: `0 0 8px ${color}`,
        backgroundColor,
        transition: "background-color 0.15s",
        "&:hover": { backgroundColor: backgroundColorHover },
      }}
    >
      <Typography variant="h4" textAlign="center" color={color} fontWeight="500">
        {name}
      </Typography>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Total clears: {totalClears.toLocaleString()}
        </Typography>
      </Stack>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={1}></TableCell>
              <TableCell>Player</TableCell>
              <TableCell width={1} align="right">
                #
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topPlayers.map((entry, index) => {
              const doHighlight = highlightPlayer && entry.player.id === highlightPlayer.player.id;
              return (
                <TableRow
                  key={entry.player.id}
                  sx={doHighlight ? { backgroundColor: "rgba(255, 215, 0, 0.15)" } : {}}
                >
                  <TableCell width={1}>#{index + 1}</TableCell>
                  <TableCell>
                    <PlayerLink player={entry.player} />
                  </TableCell>
                  <TableCell width={1} align="right">
                    {valueGetter(entry)}
                  </TableCell>
                </TableRow>
              );
            })}
            {highlightPlayer && !highlightIsInTop && valueGetter(highlightPlayer) !== 0 && (
              <TableRow
                key={highlightPlayer.player.id}
                sx={{ backgroundColor: "rgba(255, 215, 0, 0.15)", borderTop: "2px solid grey" }}
              >
                <TableCell width={1}>#{highlightPlayerRank}</TableCell>
                <TableCell>
                  <PlayerLink player={highlightPlayer.player} />
                </TableCell>
                <TableCell width={1} align="right">
                  {valueGetter(highlightPlayer)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function TotalClears() {
  const diffQuery = useGetAllDifficulties();
  const query = useGetStatsPlayerTierClearCounts();

  if (query.isLoading || diffQuery.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError || diffQuery.isError) {
    return <ErrorDisplay error={getErrorFromMultiple(query, diffQuery)} />;
  }

  const data = getQueryData(query);
  const difficulties = getQueryData(diffQuery).filter(
    (diff) => diff.id !== DIFF_CONSTS.UNTIERED_ID && diff.id !== DIFF_CONSTS.TRIVIAL_ID,
  );

  const columns = [
    {
      field: "name",
      headerName: "Name",
      // width: 130,
      flex: 2.5,
      resizable: false,
      disableReorder: true,
      valueGetter: (value, row) => row.player.name,
      renderCell: (params) => {
        return <PlayerLink player={params.row.player} />;
      },
    },
  ];
  difficulties.forEach((diff) => {
    columns.push({
      field: `tier_${diff.id}`,
      headerName: "t" + diff.sort,
      // width: 90,
      flex: 1,
      align: "center",
      headerAlign: "center",
      type: "number",
      sortingOrder: ["desc", null],
      resizable: false,
      disableColumnMenu: true,
      disableReorder: true,
      valueGetter: (value, row) => row.clears[diff.id],
    });
  });
  columns.push({
    field: `total`,
    headerName: "Total",
    flex: 1,
    align: "center",
    headerAlign: "center",
    type: "number",
    sortingOrder: ["desc", null],
    resizable: false,
    disableColumnMenu: true,
    disableReorder: true,
    // valueGetter: (value, row) => row.total,
  });

  return (
    <>
      <Typography variant="h5" sx={{ mt: 1 }}>
        Total Clears by Player
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        (might delete this later, it's a bit big)
      </Typography>
      <DataGrid
        rows={data}
        columns={columns}
        sx={{
          [`& .${gridClasses.row}.even`]: {
            backgroundColor: "rgba(255, 255, 255, 0.07)",
          },
          [`& .${gridClasses.row}.odd`]: {
            backgroundColor: "rgba(255, 255, 255, 0.00)",
          },
        }}
        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
        autosizeOptions={{
          columns: ["name"],
          includeOutliers: true,
          includeHeaders: true,
        }}
        disableRowSelectionOnClick
        getRowId={(row) => row.player.id}
      />
    </>
  );
}

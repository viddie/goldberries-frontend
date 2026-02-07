import {
  Button,
  Checkbox,
  FormControlLabel,
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
import {
  CountrySelect,
  ErrorDisplay,
  getErrorFromMultiple,
  LanguageFlag,
  LoadingSpinner,
} from "../../components/BasicComponents";
import { InputMethodIcon, PlayerIdSelect, PlayerLink } from "../../components/GoldberriesComponents";
import { getQueryData, useGetAllDifficulties, useGetStatsPlayerTierClearCounts } from "../../hooks/useApi";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { DIFF_CONSTS, getNewDifficultyColors } from "../../util/constants";
import { getDifficultyName } from "../../util/data_util";
import { useAppSettings } from "../../hooks/AppSettingsProvider";
import { useAuth } from "../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useNavigate, useParams } from "react-router-dom";
import Color from "color";
import { useEffect, useState } from "react";
import { COUNTRY_CODES, COUNTRY_CODES_SHORT } from "../../util/country_codes";

const reducedPadding = { px: 0.5 };
const reducedPaddingLeft = { pl: 1.0 };
const VALID_GROUP_BY_VALUES = ["player", "country", "input_method"];
const DEFAULT_GROUP_BY = "player";

export function TabTierClears() {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.tier_clears" });
  const navigate = useNavigate();
  const { subtab } = useParams();

  // Use useState to control groupBy, synced with URL
  const initialGroupBy = VALID_GROUP_BY_VALUES.includes(subtab) ? subtab : DEFAULT_GROUP_BY;
  const [groupBy, setGroupBy] = useState(initialGroupBy);

  const onChangeGroupBy = (newGroupBy) => {
    setGroupBy(newGroupBy);
    navigate(`/stats/tier-clears/${newGroupBy}`, { replace: true });
  };

  // Sync state when URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    const urlGroupBy = VALID_GROUP_BY_VALUES.includes(subtab) ? subtab : DEFAULT_GROUP_BY;
    if (subtab !== groupBy && urlGroupBy !== groupBy) {
      setGroupBy(urlGroupBy);
    }
  }, [subtab, groupBy]);

  const groupOptions = [
    { value: "player", label: t("group_by.player") },
    { value: "country", label: t("group_by.country") },
    { value: "input_method", label: t("group_by.input_method") },
  ];

  return (
    <Stack>
      <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
        {t("header")}
      </Typography>

      <GroupBySelector options={groupOptions} value={groupBy} onChange={onChangeGroupBy} />

      <TierClearCounts groupBy={groupBy} />
      {/* <Divider sx={{ my: 2 }} />
      <TotalClears groupBy={groupBy} /> */}
    </Stack>
  );
}

//#region Group By Selector
function GroupBySelector({ options, value, onChange }) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.tier_clears" });
  const variantUnselected = "outlined";
  const variantSelected = "contained";

  return (
    <Stack direction="column" gap={0} sx={{ mb: 1 }}>
      <Typography variant="h6">{t("group_by.label")}</Typography>
      <Stack direction="row" gap={2} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? variantSelected : variantUnselected}
            color="primary"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
//#endregion

//#region Tier Clear Counts Grid
function TierClearCounts({ groupBy }) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.tier_clears" });
  const { user } = useAuth();
  const [highlightPlayerId, setHighlightPlayerId] = useState();
  const [highlightCountry, setHighlightCountry] = useState(user?.country ?? "");
  const [showUnknown, setShowUnknown] = useLocalStorage("tier_clears_show_unknown", false);

  const diffQuery = useGetAllDifficulties();
  const query = useGetStatsPlayerTierClearCounts(groupBy === "player" ? null : groupBy);

  if (query.isLoading || diffQuery.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError || diffQuery.isError) {
    return <ErrorDisplay error={getErrorFromMultiple(query, diffQuery)} />;
  }

  let data = getQueryData(query);
  const difficulties = getQueryData(diffQuery).filter(
    (diff) => diff.id !== DIFF_CONSTS.UNTIERED_ID && diff.id !== DIFF_CONSTS.TRIVIAL_ID,
  );

  // Filter out null entries if showUnknown is false (for country/input_method grouping)
  if (groupBy !== "player" && !showUnknown) {
    data = data.filter((entry) => {
      if (groupBy === "country") return entry.country !== null;
      if (groupBy === "input_method") return entry.input_method !== null;
      return true;
    });
  }

  // Determine the key field based on groupBy
  const getEntryKey = (entry) => {
    if (groupBy === "player") return entry.player.id;
    if (groupBy === "country") return entry.country ?? "null";
    if (groupBy === "input_method") return entry.input_method ?? "null";
    return entry.player?.id;
  };

  // Make a list of the top 10 entries for each difficulty
  const topEntriesByDifficulty = {};
  const totalClearsByDifficulty = {};

  // Determine highlight entry
  let highlightEntry = null;
  let highlightEntryKey = null;

  if (groupBy === "player") {
    const doHighlightPlayerId = highlightPlayerId || user?.player?.id;
    highlightEntry = data.find((entry) => doHighlightPlayerId === entry.player.id);
    highlightEntryKey = highlightEntry?.player.id;
  } else if (groupBy === "country") {
    highlightEntry = highlightCountry ? data.find((entry) => entry.country === highlightCountry) : null;
    highlightEntryKey = highlightEntry?.country ?? "null";
  }
  // No highlighting for input_method

  const highlightEntryRanksByDifficulty = {};

  difficulties.forEach((diff) => {
    const sortedEntries = [...data].sort((a, b) => b.clears[diff.id] - a.clears[diff.id]);
    if (highlightEntry) {
      const rank = sortedEntries.findIndex((entry) => getEntryKey(entry) === highlightEntryKey);
      highlightEntryRanksByDifficulty[diff.id] = rank !== -1 ? rank + 1 : null;
    }
    topEntriesByDifficulty[diff.id] = sortedEntries.slice(0, 10);
    // Filter out entries with 0 clears for this difficulty
    topEntriesByDifficulty[diff.id] = topEntriesByDifficulty[diff.id].filter(
      (entry) => entry.clears[diff.id] > 0,
    );
    totalClearsByDifficulty[diff.id] = sortedEntries.reduce((sum, entry) => sum + entry.clears[diff.id], 0);
  });

  // Also top 10 for total clears
  const totalSortedEntries = [...data].sort((a, b) => b.total - a.total);
  const topEntriesByTotalClears = totalSortedEntries.slice(0, 10);
  const totalClearsOverall = data.reduce((sum, entry) => sum + entry.total, 0);

  // Find highlight entry rank overall
  let highlightEntryRankOverall = null;
  if (highlightEntry) {
    highlightEntryRankOverall = totalSortedEntries.findIndex(
      (entry) => getEntryKey(entry) === highlightEntryKey,
    );
    highlightEntryRankOverall = highlightEntryRankOverall !== -1 ? highlightEntryRankOverall + 1 : null;
  }

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Selector for highlighting */}
        {groupBy === "player" && (
          <Grid item xs={12} md={4}>
            <PlayerIdSelect
              type="all"
              value={highlightPlayerId}
              onChange={(e, id) => setHighlightPlayerId(id)}
              sx={{ mt: 1 }}
            />
          </Grid>
        )}
        {groupBy === "country" && (
          <Grid item xs={12} md={4}>
            <CountrySelect
              value={highlightCountry}
              setValue={setHighlightCountry}
              label={t("highlight_country")}
              sx={{ mt: 1 }}
            />
          </Grid>
        )}

        {/* Show unknown checkbox for country/input_method */}
        {groupBy !== "player" && (
          <Grid item xs={12} md={4} display="flex" alignItems="center">
            <FormControlLabel
              control={<Checkbox checked={showUnknown} onChange={(e) => setShowUnknown(e.target.checked)} />}
              label={t("show_unknown")}
            />
          </Grid>
        )}
      </Grid>

      <Grid container spacing={2}>
        {difficulties.map((diff) => (
          <Grid key={diff.id} item xs={12} md={4}>
            <SingleTierClearCounts
              key={diff.id}
              difficulty={diff}
              topEntries={topEntriesByDifficulty[diff.id]}
              highlightEntry={highlightEntry}
              highlightEntryKey={highlightEntryKey}
              highlightEntryRank={highlightEntryRanksByDifficulty[diff.id]}
              totalClears={totalClearsByDifficulty[diff.id]}
              groupBy={groupBy}
              getEntryKey={getEntryKey}
            />
          </Grid>
        ))}
        <Grid item xs={12} md={4}>
          <SingleTierClearCounts
            difficulty={null}
            topEntries={topEntriesByTotalClears}
            highlightEntry={highlightEntry}
            highlightEntryKey={highlightEntryKey}
            highlightEntryRank={highlightEntryRankOverall}
            totalClears={totalClearsOverall}
            groupBy={groupBy}
            getEntryKey={getEntryKey}
          />
        </Grid>
      </Grid>
    </>
  );
}

function SingleTierClearCounts({
  difficulty,
  topEntries,
  highlightEntry,
  highlightEntryKey,
  highlightEntryRank,
  totalClears,
  groupBy,
  getEntryKey,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.tier_clears" });
  const { settings } = useAppSettings();
  const name = difficulty === null ? t("total_submissions") : getDifficultyName(difficulty);
  const color = difficulty === null ? "white" : getNewDifficultyColors(settings, difficulty.id).color;
  const valueGetter = (row) => (difficulty === null ? row.total : row.clears[difficulty.id]);

  const backgroundColor = new Color(color).darken(0.95).string();
  const backgroundColorHover = new Color(color).darken(0.9).string();
  const highlightIsInTop = highlightEntry
    ? topEntries.some((entry) => getEntryKey(entry) === highlightEntryKey)
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
          {t("total_clears")}: {totalClears.toLocaleString()}
        </Typography>
      </Stack>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={1}></TableCell>
              <TableCell sx={reducedPadding}>{getColumnHeader(groupBy, t)}</TableCell>
              <TableCell width={1} align="right">
                #
              </TableCell>
              <TableCell width={1} align="center" sx={reducedPaddingLeft}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topEntries.map((entry, index) => {
              const doHighlight = highlightEntry && getEntryKey(entry) === highlightEntryKey;
              const percentage =
                totalClears > 0 ? ((valueGetter(entry) / totalClears) * 100).toFixed(1) : "0.0";
              return (
                <TableRow
                  key={getEntryKey(entry)}
                  sx={doHighlight ? { backgroundColor: "rgba(255, 215, 0, 0.15)" } : {}}
                >
                  <TableCell width={1}>#{index + 1}</TableCell>
                  <TableCell sx={reducedPadding}>
                    <EntryDisplay entry={entry} groupBy={groupBy} />
                  </TableCell>
                  <TableCell width={1} align="right">
                    {valueGetter(entry).toLocaleString()}
                  </TableCell>
                  <TableCell width={1} align="center" sx={reducedPaddingLeft}>
                    {percentage}%
                  </TableCell>
                </TableRow>
              );
            })}
            {highlightEntry && !highlightIsInTop && valueGetter(highlightEntry) !== 0 && (
              <TableRow
                key={highlightEntryKey}
                sx={{ backgroundColor: "rgba(255, 215, 0, 0.15)", borderTop: "2px solid grey" }}
              >
                <TableCell width={1}>#{highlightEntryRank}</TableCell>
                <TableCell sx={reducedPadding}>
                  <EntryDisplay entry={highlightEntry} groupBy={groupBy} />
                </TableCell>
                <TableCell width={1} align="right">
                  {valueGetter(highlightEntry).toLocaleString()}
                </TableCell>
                <TableCell width={1} align="right" sx={reducedPaddingLeft}>
                  {totalClears > 0 ? ((valueGetter(highlightEntry) / totalClears) * 100).toFixed(1) : "0.0"}%
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
//#endregion

//#region Helper Components
function getColumnHeader(groupBy, t) {
  switch (groupBy) {
    case "country":
      return t("column.country");
    case "input_method":
      return t("column.input_method");
    default:
      return t("column.player");
  }
}

function EntryDisplay({ entry, groupBy }) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.tier_clears" });
  const { t: t_im } = useTranslation(undefined, { keyPrefix: "components.input_methods" });

  if (groupBy === "player") {
    return <PlayerLink player={entry.player} />;
  }

  if (groupBy === "country") {
    if (entry.country === null) {
      return <Typography variant="body2">{t("unknown")}</Typography>;
    }
    return (
      <Stack direction="row" alignItems="center" gap={1}>
        <LanguageFlag code={entry.country} height="20" />
        <Typography variant="body2">{COUNTRY_CODES_SHORT[entry.country] || entry.country}</Typography>
      </Stack>
    );
  }

  if (groupBy === "input_method") {
    if (entry.input_method === null) {
      return <Typography variant="body2">{t("unknown")}</Typography>;
    }
    return (
      <Stack direction="row" alignItems="center" gap={1}>
        <InputMethodIcon method={entry.input_method} />
        <Typography variant="body2">{t_im(entry.input_method)}</Typography>
      </Stack>
    );
  }

  return null;
}
//#endregion

function TotalClears({ groupBy }) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.tier_clears" });
  const { t: t_im } = useTranslation(undefined, { keyPrefix: "components.input_methods" });
  const [showUnknown] = useLocalStorage("tier_clears_show_unknown", false);

  const diffQuery = useGetAllDifficulties();
  const query = useGetStatsPlayerTierClearCounts(groupBy === "player" ? null : groupBy);

  if (query.isLoading || diffQuery.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError || diffQuery.isError) {
    return <ErrorDisplay error={getErrorFromMultiple(query, diffQuery)} />;
  }

  let data = getQueryData(query);
  const difficulties = getQueryData(diffQuery).filter(
    (diff) => diff.id !== DIFF_CONSTS.UNTIERED_ID && diff.id !== DIFF_CONSTS.TRIVIAL_ID,
  );

  // Filter out null entries if showUnknown is false
  if (groupBy !== "player" && !showUnknown) {
    data = data.filter((entry) => {
      if (groupBy === "country") return entry.country !== null;
      if (groupBy === "input_method") return entry.input_method !== null;
      return true;
    });
  }

  const getRowId = (row) => {
    if (groupBy === "player") return row.player.id;
    if (groupBy === "country") return row.country ?? "null";
    if (groupBy === "input_method") return row.input_method ?? "null";
    return row.player?.id;
  };

  const columns = [
    {
      field: "name",
      headerName: getColumnHeader(groupBy, t),
      flex: 2.5,
      resizable: false,
      disableReorder: true,
      valueGetter: (value, row) => {
        if (groupBy === "player") return row.player.name;
        if (groupBy === "country")
          return row.country ? COUNTRY_CODES[row.country] || row.country : t("unknown");
        if (groupBy === "input_method") return row.input_method ? t_im(row.input_method) : t("unknown");
        return row.player?.name;
      },
      renderCell: (params) => <EntryDisplay entry={params.row} groupBy={groupBy} />,
    },
  ];

  difficulties.forEach((diff) => {
    columns.push({
      field: `tier_${diff.id}`,
      headerName: "t" + diff.sort,
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
  });

  return (
    <>
      <Typography variant="h5" sx={{ mt: 1 }}>
        {t("total_clears_header")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        (might delete this later, it's a bit big and broken)
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
        getRowId={getRowId}
      />
    </>
  );
}

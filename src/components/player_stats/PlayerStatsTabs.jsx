import { useMemo, useState } from "react";
import { Box, MenuItem, Stack, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useTheme } from "@emotion/react";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../hooks/AuthProvider";
import { getQueryData, useGetAllDifficulties, useGetPlayerTagStats } from "../../hooks/useApi";
import { getDifficultyNameShort } from "../../util/data_util";
import { BorderedBox, ErrorDisplay, LoadingSpinner, StyledLink, getErrorFromMultiple, safeAlpha } from "../basic";
import { DifficultyChip } from "../goldberries";
import { getTagCategoryColor, getTagValueDescription, isImplicitTag, useTagLookup } from "../tags";

const TOOLTIP_DELAY = 50;
const TIER_AXIS = "tier";
const STANDOUT_MIN_CLEARS = 3;
const STANDOUT_MIN_FACTOR = 1.5;

//#region PlayerStatsTabs
// Tabs for the player stats section. `children` is the content of the default "Tiers" tab.
// The tag stats are only fetched once a tag tab is opened.
export function PlayerStatsTabs({ id, children }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info.tag_stats" });
  const [tab, setTab] = useState("tiers");
  const { lookup } = useTagLookup();

  const categories = getStatsCategories(lookup);

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(event, newTab) => setTab(newTab)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label={t("tabs.tiers")} value="tiers" />
          <Tab label={t("tabs.heatmap")} value="heatmap" />
          {categories.map((category) => (
            <Tab key={category.id} label={category.name} value={"category-" + category.id} />
          ))}
        </Tabs>
      </Box>
      {tab === "tiers" && children}
      {tab !== "tiers" && <PlayerTagStatsTab id={id} tab={tab} lookup={lookup} categories={categories} />}
    </>
  );
}
//#endregion

//#region PlayerTagStatsTab
function PlayerTagStatsTab({ id, tab, lookup, categories }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info.tag_stats" });
  const query = useGetPlayerTagStats(id);
  const data = getQueryData(query);
  const difficultiesQuery = useGetAllDifficulties();
  const difficulties = getQueryData(difficultiesQuery);

  const stats = useMemo(() => (data && lookup ? buildPlayerTagStats(data, lookup) : null), [data, lookup]);

  if (query.isError || difficultiesQuery.isError) {
    return <ErrorDisplay error={getErrorFromMultiple(query, difficultiesQuery)} />;
  } else if (stats === null || difficulties === null) {
    return <LoadingSpinner />;
  }

  const category = categories.find((c) => "category-" + c.id === tab);

  return (
    <Stack direction="column" gap={2}>
      <TagStatsCoverage id={id} stats={stats} />
      {stats.tagged === 0 ? null : tab === "heatmap" ? (
        <TagHeatmap stats={stats} lookup={lookup} categories={categories} difficulties={difficulties} />
      ) : category ? (
        <CategoryStats category={category} stats={stats} />
      ) : (
        <Typography color="text.secondary">{t("no_data")}</Typography>
      )}
    </Stack>
  );
}

function TagStatsCoverage({ id, stats }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info.tag_stats" });
  const auth = useAuth();
  const canTagMore = auth.isPlayerWithId(id) && stats.tagged < stats.total;
  const text =
    stats.tagged === 0
      ? t("no_data")
      : t("coverage", {
          tagged: stats.tagged,
          total: stats.total,
          percent: formatPercent(stats.tagged / stats.total),
        });

  return (
    <Typography variant="body2" color="text.secondary">
      {text} {canTagMore && <StyledLink to="/my-untagged-challenges">{t("tag_your_clears")}</StyledLink>}
    </Typography>
  );
}
//#endregion

//#region TagHeatmap
function TagHeatmap({ stats, lookup, categories, difficulties }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info.tag_stats.heatmap" });
  const theme = useTheme();
  const [xAxisKey, setXAxisKey] = useState(null);
  const [yAxisKey, setYAxisKey] = useState(null);

  const ordinalTags = categories.flatMap((c) => c.tags.filter((tag) => tag.is_ordinal && !isImplicitTag(tag)));
  const axisOptions = [
    ...ordinalTags.map((tag) => ({ key: "tag-" + tag.id, label: tag.name })),
    { key: TIER_AXIS, label: t("tier") },
  ];
  const [defaultX, defaultY] = getDefaultHeatmapAxes(ordinalTags);
  const xKey = axisOptions.some((o) => o.key === xAxisKey) ? xAxisKey : defaultX;
  const yKey = axisOptions.some((o) => o.key === yAxisKey) ? yAxisKey : defaultY;

  const xAxis = getHeatmapAxis(xKey, stats, lookup, difficulties, t);
  const yAxis = getHeatmapAxis(yKey, stats, lookup, difficulties, t);
  const matrix = xAxis && yAxis && xKey !== yKey ? buildHeatmapMatrix(stats, xAxis, yAxis) : null;

  const axisSelect = (label, value, setValue, otherValue) => (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      sx={{ minWidth: 160 }}
    >
      {axisOptions.map((option) => (
        <MenuItem key={option.key} value={option.key} disabled={option.key === otherValue}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );

  const color = theme.palette.primary.main;

  return (
    <Stack direction="column" gap={2}>
      <Stack direction="row" gap={2} flexWrap="wrap">
        {axisSelect(t("x_axis"), xKey, setXAxisKey, yKey)}
        {axisSelect(t("y_axis"), yKey, setYAxisKey, xKey)}
      </Stack>
      {matrix === null || matrix.count === 0 ? (
        <Typography color="text.secondary">{t("empty")}</Typography>
      ) : (
        <>
          <Box sx={{ overflowX: "auto" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `auto repeat(${xAxis.categories.length}, minmax(44px, 1fr)) auto`,
                gap: "3px",
                minWidth: 120 + xAxis.categories.length * 47,
              }}
            >
              {[...yAxis.categories].reverse().map((yCat) => (
                <HeatmapRow key={yCat.id} yCat={yCat} xAxis={xAxis} yAxis={yAxis} matrix={matrix} color={color} />
              ))}
              <HeatmapAxisLabel label={t("total")} />
              {xAxis.categories.map((xCat) => (
                <HeatmapTotalCell key={xCat.id} value={matrix.colTotals[xCat.id] ?? 0} total={matrix.count} />
              ))}
              <HeatmapTotalCell value={matrix.count} total={matrix.count} bold />
              <Box />
              {xAxis.categories.map((xCat) => (
                <HeatmapAxisLabel key={xCat.id} category={xCat} centered />
              ))}
              <Box />
            </Box>
          </Box>
          <Stack direction="column" gap={0.5}>
            <Typography variant="body2" color="text.secondary">
              {t("based_on", { count: matrix.count, x: xAxis.label, y: yAxis.label })}
              {matrix.hasFractions && " " + t("ties_note")}
            </Typography>
            <Typography variant="body2">
              {t("most_common", {
                x: matrix.max.x.label,
                y: matrix.max.y.label,
                count: formatCount(matrix.max.value),
                percent: formatPercent(matrix.max.value / matrix.count),
              })}
            </Typography>
            {!xAxis.isTier && (
              <Typography variant="body2">
                {t("average", { axis: xAxis.label, value: getAxisAverageLabel(xAxis, matrix.colTotals) })}
              </Typography>
            )}
            {!yAxis.isTier && (
              <Typography variant="body2">
                {t("average", { axis: yAxis.label, value: getAxisAverageLabel(yAxis, matrix.rowTotals) })}
              </Typography>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
}

function HeatmapRow({ yCat, xAxis, yAxis, matrix, color }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info.tag_stats.heatmap" });
  const theme = useTheme();
  const strongTextColor = theme.palette.getContrastText(color);
  return (
    <>
      <HeatmapAxisLabel category={yCat} />
      {xAxis.categories.map((xCat) => {
        const value = matrix.cells[yCat.id]?.[xCat.id] ?? 0;
        const intensity = matrix.max.value > 0 ? value / matrix.max.value : 0;
        const isStrong = intensity > 0.55;
        return (
          <Tooltip
            key={xCat.id}
            arrow
            enterDelay={TOOLTIP_DELAY}
            enterNextDelay={TOOLTIP_DELAY}
            title={t("cell_tooltip", {
              x: xCat.label,
              y: yCat.label,
              xAxis: xAxis.label,
              yAxis: yAxis.label,
              count: formatCount(value),
              percent: formatPercent(value / matrix.count),
            })}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 32,
                borderRadius: 1,
                bgcolor: value > 0 ? safeAlpha(color, 0.12 + 0.88 * intensity) : "rgba(128,128,128,0.08)",
                color: isStrong ? strongTextColor : "text.primary",
                fontWeight: isStrong ? "bold" : undefined,
                fontSize: "0.85rem",
              }}
            >
              {value > 0 ? formatCount(value) : ""}
            </Box>
          </Tooltip>
        );
      })}
      <HeatmapTotalCell value={matrix.rowTotals[yCat.id] ?? 0} total={matrix.count} />
    </>
  );
}

function HeatmapAxisLabel({ category, label, centered = false }) {
  const text = category?.label ?? label;
  let content = text;
  if (category?.difficulty) {
    content = <DifficultyChip difficulty={category.difficulty} short />;
  }
  if (category?.description) {
    content = (
      <Tooltip title={category.description} arrow enterDelay={TOOLTIP_DELAY}>
        <span>{content}</span>
      </Tooltip>
    );
  }
  return (
    <Typography
      variant="body2"
      component="div"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: centered ? "center" : "flex-end",
        whiteSpace: "nowrap",
        pr: centered ? 0 : 1,
        fontWeight: category ? undefined : "bold",
      }}
    >
      {content}
    </Typography>
  );
}

function HeatmapTotalCell({ value, total, bold = false }) {
  return (
    <Tooltip title={formatPercent(total > 0 ? value / total : 0)} arrow enterDelay={TOOLTIP_DELAY}>
      <Typography
        variant="body2"
        component="div"
        color="text.secondary"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 32,
          px: 1,
          fontWeight: bold ? "bold" : undefined,
        }}
      >
        {formatCount(value)}
      </Typography>
    </Tooltip>
  );
}
//#endregion

//#region CategoryStats
function CategoryStats({ category, stats }) {
  const valueTags = category.tags.filter((tag) => !isImplicitTag(tag));
  const flagTags = category.tags.filter((tag) => isImplicitTag(tag));
  const color = getTagCategoryColor(category);

  return (
    <Stack direction="column" gap={1}>
      <ShareLegend color={color} />
      <Grid container spacing={2}>
        {valueTags.map((tag) => (
          <Grid key={tag.id} xs={12} md={6}>
            <TagStatsCard tag={tag} stats={stats} color={color} />
          </Grid>
        ))}
        {flagTags.length > 0 && (
          <Grid xs={12} md={6}>
            <FlagStatsCard tags={flagTags} stats={stats} color={color} />
          </Grid>
        )}
      </Grid>
    </Stack>
  );
}

function ShareLegend({ color }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info.tag_stats" });
  return (
    <Stack direction="row" gap={2} alignItems="center" flexWrap="wrap">
      <Stack direction="row" gap={0.75} alignItems="center">
        <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: color }} />
        <Typography variant="body2">{t("legend_player")}</Typography>
      </Stack>
      <Tooltip title={t("legend_community_tooltip")} arrow enterDelay={TOOLTIP_DELAY}>
        <Stack direction="row" gap={0.75} alignItems="center">
          <Box sx={{ width: 3, height: 18, bgcolor: "text.primary" }} />
          <Typography variant="body2" sx={{ textDecoration: "underline dotted" }}>
            {t("legend_community")}
          </Typography>
        </Stack>
      </Tooltip>
    </Stack>
  );
}

function TagStatsCard({ tag, stats, color }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info.tag_stats" });
  const playerTotal = stats.tagCounts[tag.id] ?? 0;
  const communityTotal = stats.community.tags[tag.id] ?? 0;

  const rows = tag.values.map((value) => {
    const weight = stats.valueWeights[value.id] ?? 0;
    return {
      key: value.id,
      label: value.name,
      description: getTagValueDescription(tag, value),
      weight,
      share: playerTotal > 0 ? weight / playerTotal : 0,
      communityShare: communityTotal > 0 ? (stats.community.values[value.id] ?? 0) / communityTotal : 0,
    };
  });

  const favorite = playerTotal > 0 ? rows.reduce((best, row) => (row.weight > best.weight ? row : best)) : null;
  const standout = getStandoutRow(rows);

  return (
    <BorderedBox sx={{ p: 1.5, height: "100%", boxSizing: "border-box" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1}>
        <Tooltip title={tag.description} arrow enterDelay={TOOLTIP_DELAY}>
          <Typography variant="h6">{tag.name}</Typography>
        </Tooltip>
        <Typography variant="body2" color="text.secondary">
          {t("clears", { count: playerTotal })}
        </Typography>
      </Stack>
      {playerTotal === 0 ? (
        <Typography color="text.secondary">{t("no_tag_data")}</Typography>
      ) : (
        <>
          <Stack direction="column" gap={0.25} sx={{ mb: 1 }}>
            {tag.is_ordinal ? (
              <Typography variant="body2">
                {t("average", {
                  value: getOrdinalAverageLabel(rows, "share"),
                  community: getOrdinalAverageLabel(rows, "communityShare"),
                })}
              </Typography>
            ) : (
              <Typography variant="body2">
                {t("favorite", { value: favorite.label, percent: formatPercent(favorite.share) })}
              </Typography>
            )}
            {standout && (
              <Typography variant="body2">
                {t("standout", { value: standout.label, factor: formatFactor(standout) })}
              </Typography>
            )}
          </Stack>
          <Stack direction="column" gap={0.5}>
            {rows.map((row) => (
              <ShareRow key={row.key} row={row} color={color} highlighted={row === favorite} />
            ))}
          </Stack>
        </>
      )}
    </BorderedBox>
  );
}

function FlagStatsCard({ tags, stats, color }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info.tag_stats" });
  const communityTotal = stats.community.total;
  const rows = tags.map((tag) => {
    const value = tag.values[0];
    const weight = stats.valueWeights[value.id] ?? 0;
    return {
      key: tag.id,
      label: tag.name,
      description: getTagValueDescription(tag, value),
      weight,
      share: weight / stats.tagged,
      communityShare: communityTotal > 0 ? (stats.community.values[value.id] ?? 0) / communityTotal : 0,
    };
  });

  return (
    <BorderedBox sx={{ p: 1.5, height: "100%", boxSizing: "border-box" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1}>
        <Typography variant="h6">{t("flags_title")}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t("clears", { count: stats.tagged })}
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t("flags_description")}
      </Typography>
      <Stack direction="column" gap={0.5}>
        {rows.map((row) => (
          <ShareRow key={row.key} row={row} color={color} />
        ))}
      </Stack>
    </BorderedBox>
  );
}

function ShareRow({ row, color, highlighted = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info.tag_stats" });
  const tooltip = (
    <Stack direction="column" gap={0.25}>
      <Typography variant="body2" fontWeight="bold">
        {row.label}
      </Typography>
      {row.description && <Typography variant="caption">{row.description}</Typography>}
      <Typography variant="caption">
        {t("row_player", { count: formatCount(row.weight), percent: formatPercent(row.share) })}
      </Typography>
      <Typography variant="caption">{t("row_community", { percent: formatPercent(row.communityShare) })}</Typography>
      {row.communityShare > 0 && row.weight > 0 && (
        <Typography variant="caption">{t("row_factor", { factor: formatFactor(row) })}</Typography>
      )}
    </Stack>
  );

  return (
    <Tooltip title={tooltip} arrow placement="top" enterDelay={TOOLTIP_DELAY} enterNextDelay={TOOLTIP_DELAY}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography
          variant="body2"
          noWrap
          sx={{ width: 125, flexShrink: 0, fontWeight: highlighted ? "bold" : undefined }}
        >
          {row.label}
        </Typography>
        <Box sx={{ position: "relative", flex: 1, height: 14, borderRadius: 1, bgcolor: "rgba(128,128,128,0.15)" }}>
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${Math.min(row.share, 1) * 100}%`,
              borderRadius: 1,
              bgcolor: color,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: -3,
              bottom: -3,
              left: `calc(${Math.min(row.communityShare, 1) * 100}% - 1.5px)`,
              width: 3,
              bgcolor: "text.primary",
              opacity: 0.8,
            }}
          />
        </Box>
        <Typography
          variant="body2"
          sx={{ width: 40, flexShrink: 0, textAlign: "right", fontWeight: highlighted ? "bold" : undefined }}
        >
          {formatPercent(row.share)}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
//#endregion

//#region Utils
function getStatsCategories(lookup) {
  if (!lookup) return [];
  return lookup.categories.filter((c) => !c.is_archived && (c.tags?.length ?? 0) > 0);
}

// Resolves the consensus value ids from the API into per-tag weights. Tied values of 'single' tags split the weight.
function buildPlayerTagStats(data, lookup) {
  const challenges = [];
  const tagCounts = {};
  const valueWeights = {};
  for (const [difficultyId, valueIds] of data.challenges) {
    const idsByTag = {};
    for (const valueId of valueIds) {
      const info = lookup.valuesById[valueId];
      if (!info) continue;
      (idsByTag[info.tag.id] ??= []).push(valueId);
    }
    const weights = {};
    for (const [tagId, ids] of Object.entries(idsByTag)) {
      const tag = lookup.tagsById[tagId].tag;
      const weight = tag.selection_mode === "multi" ? 1 : 1 / ids.length;
      weights[tagId] = ids.map((valueId) => ({ id: valueId, weight }));
      tagCounts[tagId] = (tagCounts[tagId] ?? 0) + 1;
      for (const valueId of ids) {
        valueWeights[valueId] = (valueWeights[valueId] ?? 0) + weight;
      }
    }
    if (Object.keys(weights).length === 0) continue;
    challenges.push({ difficultyId, weights });
  }
  return {
    total: data.total_clears,
    tagged: challenges.length,
    challenges,
    tagCounts,
    valueWeights,
    community: data.community,
  };
}

// Prefers Length (x) against the other common ordinal tag (y), otherwise falls back to any ordinal tags or tiers
function getDefaultHeatmapAxes(ordinalTags) {
  const candidates = [...ordinalTags.filter((tag) => tag.is_common), ...ordinalTags.filter((tag) => !tag.is_common)];
  const x = candidates.find((tag) => tag.name.toLowerCase() === "length") ?? candidates[0];
  const y = candidates.find((tag) => tag !== x);
  return [x ? "tag-" + x.id : TIER_AXIS, y ? "tag-" + y.id : TIER_AXIS];
}

function getHeatmapAxis(key, stats, lookup, difficulties, t) {
  if (key === TIER_AXIS) {
    const present = new Set(stats.challenges.map((c) => c.difficultyId));
    const categories = difficulties
      .filter((d) => present.has(d.id))
      .sort((a, b) => a.sort - b.sort)
      .map((d) => ({ id: d.id, label: getDifficultyNameShort(d), difficulty: d }));
    return {
      key,
      isTier: true,
      label: t("tier"),
      categories,
      getWeights: (challenge) => [{ id: challenge.difficultyId, weight: 1 }],
    };
  }

  const tagId = parseInt(key.substring("tag-".length));
  const tag = lookup.tagsById[tagId]?.tag;
  if (!tag) return null;
  return {
    key,
    isTier: false,
    label: tag.name,
    categories: tag.values.map((value) => ({
      id: value.id,
      label: value.name,
      description: getTagValueDescription(tag, value),
    })),
    getWeights: (challenge) => challenge.weights[tagId] ?? [],
  };
}

function buildHeatmapMatrix(stats, xAxis, yAxis) {
  const cells = {};
  const rowTotals = {};
  const colTotals = {};
  let count = 0;
  for (const challenge of stats.challenges) {
    const xWeights = xAxis.getWeights(challenge);
    const yWeights = yAxis.getWeights(challenge);
    if (xWeights.length === 0 || yWeights.length === 0) continue;
    count++;
    for (const x of xWeights) {
      for (const y of yWeights) {
        const weight = x.weight * y.weight;
        cells[y.id] ??= {};
        cells[y.id][x.id] = (cells[y.id][x.id] ?? 0) + weight;
        rowTotals[y.id] = (rowTotals[y.id] ?? 0) + weight;
        colTotals[x.id] = (colTotals[x.id] ?? 0) + weight;
      }
    }
  }

  let max = { value: 0, x: null, y: null };
  for (const yCat of yAxis.categories) {
    for (const xCat of xAxis.categories) {
      const value = cells[yCat.id]?.[xCat.id] ?? 0;
      if (value > max.value) max = { value, x: xCat, y: yCat };
    }
  }
  const hasFractions = [...Object.values(rowTotals), ...Object.values(colTotals)].some(
    (value) => !Number.isInteger(Math.round(value * 1000) / 1000),
  );
  return { cells, rowTotals, colTotals, count, max, hasFractions };
}

function getAxisAverageLabel(axis, totals) {
  const rows = axis.categories.map((c) => ({ label: c.label, share: totals[c.id] ?? 0 }));
  return getOrdinalAverageLabel(rows, "share");
}

// Weighted mean of the value positions, rounded to the nearest value
function getOrdinalAverageLabel(rows, shareKey) {
  const total = rows.reduce((sum, row) => sum + row[shareKey], 0);
  if (total <= 0) return "-";
  const mean = rows.reduce((sum, row, index) => sum + row[shareKey] * index, 0) / total;
  return rows[Math.min(rows.length - 1, Math.max(0, Math.round(mean)))].label;
}

// The value this player clears most disproportionately often compared to the average clear
function getStandoutRow(rows) {
  let best = null;
  for (const row of rows) {
    if (row.weight < STANDOUT_MIN_CLEARS || row.communityShare <= 0) continue;
    const factor = row.share / row.communityShare;
    if (factor >= STANDOUT_MIN_FACTOR && (best === null || factor > best.share / best.communityShare)) {
      best = row;
    }
  }
  return best;
}

function formatFactor(row) {
  return (row.share / row.communityShare).toFixed(1);
}

function formatPercent(value) {
  const percent = value * 100;
  if (percent > 0 && percent < 1) return "<1%";
  return Math.round(percent) + "%";
}

function formatCount(value) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? rounded : rounded.toFixed(1);
}
//#endregion

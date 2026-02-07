import { useTranslation } from "react-i18next";
import { getQueryData, useGetAllDifficulties, useGetStatsMonthlyTierClears } from "../../hooks/useApi";
import { ErrorDisplay, getErrorFromMultiple, LoadingSpinner } from "../basic";
import { Divider, Stack, Typography, useTheme } from "@mui/material";
import { getDifficultyName } from "../../util/data_util";
import { useAppSettings } from "../../hooks/AppSettingsProvider";
import { getNewDifficultyColors } from "../../util/constants";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TabMonthlyTierClears() {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.historical_clears" });
  const queryDiff = useGetAllDifficulties();

  if ([queryDiff].some((q) => q.isLoading)) {
    return <LoadingSpinner />;
  } else if ([queryDiff].some((q) => q.isError)) {
    const error = getErrorFromMultiple(queryDiff);
    return <ErrorDisplay error={error} />;
  }

  const difficulties = getQueryData(queryDiff);

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h4" gutterBottom>
        {t("header")}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t("text")}
      </Typography>
      <Stack direction="column" gap={1}>
        <Typography variant="h5">{t("total_submissions")}</Typography>
        <TabMonthlyTierClearsSingleChart difficulty={null} />
      </Stack>
      <Divider sx={{ my: 2 }} />
      {difficulties.map((difficulty) => (
        <Stack key={difficulty.id} direction="column" gap={1}>
          <Typography variant="h5">{getDifficultyName(difficulty)}</Typography>
          <TabMonthlyTierClearsSingleChart difficulty={difficulty} />
        </Stack>
      ))}
    </Stack>
  );
}

function TabMonthlyTierClearsSingleChart({ difficulty }) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.historical_clears" });
  const { settings } = useAppSettings();
  const theme = useTheme();
  const queryData = useGetStatsMonthlyTierClears();

  if ([queryData].some((q) => q.isLoading)) {
    return <LoadingSpinner />;
  } else if ([queryData].some((q) => q.isError)) {
    const error = getErrorFromMultiple(queryData);
    return <ErrorDisplay error={error} />;
  }

  const monthlyClears = getQueryData(queryData);

  const getChartDifficultyColor = (id) => {
    if (id === "total") {
      return theme.palette.text.primary;
    } else {
      return getNewDifficultyColors(settings, id).color;
    }
  };

  const data = [];
  monthlyClears.forEach((entry, index) => {
    //Clean the date string. Current it looks like "2024-08-01 00:00"
    //It should look like "2024-08"
    const cleanedDate = entry.date.substring(0, 7);
    const id = difficulty?.id || "total";
    const value =
      id === "total"
        ? Object.keys(entry)
            .filter((key) => !isNaN(key))
            .reduce((acc, key) => acc + entry[key], 0)
        : entry[id] || 0;
    data.push({
      [id]: value,
      date: cleanedDate,
      index: index,
    });
  });

  return (
    <Stack direction="column" gap={1}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} fill={theme.palette.stats.chartBackdrop} />
          <XAxis dataKey="date" tick={{ fill: theme.palette.text.primary }} angle={0} />
          <YAxis tick={{ fill: theme.palette.text.primary }} />
          <Legend />
          <Tooltip allowEscapeViewBox contentStyle={{ color: "black" }} itemStyle={{ color: "black" }} />
          <Line
            type="monotone"
            dataKey={difficulty?.id || "total"}
            stroke={getChartDifficultyColor(difficulty?.id || "total")}
            strokeWidth={3}
            name={difficulty ? getDifficultyName(difficulty) : t("total_submissions")}
          />
        </LineChart>
      </ResponsiveContainer>
    </Stack>
  );
}

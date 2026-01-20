import { Trans, useTranslation } from "react-i18next";
import { getQueryData, useGetAllDifficulties, useGetStatsMisc } from "../../hooks/useApi";
import { ErrorDisplay, getErrorFromMultiple, LoadingSpinner } from "../../components/BasicComponents";
import { Stack, Typography, useTheme } from "@mui/material";
import { getDifficultyName } from "../../util/data_util";
import { DIFF_CONSTS } from "../../util/constants";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TabMisc({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.misc" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const theme = useTheme();
  const query = useGetStatsMisc();
  const queryDiff = useGetAllDifficulties();

  if ([query, queryDiff].some((q) => q.isLoading)) {
    return <LoadingSpinner />;
  } else if ([query, queryDiff].some((q) => q.isError)) {
    const error = getErrorFromMultiple(query, queryDiff);
    return <ErrorDisplay error={error} />;
  }

  const difficulties = getQueryData(queryDiff);
  const {
    suggestions: { accepted, rejected },
    submissions: { since_release },
    difficulties: { distinct_players },
    players: { total },
  } = getQueryData(query);

  //Chart 1: Suggestions accepted vs. rejected
  const dataSuggestions = [
    { name: t("suggestions.accepted"), value: accepted, color: theme.palette.success.main },
    { name: t("suggestions.rejected"), value: rejected, color: theme.palette.error.main },
  ];

  const distinctPlayerFilteredKeys = Object.keys(distinct_players).filter(
    (key) => parseInt(key) !== DIFF_CONSTS.UNTIERED_ID,
  );

  //Chart 2: % of players that have cleared each difficulty
  const dataDifficulties = distinctPlayerFilteredKeys.map((diff_id) => ({
    difficulty: difficulties.find((d) => d.id === parseInt(diff_id)),
    name: getDifficultyName(difficulties.find((d) => d.id === parseInt(diff_id))),
    value: parseFloat(((distinct_players[diff_id] / total) * 100).toFixed(2)),
  }));

  //Sort dataDifficulties by entry.difficulty.sort DESC
  dataDifficulties.sort((a, b) => b.difficulty.sort - a.difficulty.sort);

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h4" gutterBottom>
        {t("header")}
      </Typography>

      <Typography variant="h5">{t("suggestions.header")}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart
          data={dataSuggestions}
          margin={{
            top: 20,
            right: 30,
            left: 5,
            bottom: 5,
          }}
        >
          <Legend />
          <Tooltip allowEscapeViewBox contentStyle={{ color: "black" }} itemStyle={{ color: "black" }} />
          <Pie
            dataKey="value"
            nameKey="name"
            data={dataSuggestions}
            fill="#8884d8"
            label
            startAngle={90}
            endAngle={360 + 90}
          >
            {dataSuggestions.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <Typography variant="h5" sx={{ mt: 2 }}>
        {t("submissions.header")}
      </Typography>
      <Typography variant="body1">
        <Trans t={t} i18nKey="submissions.text" values={{ count: since_release }} />
      </Typography>

      <Typography variant="h5" sx={{ mt: 2 }}>
        {t("difficulties.header")}
      </Typography>
      <Typography variant="body1">{t("difficulties.text")}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={dataDifficulties}
          margin={{
            top: 20,
            right: 30,
            left: 5,
            bottom: 5,
          }}
        >
          <XAxis dataKey="name" tick={{ fill: theme.palette.text.primary }} />
          <YAxis type="number" domain={[0, 100]} tick={{ fill: theme.palette.text.primary }} />
          <Legend />
          <Tooltip allowEscapeViewBox contentStyle={{ color: "black" }} itemStyle={{ color: "black" }} />
          <Bar
            dataKey="value"
            name={t("difficulties.axis_label")}
            unit="%"
            fill={theme.palette.primary.main}
          />
        </BarChart>
      </ResponsiveContainer>
    </Stack>
  );
}

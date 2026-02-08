import { useTranslation } from "react-i18next";
import {
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
  useTheme,
} from "@mui/material";
import { PieChart } from "@mui/x-charts";

import { getQueryData, useGetVerifierStats } from "../../hooks/useApi";
import { ErrorDisplay, getErrorFromMultiple, LoadingSpinner } from "../basic";
import { PlayerChip } from "../goldberries";

export function TabVerifierStats({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.verifier_stats" });
  const theme = useTheme();
  const query = useGetVerifierStats();

  if ([query].some((q) => q.isLoading)) {
    return <LoadingSpinner />;
  } else if ([query].some((q) => q.isError)) {
    const error = getErrorFromMultiple(query);
    return <ErrorDisplay error={error} />;
  }

  const data = getQueryData(query);

  const dataMostVerified = data.verified_submissions.map((entry) => ({
    label: entry.player.name,
    value: entry.count,
    player: entry.player,
    color: entry.player.account.name_color_start,
  }));
  const totalVerified = data.verified_submissions.reduce((acc, entry) => acc + entry.count, 0);

  const dataMostCreated = data.created_objects.map((entry) => ({
    label: entry.player.name,
    campaigns: entry.campaigns,
    maps: entry.maps,
    challenges: entry.challenges,
    total: entry.total,
    player: entry.player,
  }));
  const totalCreatedCampaigns = dataMostCreated.reduce((acc, entry) => acc + entry.campaigns, 0);
  const totalCreatedMaps = dataMostCreated.reduce((acc, entry) => acc + entry.maps, 0);
  const totalCreatedChallenges = dataMostCreated.reduce((acc, entry) => acc + entry.challenges, 0);
  const totalCreated = dataMostCreated.reduce((acc, entry) => acc + entry.total, 0);

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h4" gutterBottom>
        {t("header")}
      </Typography>

      <Typography variant="h5" gutterBottom>
        {t("most_verified.header")}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t("most_verified.text")}
      </Typography>

      <Grid container spacing={1}>
        <Grid item xs={12} sm={6} display="flex" alignItems="center">
          <PieChart
            series={[
              {
                arcLabel: (item) => item.label,
                arcLabelMinAngle: 45,
                data: dataMostVerified,
                highlightScope: { faded: "global", highlighted: "item" },
                faded: {
                  additionalRadius: -10,
                  color: "gray",
                },
              },
            ]}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
            margin={{ right: 0 }}
            height={500}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell size="1">Verifier</TableCell>
                  <TableCell align="center">%</TableCell>
                  <TableCell align="right">Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataMostVerified.map((row) => (
                  <TableRow
                    key={row.label}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: theme.palette.background.lightSubtle,
                      },
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <PlayerChip player={row.player} size="small" />
                    </TableCell>
                    <TableCell align="center">{((row.value / totalVerified) * 100).toFixed(2)}%</TableCell>
                    <TableCell align="right">{row.value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        {t("most_created.header")}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t("most_created.text")}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell size="1">Verifier</TableCell>
              <TableCell align="center">Campaigns</TableCell>
              <TableCell align="center">Maps</TableCell>
              <TableCell align="center">Challenges</TableCell>
              <TableCell align="center">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataMostCreated.map((row) => (
              <TableRow
                key={row.label}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: theme.palette.background.lightSubtle,
                  },
                  "&:last-child td, &:last-child th": { border: 0 },
                }}
              >
                <TableCell component="th" scope="row">
                  <PlayerChip player={row.player} size="small" />
                </TableCell>
                <TableCell align="center">{row.campaigns.toLocaleString()}</TableCell>
                <TableCell align="center">{row.maps.toLocaleString()}</TableCell>
                <TableCell align="center">{row.challenges.toLocaleString()}</TableCell>
                <TableCell align="center">{row.total.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            <TableRow
              sx={{
                "&:nth-of-type(odd)": {
                  backgroundColor: theme.palette.background.lightSubtle,
                },
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell component="th" scope="row">
                Total
              </TableCell>
              <TableCell align="center">{totalCreatedCampaigns}</TableCell>
              <TableCell align="center">{totalCreatedMaps}</TableCell>
              <TableCell align="center">{totalCreatedChallenges}</TableCell>
              <TableCell align="center">{totalCreated}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

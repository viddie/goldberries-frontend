import { useTranslation } from "react-i18next";
import { getQueryData, useGetStatsMostGoldened } from "../../hooks/useApi";
import {
  ErrorDisplay,
  getErrorFromMultiple,
  LoadingSpinner,
  StyledLink,
} from "../../components/basic_components";
import {
  Button,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { CampaignIcon } from "../../components/goldberries_components";
import dayjs from "dayjs";
import { getCampaignName, getMapName } from "../../util/data_util";

export function TabMostGoldened() {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.most_goldened" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [date, setDate] = useState(new Date().toISOString());
  //Format date into a string like 2024-08-02
  const dateFormatted = date ? date.split("T")[0] : null;

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h4" gutterBottom>
        {t("header")}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t("text")}
      </Typography>
      <Typography variant="body1">{t("time_machine")}</Typography>
      <DatePicker
        label={t("date")}
        value={date ? dayjs(date) : null}
        onChange={(value) => {
          if (value.isValid()) {
            setDate(value.toISOString());
          }
        }}
        minDate={dayjs(new Date(2018, 9, 12, 12))}
        maxDate={dayjs(new Date())}
        sx={{ mt: 1, maxWidth: "200px" }}
      />
      <Divider sx={{ my: 1 }} />
      <TabMostGoldenedCampaigns date={dateFormatted} />
      <Divider sx={{ my: 1 }} />
      <TabMostGoldenedMaps date={dateFormatted} />
    </Stack>
  );
}
const SHOW_AMOUNT = 10;
function TabMostGoldenedCampaigns({ date }) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [expanded, setExpanded] = useState(false);
  const query = useGetStatsMostGoldened(date);

  if ([query].some((q) => q.isLoading)) {
    return <LoadingSpinner />;
  } else if ([query].some((q) => q.isError)) {
    const error = getErrorFromMultiple(query);
    return <ErrorDisplay error={error} />;
  }

  const { campaigns, maps } = getQueryData(query);
  const campaignsSliced = expanded ? campaigns : campaigns.slice(0, SHOW_AMOUNT);

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h5">{t_g("campaign", { count: 30 })}</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={1} sx={{ pr: 0 }}></TableCell>
              <TableCell>{t_g("campaign", { count: 1 })}</TableCell>
              <TableCell width={1}>{t_g("submission", { count: 30 })}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaignsSliced.map((campaignEntry, index) => (
              <TableRow key={campaignEntry.campaign.id}>
                <TableCell sx={{ pr: 0 }}>
                  <Typography variant="body1" fontWeight="bold">
                    #{index + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StyledLink to={`/campaign/${campaignEntry.campaign.id}`}>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Typography variant="body1">{getCampaignName(campaignEntry.campaign, t_g)}</Typography>
                      <CampaignIcon campaign={campaignEntry.campaign} height="1.3em" />
                    </Stack>
                  </StyledLink>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {campaignEntry.submission_count}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {campaigns.length > SHOW_AMOUNT && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Button size="small" fullWidth onClick={() => setExpanded(!expanded)}>
                    {t(expanded ? "show_less" : "show_all", { count: campaigns.length })}
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
function TabMostGoldenedMaps({ date }) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [expanded, setExpanded] = useState(false);
  const query = useGetStatsMostGoldened(date);

  if ([query].some((q) => q.isLoading)) {
    return <LoadingSpinner />;
  } else if ([query].some((q) => q.isError)) {
    const error = getErrorFromMultiple(query);
    return <ErrorDisplay error={error} />;
  }

  const { campaigns, maps } = getQueryData(query);
  const mapsSliced = expanded ? maps : maps.slice(0, SHOW_AMOUNT);

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h5">{t_g("map", { count: 30 })}</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={1} sx={{ pr: 0 }}></TableCell>
              <TableCell>{t_g("map", { count: 1 })}</TableCell>
              <TableCell>{t_g("campaign", { count: 1 })}</TableCell>
              <TableCell width={1}>{t_g("submission", { count: 30 })}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mapsSliced.map((mapEntry, index) => (
              <TableRow key={mapEntry.map.id}>
                <TableCell sx={{ pr: 0 }}>
                  <Typography variant="body1" fontWeight="bold">
                    #{index + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StyledLink to={`/map/${mapEntry.map.id}`}>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Typography variant="body1">
                        {getMapName(mapEntry.map, mapEntry.map.campaign)}
                      </Typography>
                    </Stack>
                  </StyledLink>
                </TableCell>
                <TableCell>
                  <StyledLink to={`/map/${mapEntry.map.id}`}>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Typography variant="body1">
                        {getCampaignName(mapEntry.map.campaign, t_g, true)}
                      </Typography>
                      <CampaignIcon campaign={mapEntry.map.campaign} height="1.3em" />
                    </Stack>
                  </StyledLink>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {mapEntry.submission_count}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {maps.length > SHOW_AMOUNT && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Button size="small" fullWidth onClick={() => setExpanded(!expanded)}>
                    {t(expanded ? "show_less" : "show_all", { count: maps.length })}
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

import { useTranslation } from "react-i18next";
import { getQueryData, useGetStatsCollectibleCounts } from "../../hooks/useApi";
import { ErrorDisplay, LoadingSpinner } from "../basic";
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { COLLECTIBLES, getCollectibleIcon, getCollectibleName } from "../forms/Map";
import { OtherIcon } from "../goldberries";

const reducePadding = { px: 0.5 };

export function TabCollectibleCounts() {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.collectible_counts" });

  const query = useGetStatsCollectibleCounts();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const data = getQueryData(query);

  // Calculate total
  const totalCollectibles = data.reduce((sum, entry) => sum + entry.total_amount, 0);

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h4" gutterBottom>
        {t("header")}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t("text")}
      </Typography>

      <Stack direction="row" justifyContent="space-around">
        <TableContainer sx={{ width: "fit-content" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={1}></TableCell>
                <TableCell width={1} sx={reducePadding}></TableCell>
                <TableCell sx={reducePadding}>{t("collectible")}</TableCell>
                <TableCell width={1}>{t("count")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((entry, index) => {
                const collectibleId = entry.collectible_id.toString();
                const collectible = COLLECTIBLES.find((c) => c.value === collectibleId);
                const icon = collectible ? getCollectibleIcon(collectibleId) : null;
                const name = collectible ? getCollectibleName(collectibleId) : `Unknown (${collectibleId})`;

                return (
                  <TableRow key={entry.collectible_id}>
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight="bold">
                        #{index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={reducePadding}>
                      {icon && (
                        <Stack direction="row" alignItems="center" justifyContent="center">
                          <OtherIcon url={icon} height="26px" />
                        </Stack>
                      )}
                    </TableCell>
                    <TableCell sx={reducePadding}>
                      <Typography variant="body1">{name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {entry.total_amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant="body1" fontWeight="bold">
                    {t("total")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {totalCollectibles.toLocaleString()}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Stack>
  );
}

import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { getQueryData, useGetMapData } from "../../hooks/useApi";
import { ErrorDisplay, LoadingSpinner } from "../basic";

export function MapDataDialog({ mapId, hash, campaignId }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.map_data" });

  const query = useGetMapData(mapId, { campaignId, hash });
  const mapData = getQueryData(query);

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t("title")}</Typography>

      {query.isLoading && <LoadingSpinner />}
      {query.isError && <ErrorDisplay error={query.error} />}
      {mapData && (
        <Box
          component="pre"
          sx={{
            p: 1.5,
            borderRadius: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            overflow: "auto",
            maxHeight: 500,
            fontSize: "0.8rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {JSON.stringify(mapData, null, 2)}
        </Box>
      )}
    </Stack>
  );
}

import {
  Box,
  Collapse,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { faDatabase, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../hooks/AuthProvider";
import { getQueryData, useGetCampaignData, useGetCampaignDataMapping } from "../../hooks/useApi";
import { ErrorDisplay, LoadingSpinner, StyledLink } from "../basic";
import { CustomModal, useModal } from "../../hooks/useModal";
import { getMapName } from "../../util/data_util";

import { MapDataDialog } from "./MapDataDialog";

export function CampaignDataDialog({ campaignId, campaign }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data" });
  const auth = useAuth();

  const dataQuery = useGetCampaignData(campaignId);
  const mappingQuery = useGetCampaignDataMapping(campaignId);

  const campaignData = getQueryData(dataQuery);
  const mappingData = getQueryData(mappingQuery);

  // Build a lookup of map_id -> map object from the campaign for name resolution
  const mapsById = {};
  if (campaign?.maps) {
    campaign.maps.forEach((map) => {
      mapsById[map.id] = map;
    });
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t("title")}</Typography>

      {/* Structure (index.json) */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
          {t("structure_title")}
        </Typography>
        {dataQuery.isLoading && <LoadingSpinner />}
        {dataQuery.isError && <ErrorDisplay error={dataQuery.error} />}
        {campaignData && (
          <CampaignStructureTable
            entries={campaignData}
            mapsById={mapsById}
            campaignId={campaignId}
            campaign={campaign}
          />
        )}
      </Box>

      {/* Mapping (mapping.json) - Helper+ only */}
      <Collapse in={auth.hasHelperPriv}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            {t("mapping_title")}
          </Typography>
          {mappingQuery.isLoading && <LoadingSpinner />}
          {mappingQuery.isError && (
            <Typography variant="body2" color="text.secondary">
              No mapping file available for this campaign.
            </Typography>
          )}
          {mappingData && (
            <Box
              component="pre"
              sx={{
                p: 1.5,
                borderRadius: 1,
                backgroundColor: "rgba(0,0,0,0.3)",
                overflow: "auto",
                maxHeight: 400,
                fontSize: "0.8rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {JSON.stringify(mappingData, null, 2)}
            </Box>
          )}
        </Box>
      </Collapse>
    </Stack>
  );
}

function CampaignStructureTable({ entries, mapsById, campaignId, campaign }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data.structure" });
  const mapDataModal = useModal();
  const [selectedEntry, setSelectedEntry] = useState(null);

  const openMapData = (entry) => {
    setSelectedEntry(entry);
    mapDataModal.open();
  };

  return (
    <>
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{t("col_name")}</TableCell>
              <TableCell>{t("col_path")}</TableCell>
              <TableCell width={1}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry, index) => (
              <CampaignStructureRow
                key={index}
                entry={entry}
                mapsById={mapsById}
                campaign={campaign}
                onOpenMapData={openMapData}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CustomModal modalHook={mapDataModal} options={{ hideFooter: true }} maxWidth="md">
        {selectedEntry && (
          <MapDataDialog
            mapId={selectedEntry.map_id ?? null}
            hash={selectedEntry.map_id ? null : selectedEntry.hash}
            campaignId={campaignId}
          />
        )}
      </CustomModal>
    </>
  );
}

function CampaignStructureRow({ entry, mapsById, campaign, onOpenMapData }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data.structure" });
  const isMatched = !!entry.map_id;
  const dbMap = isMatched ? mapsById[entry.map_id] : null;

  // Prefer database map name, fall back to index.json name, then "Unknown Map"
  const displayName = dbMap ? getMapName(dbMap, campaign) : entry.name || t("unknown_map");

  return (
    <TableRow sx={{ opacity: isMatched ? 1 : 0.7 }}>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={0.5}>
          {isMatched ? (
            <StyledLink to={"/map/" + entry.map_id}>{displayName}</StyledLink>
          ) : (
            <>
              <Typography variant="body2">{displayName}</Typography>
              <Tooltip title={t("unmatched_tooltip")} arrow>
                <span style={{ display: "inline-flex", cursor: "help" }}>
                  <FontAwesomeIcon icon={faQuestionCircle} size="xs" style={{ opacity: 0.6 }} />
                </span>
              </Tooltip>
            </>
          )}
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          {entry.path}
        </Typography>
      </TableCell>
      <TableCell>
        <IconButton size="small" onClick={() => onOpenMapData(entry)}>
          <FontAwesomeIcon icon={faDatabase} size="xs" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

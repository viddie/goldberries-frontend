import {
  Autocomplete,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { faChevronDown, faChevronRight, faQuestionCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useAuth } from "../../hooks/AuthProvider";
import {
  getQueryData,
  useGetCampaignData,
  useGetCampaignDataMapping,
  usePostCampaignDataMapping,
  useProcessCampaign,
} from "../../hooks/useApi";
import { LoadingSpinner, StyledLink } from "../basic";
import { CustomModal, useModal } from "../../hooks/useModal";
import { getMapName } from "../../util/data_util";

import { MapDataDialog } from "./MapDataDialog";

export function CampaignDataDialog({ campaignId, campaign }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data" });
  const auth = useAuth();

  const dataQuery = useGetCampaignData(campaignId);
  const mappingQuery = useGetCampaignDataMapping(campaignId);

  const campaignDataResponse = getQueryData(dataQuery);
  const campaignData = campaignDataResponse?.data ?? null;
  const campaignMeta = campaignDataResponse
    ? {
        status: campaignDataResponse.status,
        message: campaignDataResponse.message,
        binCount: campaignDataResponse.bin_count,
        unmatchedBinCount: campaignDataResponse.unmatched_bin_count,
        unmatchedMapCount: campaignDataResponse.unmatched_map_count,
      }
    : null;

  let mappingData = getQueryData(mappingQuery);
  if (mappingData !== null) {
    mappingData = mappingData.data; // unwrap from { data: {...} } structure for the editor
  }

  const { mutate: processCampaign, isLoading: isProcessing } = useProcessCampaign(() => {
    toast.success(t("process_success"));
  });

  // Build a lookup of map_id -> map object from the campaign for name resolution
  const mapsById = {};
  if (campaign?.maps) {
    campaign.maps.forEach((map) => {
      mapsById[map.id] = map;
    });
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">{t("title")}</Typography>
        {auth.hasHelperPriv && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => processCampaign(campaignId)}
            disabled={isProcessing}
          >
            {isProcessing ? t("processing") : t("process_button")}
          </Button>
        )}
      </Stack>

      {/* Structure (index.json) */}
      <Box>
        {dataQuery.isLoading && <LoadingSpinner />}
        {dataQuery.isError && (
          <Typography variant="body2" color="text.secondary">
            {t("not_available")}
          </Typography>
        )}
        {campaignMeta?.status === "error" && campaignMeta.message && (
          <Typography variant="body2" color="error">
            {campaignMeta.message}
          </Typography>
        )}
        {campaignMeta && campaignMeta.status === "ok" && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
            {t("bin_count", { count: campaignMeta.binCount })}
            {campaignMeta.unmatchedBinCount > 0 &&
              " · " + t("unmatched_bins", { count: campaignMeta.unmatchedBinCount })}
            {campaignMeta.unmatchedMapCount > 0 &&
              " · " + t("unmatched_maps", { count: campaignMeta.unmatchedMapCount })}
          </Typography>
        )}
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
      {auth.hasHelperPriv && (
        <MappingEditor
          campaignId={campaignId}
          campaign={campaign}
          campaignData={campaignData}
          mappingData={mappingData}
          mappingQuery={mappingQuery}
          mapsById={mapsById}
        />
      )}
    </Stack>
  );
}

//#region Structure Table
function CampaignStructureTable({ entries, mapsById, campaignId, campaign }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data.structure" });
  const mapDataModal = useModal();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showUnmatched, setShowUnmatched] = useState(false);

  const matchedEntries = entries.filter((e) => !!e.map_id);
  const unmatchedEntries = entries.filter((e) => !e.map_id);

  const openMapData = (entry) => {
    setSelectedEntry(entry);
    mapDataModal.open();
  };

  return (
    <>
      <TableContainer
        sx={{
          borderRadius: 1,
          backgroundColor: "rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Table size="small">
          <TableBody>
            {matchedEntries.map((entry, index) => (
              <CampaignStructureRow
                key={`matched-${index}`}
                entry={entry}
                mapsById={mapsById}
                campaign={campaign}
                onClick={() => openMapData(entry)}
              />
            ))}
            {unmatchedEntries.length > 0 && (
              <TableRow>
                <TableCell colSpan={2} sx={{ py: 0.5, borderBottom: showUnmatched ? undefined : "none" }}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setShowUnmatched(!showUnmatched)}
                    sx={{ textTransform: "none", fontSize: "0.8rem" }}
                  >
                    {showUnmatched
                      ? t("hide_unmatched")
                      : t("show_unmatched", { count: unmatchedEntries.length })}
                  </Button>
                </TableCell>
              </TableRow>
            )}
            {showUnmatched &&
              unmatchedEntries.map((entry, index) => (
                <CampaignStructureRow
                  key={`unmatched-${index}`}
                  entry={entry}
                  mapsById={mapsById}
                  campaign={campaign}
                  onClick={() => openMapData(entry)}
                />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CustomModal modalHook={mapDataModal} options={{ hideFooter: true }} maxWidth="lg">
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

function CampaignStructureRow({ entry, mapsById, campaign, onClick }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data.structure" });
  const isMatched = !!entry.map_id;
  const dbMap = isMatched ? mapsById[entry.map_id] : null;

  // Prefer database map name, fall back to index.json name, then "Unknown Map"
  const displayName = dbMap ? getMapName(dbMap, campaign) : entry.name || t("unknown_map");

  return (
    <TableRow
      hover
      onClick={onClick}
      sx={{
        cursor: "pointer",
        opacity: isMatched ? 1 : 0.7,
      }}
    >
      <TableCell>
        <Stack direction="row" alignItems="center" gap={0.5}>
          {isMatched ? (
            <StyledLink to={"/map/" + entry.map_id} onClick={(e) => e.stopPropagation()}>
              {displayName}
            </StyledLink>
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
      <TableCell align="right">
        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          {entry.path}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
//#endregion

//#region Mapping Editor
function MappingEditor({ campaignId, campaign, campaignData, mappingData, mappingQuery, mapsById }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data.mapping" });
  const [expanded, setExpanded] = useState(false);

  // Local state for the editable mapping: { "path": mapId, ... }
  const [localMapping, setLocalMapping] = useState(null);
  const [dirty, setDirty] = useState(false);

  // Initialize local mapping from server data when it arrives
  const effectiveMapping = localMapping ?? mappingData ?? {};

  const { mutate: saveMappingToServer, isLoading: isSaving } = usePostCampaignDataMapping(() => {
    setDirty(false);
    toast.success(t("save_success"));
  });

  // Get all bin paths from campaignData
  const allPaths = campaignData ? campaignData.map((e) => e.path) : [];

  // Paths already in the mapping
  const mappedPaths = Object.keys(effectiveMapping);

  // Map IDs already assigned in the mapping
  const mappedMapIds = new Set(Object.values(effectiveMapping));

  // Paths not yet in the mapping
  const unmappedPaths = allPaths.filter((p) => !mappedPaths.includes(p));

  // Maps from the campaign not yet assigned
  const availableMaps = campaign?.maps?.filter((m) => !mappedMapIds.has(m.id)) ?? [];

  const updateMapping = (newMapping) => {
    setLocalMapping(newMapping);
    setDirty(true);
  };

  const removeMapping = (path) => {
    const next = { ...effectiveMapping };
    delete next[path];
    updateMapping(next);
  };

  const addMapping = (path, mapId) => {
    const next = { ...effectiveMapping };
    next[path] = mapId;
    updateMapping(next);
  };

  const handleSave = () => {
    saveMappingToServer({ id: campaignId, data: effectiveMapping });
  };

  return (
    <Box>
      <Button
        size="small"
        variant="text"
        onClick={() => setExpanded(!expanded)}
        startIcon={<FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} size="xs" />}
        sx={{ textTransform: "none", mb: 0.5 }}
      >
        {t("toggle_label")}
      </Button>
      <Collapse in={expanded}>
        <Stack
          spacing={1.5}
          sx={{
            p: 1.5,
            borderRadius: 1,
            backgroundColor: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {mappingQuery.isLoading && <LoadingSpinner />}
          {mappingQuery.isError && (
            <Typography variant="body2" color="text.secondary">
              No mapping file exists yet. Add entries below to create one.
            </Typography>
          )}

          {/* Current mappings list */}
          {mappedPaths.length > 0 && (
            <Table size="small">
              <TableBody>
                {mappedPaths.map((path) => {
                  const mapId = effectiveMapping[path];
                  const map = mapsById[mapId];
                  const mapName = map ? getMapName(map, campaign) : `Map #${mapId}`;
                  return (
                    <TableRow key={path}>
                      <TableCell sx={{ py: 0.5, fontSize: "0.8rem", color: "text.secondary" }}>
                        {path}
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>→</TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: "0.8rem" }}>{mapName}</TableCell>
                      <TableCell sx={{ py: 0.5 }} width={1}>
                        <IconButton size="small" onClick={() => removeMapping(path)} color="error">
                          <FontAwesomeIcon icon={faTrash} size="xs" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {mappedPaths.length === 0 && !mappingQuery.isLoading && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              {t("no_entries")}
            </Typography>
          )}

          <Divider />

          {/* Add new mapping row */}
          <MappingAddRow
            unmappedPaths={unmappedPaths}
            availableMaps={availableMaps}
            campaign={campaign}
            onAdd={addMapping}
          />

          {/* Save button */}
          <Button variant="contained" size="small" onClick={handleSave} disabled={!dirty || isSaving}>
            {isSaving ? t("saving") : t("save")}
          </Button>
        </Stack>
      </Collapse>
    </Box>
  );
}

function MappingAddRow({ unmappedPaths, availableMaps, campaign, onAdd }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data.mapping" });
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedMap, setSelectedMap] = useState(null);

  const handleAdd = () => {
    if (!selectedPath || !selectedMap) return;
    onAdd(selectedPath, selectedMap.id);
    setSelectedPath(null);
    setSelectedMap(null);
  };

  return (
    <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
      <Autocomplete
        size="small"
        sx={{ minWidth: 200, flex: 1 }}
        options={unmappedPaths}
        value={selectedPath}
        onChange={(_, v) => setSelectedPath(v)}
        renderInput={(params) => <TextField {...params} label={t("select_bin")} />}
      />
      <Autocomplete
        size="small"
        sx={{ minWidth: 200, flex: 1 }}
        options={availableMaps}
        getOptionKey={(map) => map.id}
        getOptionLabel={(map) => {
          const oldPrefix = map.is_archived ? "[Old] " : "";
          return oldPrefix + map.name;
        }}
        value={selectedMap}
        onChange={(_, v) => setSelectedMap(v)}
        renderInput={(params) => <TextField {...params} label={t("select_map")} />}
      />
      <Button variant="outlined" size="small" onClick={handleAdd} disabled={!selectedPath || !selectedMap}>
        {t("add")}
      </Button>
    </Stack>
  );
}
//#endregion

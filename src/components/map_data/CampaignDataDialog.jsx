import {
  Autocomplete,
  Box,
  Button,
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
import { faPen, faQuestionCircle, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMediaQuery, useTheme } from "@mui/material";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useAuth } from "../../hooks/AuthProvider";
import {
  getQueryData,
  useDeleteCampaignData,
  useDeleteMapData,
  useGetCampaignData,
  usePostMap,
  usePostMapDataBin,
  useProcessCampaign,
} from "../../hooks/useApi";
import { LoadingSpinner, StyledLink } from "../basic";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";
import { getMapName } from "../../util/data_util";

import { MapDataDialog } from "./MapDataDialog";

export function CampaignDataDialog({ campaignId, campaign }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data" });
  const auth = useAuth();
  const [editMode, setEditMode] = useState(false);

  const dataQuery = useGetCampaignData(campaignId);

  const campaignDataResponse = getQueryData(dataQuery);
  const campaignData = campaignDataResponse?.data ?? null;
  const campaignMeta = campaignDataResponse
    ? {
        status: campaignDataResponse.status,
        message: campaignDataResponse.message,
        binCount: campaignDataResponse.bin_count,
      }
    : null;

  const { mutate: processCampaign, isLoading: isProcessing } = useProcessCampaign(() => {
    toast.success(t("process_success"));
  });

  const { mutate: deleteAllData, isLoading: isDeletingAll } = useDeleteCampaignData(() => {
    toast.success(t("delete_all_success"));
    setEditMode(false);
  });

  // Build lookups from campaign maps
  const mapsByBin = {};
  const mapsById = {};
  if (campaign?.maps) {
    campaign.maps.forEach((map) => {
      mapsById[map.id] = map;
      if (map.bin) {
        mapsByBin[map.bin] = map;
      }
    });
  }

  // Compute unmatched counts client-side
  const unmatchedBinCount = campaignData
    ? campaignData.filter((e) => !e.conversion_error && !mapsByBin[e.path]).length
    : 0;
  const unmatchedMapCount = campaign?.maps ? campaign.maps.filter((m) => !m.bin).length : 0;

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">{t("title")}</Typography>
        {auth.hasHelperPriv && (
          <Stack direction="row" gap={1}>
            <Button
              variant={editMode ? "contained" : "outlined"}
              size="small"
              onClick={() => setEditMode(!editMode)}
              startIcon={editMode ? undefined : <FontAwesomeIcon icon={faPen} size="xs" />}
            >
              {editMode ? t("exit_edit_button") : t("edit_button")}
            </Button>
            {!editMode && (
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
            {unmatchedBinCount > 0 && " · " + t("unmatched_bins", { count: unmatchedBinCount })}
            {unmatchedMapCount > 0 && " · " + t("unmatched_maps", { count: unmatchedMapCount })}
          </Typography>
        )}
        {campaignData && (
          <CampaignStructureTable
            entries={campaignData}
            mapsByBin={mapsByBin}
            campaignId={campaignId}
            campaign={campaign}
            editMode={editMode}
          />
        )}
      </Box>

      {/* Edit mode sections */}
      {editMode && (
        <>
          {/* Bin→Map assignments - Helper+ only */}
          {auth.hasHelperPriv && (
            <>
              <Divider />
              <MappingEditor
                campaignId={campaignId}
                campaign={campaign}
                campaignData={campaignData}
                mapsByBin={mapsByBin}
                mapsById={mapsById}
              />
            </>
          )}

          {/* Add .bin file */}
          <Divider />
          <AddBinSection campaignId={campaignId} />

          {/* Delete all data */}
          <Divider />
          <DeleteAllDataSection campaignId={campaignId} onDelete={deleteAllData} isDeleting={isDeletingAll} />
        </>
      )}
    </Stack>
  );
}

//#region Structure Table
function CampaignStructureTable({ entries, mapsByBin, campaignId, campaign, editMode }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data.structure" });
  const { t: t_cd } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data" });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const mapDataModal = useModal();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showUnmatched, setShowUnmatched] = useState(false);
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState(null);

  const { mutate: deleteMapData, isLoading: isDeleting } = useDeleteMapData(() => {
    toast.success(t_cd("delete_bin_success"));
  });

  const deleteBinModal = useModal(null, (cancelled) => {
    if (cancelled || !pendingDeleteEntry) return;
    const entry = pendingDeleteEntry;
    deleteMapData({
      binPath: entry.path,
      campaignId,
    });
    setPendingDeleteEntry(null);
  });

  const matchedEntries = entries.filter((e) => !e.conversion_error && !!mapsByBin[e.path]);
  const unmatchedEntries = entries.filter((e) => !e.conversion_error && !mapsByBin[e.path]);

  const openMapData = (entry) => {
    setSelectedEntry(entry);
    mapDataModal.open();
  };

  const handleDeleteBin = (entry, displayName) => {
    setPendingDeleteEntry(entry);
    deleteBinModal.open(displayName);
  };

  const showUnmatchedEntries = showUnmatched;

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
                mapsByBin={mapsByBin}
                campaign={campaign}
                onClick={() => openMapData(entry)}
                editMode={editMode}
                onDelete={handleDeleteBin}
                isDeleting={isDeleting}
              />
            ))}
            {unmatchedEntries.length > 0 && (
              <TableRow>
                <TableCell colSpan={3} sx={{ py: 0.5, borderBottom: showUnmatched ? undefined : "none" }}>
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
            {showUnmatchedEntries &&
              unmatchedEntries.map((entry, index) => (
                <CampaignStructureRow
                  key={`unmatched-${index}`}
                  entry={entry}
                  mapsByBin={mapsByBin}
                  campaign={campaign}
                  onClick={() => openMapData(entry)}
                  editMode={editMode}
                  onDelete={handleDeleteBin}
                  isDeleting={isDeleting}
                />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CustomModal
        modalHook={mapDataModal}
        options={{ hideFooter: true }}
        maxWidth={false}
        fullWidth
        fullScreen={isMobile}
        contentSx={{ px: { xs: 1, sm: 1.5, md: 2 }, py: { xs: 1, sm: 1.5, md: 3 } }}
      >
        {isMobile && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.5 }}>
            <IconButton size="small" onClick={() => mapDataModal.cancel()} aria-label="close">
              <FontAwesomeIcon icon={faTimes} />
            </IconButton>
          </Box>
        )}
        {selectedEntry && <MapDataDialog binPath={selectedEntry.path} campaignId={campaignId} />}
      </CustomModal>
      <CustomModal modalHook={deleteBinModal} actions={[ModalButtons.cancel, ModalButtons.delete]}>
        <Typography variant="body1">
          {t_cd("delete_bin_confirm_text", { name: deleteBinModal.data })}
        </Typography>
      </CustomModal>
    </>
  );
}

function CampaignStructureRow({ entry, mapsByBin, campaign, onClick, editMode, onDelete, isDeleting }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data.structure" });
  const dbMap = mapsByBin[entry.path] ?? null;
  const isMatched = !!dbMap;

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
            <StyledLink to={"/map/" + dbMap.id} onClick={(e) => e.stopPropagation()}>
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
      {editMode && (
        <TableCell width={1} sx={{ py: 0 }}>
          <IconButton
            size="small"
            color="error"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry, displayName);
            }}
          >
            <FontAwesomeIcon icon={faTrash} size="xs" />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
}
//#endregion

//#region Edit Mode Components
function AddBinSection({ campaignId }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data.add_bin" });
  const [binPath, setBinPath] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const { mutate: uploadBin, isLoading: isUploading } = usePostMapDataBin(() => {
    toast.success(t("success"));
    setBinPath("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  });

  const handleFile = (file) => {
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".bin"))) {
      setSelectedFile(file);
    } else {
      toast.error(t("invalid_file"));
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      toast.error(t("no_file"));
      return;
    }
    if (selectedFile.name.endsWith(".bin")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadBin({ data: e.target.result, binPath: binPath.trim(), campaignId, isBinary: true });
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          uploadBin({ data: parsed, binPath: binPath.trim(), campaignId });
        } catch {
          toast.error(t("invalid_json"));
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Typography variant="subtitle2">{t("title")}</Typography>
      <TextField
        size="small"
        label={t("bin_path")}
        value={binPath}
        onChange={(e) => setBinPath(e.target.value)}
        fullWidth
      />
      <Box
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        sx={{
          border: "2px dashed",
          borderColor: isDragging ? "primary.main" : "rgba(255,255,255,0.2)",
          borderRadius: 1,
          p: 2,
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: isDragging ? "rgba(255,255,255,0.05)" : "transparent",
          transition: "border-color 0.2s, background-color 0.2s",
          "&:hover": {
            borderColor: "rgba(255,255,255,0.4)",
            backgroundColor: "rgba(255,255,255,0.03)",
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.bin"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {selectedFile ? selectedFile.name : t("drop_zone")}
        </Typography>
      </Box>
      <Button
        variant="contained"
        size="small"
        onClick={handleSubmit}
        disabled={!binPath.trim() || !selectedFile || isUploading}
      >
        {isUploading ? t("uploading") : t("submit")}
      </Button>
    </Stack>
  );
}

function DeleteAllDataSection({ campaignId, onDelete, isDeleting }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data" });

  const deleteAllModal = useModal(null, (cancelled) => {
    if (cancelled) return;
    onDelete(campaignId);
  });

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={() => deleteAllModal.open()}
        disabled={isDeleting}
      >
        {t("delete_all")}
      </Button>
      <CustomModal
        modalHook={deleteAllModal}
        options={{ title: t("delete_all") }}
        actions={[ModalButtons.cancel, ModalButtons.delete]}
      >
        <Typography variant="body1">{t("delete_all_confirm")}</Typography>
      </CustomModal>
    </>
  );
}
//#endregion

//#region Mapping Editor
function MappingEditor({ campaignId, campaign, campaignData, mapsByBin, mapsById }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data.bin_assignments" });

  const { mutate: updateMap, isLoading: isSaving } = usePostMap(() => {
    toast.success(t("save_success"));
  });

  // Get all bin paths from campaignData
  const allPaths = campaignData ? campaignData.filter((e) => !e.conversion_error).map((e) => e.path) : [];

  // Paths already assigned to a map
  const mappedPaths = allPaths.filter((p) => !!mapsByBin[p]);

  // Map IDs already assigned
  const mappedMapIds = new Set(mappedPaths.map((p) => mapsByBin[p].id));

  // Paths not yet assigned to a map
  const unmappedPaths = allPaths.filter((p) => !mapsByBin[p]);

  // Maps from the campaign not yet assigned
  const availableMaps = campaign?.maps?.filter((m) => !mappedMapIds.has(m.id)) ?? [];

  const removeMapping = (path) => {
    const map = mapsByBin[path];
    if (!map) return;
    updateMap({ ...map, bin: null });
  };

  const addMapping = (path, mapId) => {
    const map = mapsById[mapId];
    if (!map) return;
    updateMap({ ...map, bin: path });
  };

  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Typography variant="subtitle2">{t("title")}</Typography>

      {/* Current assignments list */}
      {mappedPaths.length > 0 && (
        <Table size="small">
          <TableBody>
            {mappedPaths.map((path) => {
              const map = mapsByBin[path];
              const mapName = map ? getMapName(map, campaign) : `Map #${map?.id}`;
              return (
                <TableRow key={path}>
                  <TableCell sx={{ py: 0.5, fontSize: "0.8rem", color: "text.secondary" }}>{path}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>→</TableCell>
                  <TableCell sx={{ py: 0.5, fontSize: "0.8rem" }}>{mapName}</TableCell>
                  <TableCell sx={{ py: 0.5 }} width={1}>
                    <IconButton
                      size="small"
                      onClick={() => removeMapping(path)}
                      color="error"
                      disabled={isSaving}
                    >
                      <FontAwesomeIcon icon={faTrash} size="xs" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {mappedPaths.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          {t("no_entries")}
        </Typography>
      )}

      {/* Add new assignment row */}
      <MappingAddRow
        unmappedPaths={unmappedPaths}
        availableMaps={availableMaps}
        campaign={campaign}
        onAdd={addMapping}
        disabled={isSaving}
      />
    </Stack>
  );
}

function MappingAddRow({ unmappedPaths, availableMaps, campaign, onAdd, disabled }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.campaign_data.bin_assignments" });
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
      <Button
        variant="outlined"
        size="small"
        onClick={handleAdd}
        disabled={disabled || !selectedPath || !selectedMap}
      >
        {t("add")}
      </Button>
    </Stack>
  );
}
//#endregion

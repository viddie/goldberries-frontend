import {
  Alert,
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { BasicContainerBox, HeadTitle, LoadingSpinner } from "../components/basic";
import { MapDataDialog } from "../components/map_data/MapDataDialog";
import { MapDataViewer } from "../components/map_data/MapDataViewer";
import { useAuth } from "../hooks/AuthProvider";
import { getQueryData, useGetTempMapData } from "../hooks/useApi";
import { CustomModal, useModal } from "../hooks/useModal";
import { fetchCampaignByGbUrl, fetchCampaignData, fetchProcessGbCampaign, fetchTempData } from "../util/api";

const GB_URL_REGEX = /gamebanana\.com\/(mods|wips)\/(\d+)/;

function gbUrlToPath(fullUrl) {
  const match = fullUrl.match(GB_URL_REGEX);
  if (!match) return null;
  return `${match[1]}/${match[2]}`;
}

function gbPathToFullUrl(gbPath) {
  return `https://gamebanana.com/${gbPath}`;
}

export function PageMapViewer() {
  const { t } = useTranslation(undefined, { keyPrefix: "map_viewer" });
  const auth = useAuth();
  const navigate = useNavigate();
  const { gbUrlPath, binPath: binPathParam, roomName: roomNameParam } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [urlInput, setUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  const [showCloudflareWarning, setShowCloudflareWarning] = useState(false);

  // Result state
  const [campaignData, setCampaignData] = useState(null); // { status, message, data: [...bins] }
  const [campaignId, setCampaignId] = useState(null); // non-null if using permanent data
  const [gamebananaUrl, setGamebananaUrl] = useState(null); // full URL, used for temp data fetches

  // Map viewer modal
  const [selectedBinPath, setSelectedBinPath] = useState(null);
  const modalCloseRef = useRef(null);
  const mapDataModal = useModal(null, (cancelled) => {
    if (cancelled && modalCloseRef.current) modalCloseRef.current();
  });

  const canUse = auth.hasPlayerClaimed;
  const autoTriggered = useRef(false);

  // Store initial bin/room from URL params for auto-open after processing
  const initialBinPath = useRef(binPathParam ? decodeURIComponent(binPathParam) : null);
  const initialRoomName = useRef(roomNameParam ? decodeURIComponent(roomNameParam) : null);

  // Decode URL params on mount
  const decodedGbPath = gbUrlPath ? decodeURIComponent(gbUrlPath) : null;

  // Auto-populate URL from route param on mount
  useEffect(() => {
    if (decodedGbPath && canUse) {
      const fullUrl = gbPathToFullUrl(decodedGbPath);
      setUrlInput(fullUrl);
      if (!autoTriggered.current) {
        autoTriggered.current = true;
        processUrl(fullUrl, true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedGbPath, canUse]);

  // Auto-open modal if binPath was in the initial URL and we now have data
  useEffect(() => {
    if (initialBinPath.current && campaignData?.data) {
      setSelectedBinPath(initialBinPath.current);
      mapDataModal.open();
      initialBinPath.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignData]);

  const processUrl = useCallback(
    async (fullUrl, checkOnly = false) => {
      setIsProcessing(true);
      setProcessingError(null);
      setCampaignData(null);
      setCampaignId(null);
      setShowCloudflareWarning(false);
      setGamebananaUrl(fullUrl);

      try {
        // Step 1: Check if an existing campaign has this URL
        let existingCampaignId = null;
        try {
          const campaignResponse = await fetchCampaignByGbUrl(fullUrl);
          const campaigns = campaignResponse.data;
          if (Array.isArray(campaigns) && campaigns.length > 0) {
            existingCampaignId = campaigns[0].id;
          }
        } catch {
          // No existing campaign found, continue
        }

        // Step 2: If campaign found, check for existing campaign data
        if (existingCampaignId) {
          try {
            const dataResponse = await fetchCampaignData(existingCampaignId);
            const data = dataResponse.data;
            if (data && data.status === "ok" && data.data) {
              setCampaignId(existingCampaignId);
              setCampaignData(data);
              setIsProcessing(false);
              return;
            }
          } catch {
            // No campaign data, continue to temp data flow
          }
        }

        // Step 3: Check for cached temp data
        try {
          const tempResponse = await fetchTempData(fullUrl);
          const tempData = tempResponse.data;
          if (tempData && tempData.data) {
            setCampaignData(tempData);
            setIsProcessing(false);
            return;
          }
        } catch {
          // No cached temp data, continue
        }

        // In check-only mode (auto-load from URL), stop here — don't process
        if (checkOnly) {
          const gbPath = gbUrlToPath(fullUrl);
          if (gbPath) {
            initialBinPath.current = null;
            initialRoomName.current = null;
            navigate(`/map-viewer/${encodeURIComponent(gbPath)}`, { replace: true });
          }
          setIsProcessing(false);
          return;
        }

        // Step 4: Process the campaign from GameBanana
        setShowCloudflareWarning(true);
        await fetchProcessGbCampaign(fullUrl, true);

        // Step 5: Fetch the processed temp data
        const processedResponse = await fetchTempData(fullUrl);
        const processedData = processedResponse.data;
        if (processedData && processedData.data) {
          setCampaignData(processedData);
        } else {
          setProcessingError(t("error"));
        }
      } catch (err) {
        const message =
          err?.response?.data?.error || err?.response?.data?.message || err?.message || t("error");
        setProcessingError(message);
      } finally {
        setIsProcessing(false);
        setShowCloudflareWarning(false);
      }
    },
    [t, navigate],
  );

  const handleSubmit = () => {
    const match = urlInput.match(GB_URL_REGEX);
    if (!match) {
      setProcessingError(t("invalid_url"));
      return;
    }
    const fullUrl = urlInput.trim();
    const gbPath = gbUrlToPath(fullUrl);
    // Prevent the auto-trigger effect from also calling processUrl
    // when the navigation below sets gbUrlPath for the first time
    autoTriggered.current = true;
    if (gbPath) {
      navigate(`/map-viewer/${encodeURIComponent(gbPath)}`, { replace: true });
    }
    processUrl(fullUrl);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && canUse && !isProcessing) {
      handleSubmit();
    }
  };

  const openBinViewer = (entry) => {
    initialRoomName.current = null;
    setSelectedBinPath(entry.path);
    const gbPath = gbUrlToPath(gamebananaUrl || urlInput);
    if (gbPath) {
      navigate(`/map-viewer/${encodeURIComponent(gbPath)}/${encodeURIComponent(entry.path)}`, {
        replace: true,
      });
    }
    mapDataModal.open();
  };

  const handleModalClose = () => {
    setSelectedBinPath(null);
    const gbPath = gbUrlToPath(gamebananaUrl || urlInput);
    if (gbPath) {
      navigate(`/map-viewer/${encodeURIComponent(gbPath)}`, { replace: true });
    }
  };
  modalCloseRef.current = handleModalClose;

  const handleRoomNavigate = (roomName) => {
    const gbPath = gbUrlToPath(gamebananaUrl || urlInput);
    if (gbPath && selectedBinPath) {
      navigate(
        `/map-viewer/${encodeURIComponent(gbPath)}/${encodeURIComponent(selectedBinPath)}/${encodeURIComponent(roomName)}`,
        { replace: true },
      );
    }
  };

  const hasError = campaignData?.status === "error";
  const bins = campaignData?.data ?? [];

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={t("title")} />
      <Typography variant="h4" gutterBottom>
        {t("title")}
      </Typography>

      {/* URL Input Form */}
      <Stack spacing={2}>
        {!canUse && <Alert severity="info">{t("login_required")}</Alert>}

        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            fullWidth
            size="small"
            label={t("url_label")}
            placeholder={t("url_placeholder")}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!canUse || isProcessing}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canUse || isProcessing || !urlInput.trim()}
            sx={{ whiteSpace: "nowrap" }}
          >
            {t("view_map")}
          </Button>
        </Stack>

        {/* Processing indicator */}
        {isProcessing && (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <LoadingSpinner />
              <Typography variant="body2">{t("processing")}</Typography>
            </Stack>
            {showCloudflareWarning && <Alert severity="warning">{t("processing_warning")}</Alert>}
          </Stack>
        )}

        {/* Error display */}
        {processingError && !isProcessing && <Alert severity="error">{processingError}</Alert>}
      </Stack>

      {/* Results */}
      {campaignData && !isProcessing && (
        <Box sx={{ mt: 3 }}>
          {hasError ? (
            <Alert severity="error">{campaignData.message || t("error")}</Alert>
          ) : bins.length === 0 ? (
            <Alert severity="info">{t("no_bins")}</Alert>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                {t("bin_files")}
              </Typography>
              <BinFileTable bins={bins} onRowClick={openBinViewer} />
            </>
          )}
        </Box>
      )}

      {/* Map Viewer Modal */}
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
        {selectedBinPath &&
          (campaignId ? (
            <MapDataDialog
              binPath={selectedBinPath}
              campaignId={campaignId}
              initialRoom={initialRoomName.current}
              onRoomNavigate={handleRoomNavigate}
            />
          ) : (
            <TempMapDataViewer
              gamebananaUrl={gamebananaUrl}
              binPath={selectedBinPath}
              initialRoom={initialRoomName.current}
              onRoomNavigate={handleRoomNavigate}
            />
          ))}
      </CustomModal>
    </BasicContainerBox>
  );
}

function BinFileTable({ bins, onRowClick }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_viewer" });

  return (
    <TableContainer
      sx={{
        borderRadius: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Table size="small">
        <TableBody>
          {bins.map((entry, index) => (
            <TableRow key={index} hover onClick={() => onRowClick(entry)} sx={{ cursor: "pointer" }}>
              <TableCell>
                <Typography variant="body2">{entry.name || entry.dialog_name || t("unknown_map")}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                  {entry.path}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TempMapDataViewer({ gamebananaUrl, binPath, initialRoom, onRoomNavigate }) {
  const query = useGetTempMapData(gamebananaUrl, binPath);
  const mapData = getQueryData(query);

  if (query.isLoading) return <LoadingSpinner />;
  if (query.isError)
    return <Alert severity="error">{query.error?.message || "Failed to load map data."}</Alert>;
  if (!mapData) return null;

  return <MapDataViewer mapData={mapData} initialRoom={initialRoom} onRoomNavigate={onRoomNavigate} />;
}

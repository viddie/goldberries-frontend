import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

import {
  useGetModInfo,
  usePostCampaign,
  usePostCampaignDataMapping,
  usePostChallenge,
  usePostMap,
  useProcessGbCampaign,
} from "../../hooks/useApi";
import { fetchTempMapData } from "../../util/api";
import { DIFF_CONSTS } from "../../util/constants";
import { CollectibleChip, ObjectiveSelect } from "../goldberries";
import { LoadingSpinner } from "../basic";
import { StringListEditor } from "../StringListEditor";
import { MapDataViewer } from "../map_data/MapDataViewer";
import { extractCollectiblesForForm } from "../map_data/viewer/entity_definitions";

import { SameCampaignNameIndicator } from "./Campaign";
import { getCollectibleOptions, getCollectibleVariantOptions } from "./Map";

const GB_URL_REGEX = /gamebanana\.com\/mods\/(\d+)/;
const STEP_LABEL_KEYS = ["step_1.label", "step_2.label", "step_3.label", "step_4.label", "step_5.label"];

// Derive default objective from collectibles:
// Golden (value "0") exists → objective 1, else Silver ("1") → objective 2, else → objective 13
function deriveObjectiveFromCollectibles(collectibles) {
  if (!collectibles || collectibles.length === 0) return 2;
  const types = new Set(collectibles.map((c) => c[0]));
  if (types.has("0")) return 1;
  if (types.has("1")) return 2;
  return 13;
}

export function FormCreateCampaignFromGB({ onSuccess, setMaxWidth }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.create_campaign_from_gb" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_fm } = useTranslation(undefined, { keyPrefix: "forms.map" });

  const [step, setStep] = useState(0);
  const [gbUrl, setGbUrl] = useState("");
  const [gamebananaId, setGamebananaId] = useState(null);
  const [urlError, setUrlError] = useState("");
  const [processResult, setProcessResult] = useState(null);
  const [processError, setProcessError] = useState(null);
  const [mapList, setMapList] = useState([]);
  const [mapCollectibles, setMapCollectibles] = useState({});
  const [mapDataCache, setMapDataCache] = useState({});
  const [mapDataLoading, setMapDataLoading] = useState(false);
  const [mapDataErrors, setMapDataErrors] = useState({});
  const [editingMapIndex, setEditingMapIndex] = useState(null);

  // Campaign fields form
  const campaignForm = useForm({
    defaultValues: {
      name: "",
      url: "",
      author_gb_id: "",
      author_gb_name: "",
    },
  });

  // Challenge config form
  const [challengeConfigs, setChallengeConfigs] = useState([]);

  // Mutations
  const { mutate: processGbCampaign, isLoading: isProcessing } = useProcessGbCampaign((data) => {
    setProcessResult(data);
    setProcessError(null);
  });
  const { mutate: getModInfo } = useGetModInfo(
    (response) => {
      campaignForm.setValue("name", response.name);
      campaignForm.setValue("author_gb_id", String(response.authorId));
      campaignForm.setValue("author_gb_name", response.author);
    },
    () => {
      // Mod info fetch failed — not critical, user can fill in manually
    },
  );
  const { mutateAsync: postCampaign } = usePostCampaign();
  const { mutateAsync: postMap } = usePostMap();
  const { mutateAsync: postChallenge } = usePostChallenge();
  const { mutateAsync: postCampaignDataMapping } = usePostCampaignDataMapping();

  //#region Step 1: URL Input
  const handleProcessUrl = () => {
    const match = gbUrl.match(GB_URL_REGEX);
    if (!match) {
      setUrlError(t("step_1.invalid_url"));
      return;
    }
    setUrlError("");
    const gbId = match[1];
    setGamebananaId(gbId);
    campaignForm.setValue("url", gbUrl);
    setStep(1);
    processGbCampaign({ gamebananaId: gbId });
    getModInfo(gbUrl);
  };
  //#endregion

  //#region Step 2: Processing → auto-advance
  useEffect(() => {
    if (step === 1 && processResult && !isProcessing) {
      // Build mapList from bins that have a name
      const maps = processResult.bins
        .filter((bin) => bin.name)
        .map((bin) => ({
          name: bin.name,
          hash: bin.hash,
          binPath: bin.path,
        }));
      setMapList(maps);
      setStep(2);
    }
  }, [step, processResult, isProcessing]);
  //#endregion

  //#region Step 3 → Step 4 transition: fetch all map data
  const loadAllMapData = useCallback(async () => {
    if (!gamebananaId || mapList.length === 0) return;
    setMapDataLoading(true);
    const newCache = {};
    const newErrors = {};
    const newCollectibles = { ...mapCollectibles };

    for (const map of mapList) {
      if (!map.hash) continue;
      try {
        const response = await fetchTempMapData(gamebananaId, map.hash);
        newCache[map.hash] = response.data;
        // Auto-extract collectibles if not already edited
        if (!newCollectibles[map.hash]) {
          newCollectibles[map.hash] = extractCollectiblesForForm(response.data);
        }
      } catch {
        newErrors[map.hash] = true;
      }
    }

    setMapDataCache(newCache);
    setMapDataErrors(newErrors);
    setMapCollectibles(newCollectibles);
    setMapDataLoading(false);
  }, [gamebananaId, mapList, mapCollectibles]);
  //#endregion

  //#region Step 5: Create all
  const handleCreateAll = async () => {
    const maps = mapList;
    const toastId = toast.loading(t("feedback.creating", { current: 0, count: maps.length }));

    try {
      // 1. Create campaign
      const campaignData = campaignForm.getValues();
      const campaignResponse = await postCampaign(campaignData);
      const campaignId = campaignResponse.data.id;
      toast.update(toastId, { render: t("feedback.campaign_created") });

      // 2. Create maps + challenges sequentially, collecting bin path → map ID for mapping
      const mappingData = {};
      for (let i = 0; i < maps.length; i++) {
        const map = maps[i];
        const config = challengeConfigs[i] || { mode: "c_fc", objective_id: 2 };
        const collectibles = mapCollectibles[map.hash]?.filter((item) => item[0] && item[0] !== "") ?? null;

        const mapResponse = await postMap({
          name: map.name,
          campaign_id: campaignId,
          golden_changes: "Unknown",
          is_progress: true,
          collectibles: collectibles?.length > 0 ? collectibles : null,
        });
        const mapId = mapResponse.data.id;

        // Store bin path → map ID mapping
        if (map.binPath) {
          mappingData[map.binPath] = mapId;
        }

        // Create challenges based on mode
        if (config.mode === "c_fc_distinct") {
          await postChallenge({
            map_id: mapId,
            objective_id: config.objective_id,
            difficulty_id: DIFF_CONSTS.UNTIERED_ID,
            requires_fc: true,
            has_fc: false,
          });
          await postChallenge({
            map_id: mapId,
            objective_id: config.objective_id,
            difficulty_id: DIFF_CONSTS.UNTIERED_ID,
            requires_fc: false,
            has_fc: false,
          });
        } else {
          await postChallenge({
            map_id: mapId,
            objective_id: config.objective_id,
            difficulty_id: DIFF_CONSTS.UNTIERED_ID,
            has_fc: config.mode === "c_fc",
          });
        }

        toast.update(toastId, {
          render: t("feedback.creating", { current: i + 1, count: maps.length }),
        });
      }

      // 3. Save the bin path → map ID mapping for the campaign
      await postCampaignDataMapping({ id: campaignId, data: mappingData });

      toast.update(toastId, {
        render: t("feedback.maps_created"),
        isLoading: false,
        type: "success",
        autoClose: true,
      });

      if (onSuccess) onSuccess();
    } catch {
      toast.update(toastId, {
        render: t("feedback.error"),
        isLoading: false,
        type: "error",
        autoClose: 5000,
      });
    }
  };
  //#endregion

  //#region Map list helpers
  const unassignedBins = useMemo(() => {
    if (!processResult) return [];
    const usedHashes = new Set(mapList.map((m) => m.hash));
    return processResult.bins.filter((bin) => !usedHashes.has(bin.hash));
  }, [processResult, mapList]);

  const addMap = (bin) => {
    const binFileName = bin.path.split("/").pop().replace(".bin", "");
    const name = campaignForm.getValues("name");
    const defaultName = name ? `${name} ${binFileName}` : bin.dialog_name || binFileName;
    setMapList((prev) => [
      ...prev,
      {
        name: defaultName,
        hash: bin.hash,
        binPath: bin.path,
      },
    ]);
  };

  const removeMap = (index) => {
    setMapList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMapName = (index, name) => {
    setMapList((prev) => prev.map((m, i) => (i === index ? { ...m, name } : m)));
  };

  const updateMapBin = (index, bin) => {
    setMapList((prev) => prev.map((m, i) => (i === index ? { ...m, hash: bin.hash, binPath: bin.path } : m)));
  };
  //#endregion

  //#region Viewer editing
  const openViewerEditor = (index) => {
    setEditingMapIndex(index);
    if (setMaxWidth) setMaxWidth(false);
  };
  const closeViewerEditor = () => {
    setEditingMapIndex(null);
    if (setMaxWidth) setMaxWidth("md");
  };
  //#endregion

  const campaignName = campaignForm.watch("name");

  // If editing a map's collectibles in the viewer
  if (editingMapIndex !== null) {
    const map = mapList[editingMapIndex];
    const mapData = mapDataCache[map?.hash];
    const collectibles = mapCollectibles[map?.hash] ?? [];

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} lg={9}>
          {mapData ? (
            <MapDataViewer mapData={mapData} />
          ) : (
            <Alert severity="error">{t("step_4.loading_error")}</Alert>
          )}
        </Grid>
        <Grid
          item
          xs={12}
          lg={3}
          sx={{ display: "flex", flexDirection: "column", maxHeight: { lg: "calc(100vh - 130px)" } }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2, flexShrink: 0 }}
          >
            <Typography variant="h6">
              {t("step_4.edit")} - {map?.name}
            </Typography>
            <Button variant="outlined" onClick={closeViewerEditor}>
              {t("step_4.done")}
            </Button>
          </Stack>
          <Box sx={{ overflow: "auto", flex: 1, minHeight: 0 }}>
            <StringListEditor
              label={t_fm("collectibles.label")}
              valueTypes={[
                { type: "enum", options: getCollectibleOptions() },
                { type: "enum", options: (item) => getCollectibleVariantOptions(item[0]) },
                { type: "string", multiline: true },
                { type: "string" },
                { type: "string" },
              ]}
              valueLabels={[
                t_fm("collectibles.label"),
                t_fm("collectibles.variant"),
                t_fm("collectibles.note"),
                t_fm("collectibles.count"),
                t_fm("collectibles.global_count"),
              ]}
              list={collectibles}
              setList={(newList) => {
                setMapCollectibles((prev) => ({ ...prev, [map.hash]: newList }));
              }}
              valueCount={5}
              reorderable
              inline={[6, 6, 12, 6, 6]}
            />
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <>
      <Stepper activeStep={step} sx={{ mb: 2 }}>
        {STEP_LABEL_KEYS.map((key, index) => (
          <Step key={key}>
            <StepLabel>{index === step ? t(key) : ""}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {step === 0 && (
        <Step1UrlInput
          gbUrl={gbUrl}
          setGbUrl={setGbUrl}
          urlError={urlError}
          onProcess={handleProcessUrl}
          t={t}
        />
      )}

      {step === 1 && (
        <Step2Processing
          isProcessing={isProcessing}
          processError={processError}
          onRetry={() => {
            setProcessError(null);
            processGbCampaign({ gamebananaId });
          }}
          onBack={() => setStep(0)}
          t={t}
        />
      )}

      {step === 2 && (
        <Step3MapList
          campaignForm={campaignForm}
          campaignName={campaignName}
          mapList={mapList}
          unassignedBins={unassignedBins}
          processResult={processResult}
          onUpdateMapName={updateMapName}
          onUpdateMapBin={updateMapBin}
          onRemoveMap={removeMap}
          onAddMap={addMap}
          onBack={() => setStep(0)}
          onNext={() => {
            setStep(3);
            loadAllMapData();
          }}
          t={t}
          t_g={t_g}
        />
      )}

      {step === 3 && (
        <Step4Collectibles
          mapList={mapList}
          mapCollectibles={mapCollectibles}
          mapDataLoading={mapDataLoading}
          mapDataErrors={mapDataErrors}
          onEditMap={openViewerEditor}
          onBack={() => setStep(2)}
          onNext={() => {
            // Initialize challenge configs from mapList, deriving objectives from collectibles
            setChallengeConfigs(
              mapList.map((map) => ({
                mode: "c_fc",
                objective_id: deriveObjectiveFromCollectibles(mapCollectibles[map.hash]),
              })),
            );
            setStep(4);
          }}
          t={t}
        />
      )}

      {step === 4 && (
        <Step5Challenges
          mapList={mapList}
          challengeConfigs={challengeConfigs}
          setChallengeConfigs={setChallengeConfigs}
          onBack={() => setStep(3)}
          onCreateAll={handleCreateAll}
          t={t}
        />
      )}
    </>
  );
}

//#region Step Components
function Step1UrlInput({ gbUrl, setGbUrl, urlError, onProcess, t }) {
  return (
    <Stack spacing={2}>
      <TextField
        label={t("step_1.url_label")}
        placeholder={t("step_1.url_placeholder")}
        fullWidth
        value={gbUrl}
        onChange={(e) => setGbUrl(e.target.value)}
        error={!!urlError}
        helperText={urlError}
        onKeyDown={(e) => {
          if (e.key === "Enter") onProcess();
        }}
      />
      <Button variant="contained" color="primary" fullWidth onClick={onProcess} disabled={!gbUrl.trim()}>
        {t("step_1.process_button")}
      </Button>
    </Stack>
  );
}

function Step2Processing({ isProcessing, processError, onRetry, onBack, t }) {
  return (
    <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
      {isProcessing && (
        <>
          <LoadingSpinner />
          <Typography>{t("step_2.processing")}</Typography>
        </>
      )}
      {processError && (
        <>
          <Alert severity="error">{t("step_2.error")}</Alert>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={onBack}>
              {t("back")}
            </Button>
            <Button variant="contained" onClick={onRetry}>
              {t("step_2.retry")}
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}

function Step3MapList({
  campaignForm,
  campaignName,
  mapList,
  unassignedBins,
  processResult,
  onUpdateMapName,
  onUpdateMapBin,
  onRemoveMap,
  onAddMap,
  onBack,
  onNext,
  t,
  t_g,
}) {
  const allBins = processResult?.bins ?? [];

  return (
    <Stack spacing={2}>
      {/* Campaign fields */}
      <Controller
        control={campaignForm.control}
        name="name"
        render={({ field }) => (
          <TextField
            label={t("step_3.campaign_name")}
            fullWidth
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <SameCampaignNameIndicator name={campaignName} />
      <Controller
        control={campaignForm.control}
        name="url"
        render={({ field }) => (
          <TextField label={t_g("url")} fullWidth value={field.value} onChange={field.onChange} />
        )}
      />
      <Stack direction="row" spacing={1}>
        <Controller
          control={campaignForm.control}
          name="author_gb_id"
          render={({ field }) => (
            <TextField
              label={t("step_3.author_gb_id")}
              fullWidth
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={campaignForm.control}
          name="author_gb_name"
          render={({ field }) => (
            <TextField
              label={t("step_3.author_gb_name")}
              fullWidth
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Stack>

      <Divider>
        <Chip label={t("step_3.maps_found", { count: mapList.length })} size="small" />
      </Divider>

      {/* Map list */}
      {mapList.length === 0 && <Alert severity="info">{t("step_3.no_maps")}</Alert>}

      {mapList.map((map, index) => (
        <Stack key={index} direction="row" spacing={1} alignItems="center">
          <TextField
            label={t("step_3.map_name")}
            fullWidth
            value={map.name}
            onChange={(e) => onUpdateMapName(index, e.target.value)}
            size="small"
          />
          <TextField
            label={t("step_3.bin_path")}
            select
            fullWidth
            value={map.hash}
            onChange={(e) => {
              const bin = allBins.find((b) => b.hash === e.target.value);
              if (bin) onUpdateMapBin(index, bin);
            }}
            size="small"
          >
            {/* Current assignment */}
            <MenuItem value={map.hash}>{map.binPath}</MenuItem>
            {/* Other available bins */}
            {unassignedBins
              .filter((b) => b.hash !== map.hash)
              .map((bin) => (
                <MenuItem key={bin.hash} value={bin.hash}>
                  {bin.path}
                </MenuItem>
              ))}
          </TextField>
          <Tooltip title={t("step_3.remove_map")}>
            <IconButton size="small" color="error" onClick={() => onRemoveMap(index)}>
              <FontAwesomeIcon icon={faTrash} size="xs" />
            </IconButton>
          </Tooltip>
        </Stack>
      ))}

      {/* Add from unassigned bins */}
      {unassignedBins.length > 0 && (
        <>
          <Divider>
            <Chip label={t("step_3.unassigned_bins")} size="small" />
          </Divider>
          {unassignedBins.map((bin) => (
            <Stack key={bin.hash} direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                {bin.dialog_name || bin.path}
              </Typography>
              <Tooltip title={t("step_3.add_map")}>
                <IconButton color="primary" onClick={() => onAddMap(bin)}>
                  <FontAwesomeIcon icon={faPlus} />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </>
      )}

      <Divider sx={{ my: 1 }} />
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onBack} fullWidth>
          {t("back")}
        </Button>
        <Button variant="contained" onClick={onNext} fullWidth disabled={mapList.length === 0}>
          {t("next")}
        </Button>
      </Stack>
    </Stack>
  );
}

function Step4Collectibles({
  mapList,
  mapCollectibles,
  mapDataLoading,
  mapDataErrors,
  onEditMap,
  onBack,
  onNext,
  t,
}) {
  if (mapDataLoading) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
        <LoadingSpinner />
        <Typography>{t("step_4.loading_map_data")}</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("step_3.map_name")}</TableCell>
              <TableCell>{t("step_4.collectible_summary")}</TableCell>
              <TableCell width={50} />
            </TableRow>
          </TableHead>
          <TableBody>
            {mapList.map((map, index) => {
              const collectibles = mapCollectibles[map.hash] ?? [];
              const hasError = mapDataErrors[map.hash];

              return (
                <TableRow key={map.hash}>
                  <TableCell>{map.name}</TableCell>
                  <TableCell>
                    {hasError ? (
                      <Alert severity="error" sx={{ py: 0 }}>
                        {t("step_4.loading_error")}
                      </Alert>
                    ) : collectibles.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        {t("step_4.no_collectibles")}
                      </Typography>
                    ) : (
                      <Stack direction="row" gap={1} flexWrap="wrap">
                        {collectibles.map((c, ci) => (
                          <CollectibleChip key={ci} collectibleId={c[0]} variantId={c[1]} count={c[3]} />
                        ))}
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={t("step_4.edit")}>
                      <IconButton size="small" onClick={() => onEditMap(index)} disabled={hasError}>
                        <FontAwesomeIcon icon={faEdit} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 1 }} />
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onBack} fullWidth>
          {t("back")}
        </Button>
        <Button variant="contained" onClick={onNext} fullWidth>
          {t("next")}
        </Button>
      </Stack>
    </Stack>
  );
}

function Step5Challenges({ mapList, challengeConfigs, setChallengeConfigs, onBack, onCreateAll, t }) {
  const updateConfig = (index, key, value) => {
    setChallengeConfigs((prev) => prev.map((c, i) => (i === index ? { ...c, [key]: value } : c)));
  };

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        {t("step_5.helper")}
      </Typography>

      {mapList.map((map, index) => {
        const config = challengeConfigs[index] || { mode: "c_fc", objective_id: 2 };
        return (
          <Stack key={map.hash} direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 150 }}>
              {map.name}
            </Typography>
            <TextField
              label={t("step_5.generate_challenges")}
              select
              fullWidth
              value={config.mode}
              onChange={(e) => updateConfig(index, "mode", e.target.value)}
            >
              <MenuItem value="c">Clear</MenuItem>
              <MenuItem value="c_fc">C/FC</MenuItem>
              <MenuItem value="c_fc_distinct">{t("step_5.c_fc_distinct")}</MenuItem>
            </TextField>
            <ObjectiveSelect
              fullWidth
              objectiveId={config.objective_id}
              setObjectiveId={(id) => updateConfig(index, "objective_id", id)}
            />
          </Stack>
        );
      })}

      <Divider sx={{ my: 1 }} />
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onBack} fullWidth>
          {t("back")}
        </Button>
        <Button variant="contained" color="success" onClick={onCreateAll} fullWidth>
          {t("step_5.create_all")}
        </Button>
      </Stack>
    </Stack>
  );
}
//#endregion

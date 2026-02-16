import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
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
import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronLeft, faInfoCircle, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Trans, useTranslation } from "react-i18next";

import { durationToSeconds, getChallengeIsArbitrary, getMapLobbyInfo } from "../../util/data_util";
import { DIFF_CONSTS } from "../../util/constants";
import { useAuth } from "../../hooks/AuthProvider";
import { ProofEmbed, StyledLink } from "../basic";
import {
  CampaignSelect,
  ChallengeSelect,
  PlayerSelect,
  PlayerChip,
  DateAchievedTimePicker,
  DifficultySelectControlled,
} from "../goldberries";
import { usePostSubmission } from "../../hooks/useApi";

import { NotificationNotice, validateUrlNotRequired } from "./shared";

//#region MultiSubmission
export function MultiSubmission() {
  const { t } = useTranslation(undefined, { keyPrefix: "submit.tabs.multi" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_fs } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  const { t: t_ts } = useTranslation(undefined, { keyPrefix: "submit.tabs.single" });
  const auth = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [sortMajorIndex, setSortMajorIndex] = useState(null);
  const [sortMinorIndex, setSortMinorIndex] = useState(null);
  const [preferFc, setPreferFc] = useState(false);
  const [multiVideo, setMultiVideo] = useState(false);
  const [mapDataList, setMapDataList] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(auth.user?.player ?? null);
  const [showEmbed, setShowEmbed] = useState(false);

  const { mutateAsync: submitRun } = usePostSubmission();

  //#region Form Setup
  const form = useForm({
    defaultValues: {
      proof_url: "",
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    const invalidUrls = mapDataList.filter((mapData) => validateUrlNotRequired(mapData.proof_url) !== true);
    if (invalidUrls.length > 0) {
      toast.error(t("feedback.invalid_urls", { count: invalidUrls.length }));
      return;
    }

    const toastId = toast.loading(t("feedback.submitting", { current: 0, total: mapDataList.length }), {
      autoClose: false,
    });

    const addRunRecursive = (index) => {
      if (index >= mapDataList.length) {
        toast.update(toastId, {
          render: t("feedback.submitted"),
          isLoading: false,
          type: "success",
          autoClose: 10000,
          closeOnClick: true,
        });
        return;
      }
      const mapData = mapDataList[index];
      const timeTakenFormatted = durationToSeconds(mapData.time_taken);
      submitRun({
        challenge_id: mapData.challenge.id,
        player_id: selectedPlayer.id,
        is_fc: mapData.is_fc,
        player_notes: mapData.player_notes,
        raw_session_url: mapData.raw_session_url,
        suggested_difficulty_id: mapData.suggested_difficulty_id,
        proof_url: mapData.proof_url !== "" ? mapData.proof_url : data.proof_url,
        date_achieved: mapData.date_achieved,
        time_taken: timeTakenFormatted,
        like_challenge: mapData.like_challenge,
      })
        .then(() => {
          toast.update(toastId, {
            render: t("feedback.submitting", { current: index + 1, total: mapDataList.length }),
          });
          addRunRecursive(index + 1);
        })
        .catch((e) => {
          addRunRecursive(index + 1);
        });
    };

    addRunRecursive(0);
  });
  const errors = form.formState.errors;
  const proof_url = form.watch("proof_url");
  //#endregion

  //#region Campaign Selection & Map Data
  const onCampaignSelect = (campaign) => {
    if (campaign !== null) {
      campaign.maps.sort((a, b) => {
        if (a.sort_major !== b.sort_major) {
          return a.sort_major - b.sort_major;
        }
        if (a.sort_minor !== b.sort_minor) {
          return a.sort_minor - b.sort_minor;
        }
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        return a.name.localeCompare(b.name);
      });
    }
    setCampaign(campaign);
    setSortMajorIndex(null);
    setSortMinorIndex(null);
  };

  const resetMapDataList = () => {
    const mapDataList = [];
    if (campaign !== null) {
      campaign.maps.forEach((map) => {
        if (sortMajorIndex !== null && map.sort_major !== sortMajorIndex) {
          return;
        }
        if (sortMinorIndex !== null && map.sort_minor !== sortMinorIndex) {
          return;
        }
        if (map.challenges.length === 0) {
          return;
        }
        let challenge = map.challenges[0];
        if (map.challenges.length > 1) {
          challenge = map.challenges.find(
            (c) => (c.requires_fc && preferFc) || (!c.requires_fc && !preferFc),
          );
          if (challenge === undefined) {
            challenge = map.challenges.find((c) => getChallengeIsArbitrary(c) === false);
          }
        }
        map.campaign = campaign;
        mapDataList.push({
          map: map,
          challenge: challenge,
          is_fc: challenge.requires_fc || (preferFc && challenge.has_fc),
          player_notes: "",
          raw_session_url: "",
          proof_url: "",
          suggested_difficulty_id: null,
          date_achieved: new Date().toISOString(),
          time_taken: "",
          like_challenge: false,
        });
      });
    }
    setMapDataList(mapDataList);
  };

  const updateMapDataRow = useCallback((index, data) => {
    if (data.challenge !== null) {
      if (data.challenge.requires_fc) {
        data.is_fc = true;
      } else if (data.challenge.has_fc && preferFc) {
        data.is_fc = true;
      } else if (!data.challenge.has_fc && !data.challenge.requires_fc) {
        data.is_fc = false;
      }
    }
    setMapDataList((mapDataList) => {
      mapDataList[index] = data;
      return [...mapDataList];
    });
  }, []);
  const deleteRow = useCallback((index) => {
    setMapDataList((mapDataList) => {
      mapDataList.splice(index, 1);
      return [...mapDataList];
    });
  }, []);

  useEffect(() => {
    resetMapDataList();
  }, [campaign, sortMajorIndex, sortMinorIndex, preferFc]);
  //#endregion

  //#region Computed Values
  const hasSortMajor = campaign !== null && campaign.sort_major_name !== null;
  const hasSortMinor = campaign !== null && campaign.sort_minor_name !== null;

  let hasAllIndividualVideos = mapDataList.every((mapData) => mapData.proof_url !== "");
  let submittable =
    campaign !== null && mapDataList.length > 0 && (form.watch("proof_url") !== "" || hasAllIndividualVideos);
  let rawSessionsGood = true;
  mapDataList.forEach((mapData) => {
    if (
      mapData.challenge &&
      mapData.challenge.difficulty.sort >= DIFF_CONSTS.RAW_SESSION_REQUIRED_SORT &&
      mapData.raw_session_url === ""
    ) {
      rawSessionsGood = false;
    }
    if (mapData.challenge === null) {
      submittable = false;
    }
  });
  //#endregion

  //#region Render
  return (
    <>
      <h1 style={{ marginBottom: "0" }}>{t("header")}</h1>
      <Typography variant="body1">{t("info")}</Typography>
      <Stack gap={2}>
        <h4 style={{ marginBottom: "0" }}>{t("select_campaign")}</h4>
        <CampaignSelect
          selected={campaign}
          setSelected={onCampaignSelect}
          filter={(campaign) => campaign.maps.length > 1}
        />
      </Stack>
      {hasSortMajor && (
        <>
          <h4 style={{ marginBottom: "0" }}>{campaign.sort_major_name}</h4>
          <TextField
            select
            fullWidth
            value={sortMajorIndex ?? null}
            onChange={(e) => setSortMajorIndex(e.target.value)}
            SelectProps={{
              MenuProps: { disableScrollLock: true },
            }}
          >
            <MenuItem value={null}>
              <em>{t("all")}</em>
            </MenuItem>
            {campaign.sort_major_labels.map((value, index) => (
              <MenuItem key={index} value={index}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        </>
      )}
      {hasSortMinor && (
        <>
          <h4 style={{ marginBottom: "0" }}>{campaign.sort_minor_name}</h4>
          <TextField
            select
            fullWidth
            value={sortMinorIndex ?? null}
            onChange={(e) => setSortMinorIndex(e.target.value)}
            SelectProps={{
              MenuProps: { disableScrollLock: true },
            }}
          >
            <MenuItem value={null}>
              <em>{t("all")}</em>
            </MenuItem>
            {campaign.sort_minor_labels.map((value, index) => (
              <MenuItem key={index} value={index}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        </>
      )}
      <Stack direction="row" alignItems="center" gap={1}>
        <FormControlLabel
          control={<Checkbox />}
          label={t("prefer_fc")}
          checked={preferFc}
          onChange={(e, v) => setPreferFc(v)}
        />
        <Stack direction="row" alignItems="center" gap={0}>
          <FormControlLabel
            control={<Checkbox />}
            label={t("multi_video.label")}
            checked={multiVideo}
            onChange={(e, v) => setMultiVideo(v)}
          />
          <Tooltip title={t("multi_video.tooltip")}>
            <FontAwesomeIcon icon={faInfoCircle} />
          </Tooltip>
        </Stack>
      </Stack>
      {campaign !== null && (
        <>
          <Divider sx={{ my: 3 }} />
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>{t_g("map", { count: 1 })}</TableCell>
                  <TableCell>{t_g("challenge", { count: 1 })}</TableCell>
                  <TableCell>{t("is_fc")}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mapDataList.map((mapData, index) => {
                  return (
                    <MemoMultiSubmissionMapRow
                      key={mapData.map.id}
                      mapData={mapData}
                      index={index}
                      updateMapDataRow={updateMapDataRow}
                      deleteRow={deleteRow}
                      multiVideo={multiVideo}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <Divider sx={{ my: 3 }} />
      <h4>{t("compilation_video")}</h4>
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {auth.hasHelperPriv ? (
              <PlayerSelect
                type="all"
                label={t_ts("verifier.player_select")}
                value={selectedPlayer}
                onChange={(e, v) => setSelectedPlayer(v)}
              />
            ) : (
              <PlayerChip player={selectedPlayer} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}></Grid>
          <Grid item xs>
            <TextField
              label={t_fs("proof_url") + (hasAllIndividualVideos ? "" : " *")}
              fullWidth
              {...form.register("proof_url", { validate: validateUrlNotRequired })}
              error={errors.proof_url}
              disabled={hasAllIndividualVideos}
              helperText={
                errors.proof_url?.message ? (
                  <Trans
                    t={t_ff}
                    i18nKey={"submission_url." + errors.proof_url?.message}
                    components={{ CustomLink: <StyledLink /> }}
                  />
                ) : null
              }
            />
          </Grid>
          <Grid item xs="auto" display="flex">
            <Button
              variant="outlined"
              onClick={() => setShowEmbed(!showEmbed)}
              sx={{ alignSelf: "stretch" }}
              disabled={proof_url === ""}
              color={showEmbed ? "success" : "primary"}
              fullWidth
            >
              {t_ts(showEmbed ? "hide_embed" : "test_embed")}
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ "&&": { pt: 0 } }}>
            <FormHelperText>{t_ts("proof_note")}</FormHelperText>
          </Grid>
          {showEmbed && (
            <Grid item xs={12} sx={{ "&&": { pt: 1 } }}>
              <ProofEmbed url={form.watch("proof_url")} />
            </Grid>
          )}
          <Grid item xs={12} sm={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={onSubmit}
              disabled={!submittable || !rawSessionsGood}
            >
              {t("button", { count: mapDataList.length })}
            </Button>
          </Grid>
          {!rawSessionsGood && (
            <Grid item xs={12}>
              <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                {t_ts("raw_session_note")}
              </Typography>
            </Grid>
          )}
          <NotificationNotice />
        </Grid>
      </form>
    </>
  );
  //#endregion
}
//#endregion

//#region MultiSubmissionMapRow
function MultiSubmissionMapRow({ mapData, multiVideo = false, index, updateMapDataRow, deleteRow }) {
  const { t } = useTranslation(undefined, { keyPrefix: "submit.tabs.multi" });
  const { t: t_fs } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  const { t: t_a } = useTranslation(undefined);
  const [expanded, setExpanded] = useState(
    mapData.challenge?.difficulty.sort >= DIFF_CONSTS.RAW_SESSION_REQUIRED_SORT ? true : false || multiVideo,
  );

  useEffect(() => {
    if (multiVideo) setExpanded(true);
  }, [multiVideo]);

  const lobbyInfo = getMapLobbyInfo(mapData.map);
  const color = lobbyInfo?.major ? lobbyInfo?.major?.color : (lobbyInfo?.minor?.color ?? "inherit");
  const border = lobbyInfo?.major || lobbyInfo?.minor ? "20px solid " + color : "none";

  const needsRawSession =
    mapData.challenge && mapData.challenge.difficulty.sort >= DIFF_CONSTS.RAW_SESSION_REQUIRED_SORT;
  const hasRawSession = mapData.raw_session_url !== "" && mapData.raw_session_url !== null;
  const bgColor = needsRawSession && !hasRawSession ? "#4a0000" : "inherit";

  const validTimeTaken = mapData.time_taken === "" || durationToSeconds(mapData.time_taken) !== null;

  return (
    <>
      <TableRow sx={{ borderLeft: border, bgcolor: bgColor }}>
        <TableCell width={1} sx={{ pr: 0 }}>
          {index + 1}
        </TableCell>
        <TableCell width={1}>
          <Typography
            variant="body1"
            sx={{ whiteSpace: "nowrap", maxWidth: "270px", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {mapData.map.name}
          </Typography>
        </TableCell>
        <TableCell>
          <ChallengeSelect
            map={mapData.map}
            selected={mapData.challenge}
            setSelected={(c) => updateMapDataRow(index, { ...mapData, challenge: c })}
            disabled={mapData.map.challenges.length === 1}
            hideLabel
          />
        </TableCell>
        <TableCell width={1}>
          <FormControlLabel
            control={<Checkbox />}
            checked={mapData.is_fc}
            disabled={
              mapData.challenge === null || mapData.challenge.requires_fc || !mapData.challenge.has_fc
            }
            onChange={(e, v) => updateMapDataRow(index, { ...mapData, is_fc: v })}
            label={t_fs("is_fc")}
            slotProps={{
              typography: {
                sx: {
                  whiteSpace: "nowrap",
                },
              },
            }}
          />
        </TableCell>
        <TableCell width={1}>
          <Button variant="text" onClick={() => setExpanded(!expanded)}>
            {expanded ? <FontAwesomeIcon icon={faChevronDown} /> : <FontAwesomeIcon icon={faChevronLeft} />}
          </Button>
        </TableCell>
      </TableRow>
      <TableRow
        sx={{
          borderBottom: expanded ? "1px solid lightgrey" : "unset",
          display: expanded ? "table-row" : "none",
          bgcolor: bgColor,
        }}
      >
        <TableCell sx={{ py: expanded ? 1 : 0, borderBottom: "unset" }} colSpan={6}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Table size="small">
              <TableBody>
                {multiVideo && (
                  <TableRow
                    sx={{
                      "& > *": {
                        borderBottom: "unset",
                      },
                    }}
                  >
                    <TableCell colSpan={7}>
                      <TextField
                        label={t_fs("proof_url")}
                        value={mapData.proof_url}
                        onChange={(e) => updateMapDataRow(index, { ...mapData, proof_url: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                )}
                <TableRow
                  sx={{
                    "& > *": {
                      borderBottom: "unset",
                    },
                  }}
                >
                  <TableCell colSpan={5}>
                    <TextField
                      label={t_fs("player_notes")}
                      value={mapData.player_notes}
                      onChange={(e) => updateMapDataRow(index, { ...mapData, player_notes: e.target.value })}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <DifficultySelectControlled
                      label={t_a("components.difficulty_select.label")}
                      difficultyId={mapData.suggested_difficulty_id}
                      setDifficultyId={(id) =>
                        updateMapDataRow(index, { ...mapData, suggested_difficulty_id: id })
                      }
                      isSuggestion
                      fullWidth
                    />
                  </TableCell>
                  <TableCell width={1}>
                    <Tooltip title={t("remove_map")}>
                      <IconButton
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setExpanded(false);
                          deleteRow(index);
                        }}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{
                    "& > *": {
                      borderBottom: "unset",
                    },
                  }}
                >
                  <TableCell colSpan={99}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <DateAchievedTimePicker
                          value={mapData.date_achieved}
                          onChange={(value) => {
                            updateMapDataRow(index, { ...mapData, date_achieved: value });
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          value={mapData.time_taken}
                          onChange={(e) =>
                            updateMapDataRow(index, { ...mapData, time_taken: e.target.value })
                          }
                          label={t_fs("time_taken")}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          placeholder="(hh:)mm:ss"
                          error={!validTimeTaken}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} display="flex" alignItems="center">
                        <FormControlLabel
                          control={<Checkbox />}
                          checked={mapData.like_challenge}
                          onChange={(e, v) => updateMapDataRow(index, { ...mapData, like_challenge: v })}
                          label={t("liked_challenge")}
                        />
                      </Grid>
                    </Grid>
                  </TableCell>
                </TableRow>
                {mapData.challenge &&
                  mapData.challenge.difficulty.sort >= DIFF_CONSTS.RAW_SESSION_REQUIRED_SORT && (
                    <TableRow
                      sx={{
                        "& > *": {
                          borderBottom: "unset",
                        },
                      }}
                    >
                      <TableCell colSpan={7}>
                        <TextField
                          label={t_fs("raw_session_url") + " *"}
                          value={mapData.raw_session_url}
                          onChange={(e) =>
                            updateMapDataRow(index, { ...mapData, raw_session_url: e.target.value })
                          }
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
const MemoMultiSubmissionMapRow = memo(MultiSubmissionMapRow, (prevProps, newProps) => {
  const propsEqual =
    prevProps.mapData.map.id === newProps.mapData.map.id &&
    prevProps.mapData.challenge?.id === newProps.mapData.challenge?.id &&
    prevProps.mapData.is_fc === newProps.mapData.is_fc &&
    prevProps.mapData.player_notes === newProps.mapData.player_notes &&
    prevProps.mapData.suggested_difficulty_id === newProps.mapData.suggested_difficulty_id &&
    prevProps.mapData.raw_session_url === newProps.mapData.raw_session_url &&
    prevProps.mapData.proof_url === newProps.mapData.proof_url &&
    prevProps.mapData.date_achieved === newProps.mapData.date_achieved &&
    prevProps.mapData.time_taken === newProps.mapData.time_taken &&
    prevProps.mapData.like_challenge === newProps.mapData.like_challenge &&
    prevProps.multiVideo === newProps.multiVideo &&
    prevProps.index === newProps.index;
  return propsEqual;
});
//#endregion

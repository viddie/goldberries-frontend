import {
  Alert,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Trans, useTranslation } from "react-i18next";

import { durationToSeconds } from "../../util/data_util";
import { DIFF_CONSTS, FormOptions } from "../../util/constants";
import { useAuth } from "../../hooks/AuthProvider";
import { ProofEmbed, StyledLink, TooltipInfoButton } from "../basic";
import {
  CampaignSelect,
  MapSelect,
  ChallengeSelect,
  PlayerSelect,
  PlayerChip,
  CampaignChallengeSelect,
  DateAchievedTimePicker,
  DifficultySelectControlled,
} from "../goldberries";
import { usePostPlayer, usePostSubmission } from "../../hooks/useApi";
import { DifficultyFracGrid } from "../forms/Submission";
import { FullChallengeDisplay } from "../../pages/Submission";
import { NoteDisclaimer } from "../../pages/Challenge";
import { CharsCountLabel } from "../../pages/Suggestions";

import { CFCSelector, NotificationNotice, validateUrl, validateUrlNotRequired } from "./shared";

//#region SingleSubmission
export function SingleSubmission({ defaultCampaign, defaultMap, defaultChallenge }) {
  const { t } = useTranslation(undefined, { keyPrefix: "submit.tabs.single" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const { t: t_fs } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  const { t: t_a } = useTranslation(undefined);
  const auth = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(defaultCampaign ?? null);
  const [map, setMap] = useState(defaultMap ?? null);
  const [challenge, setChallenge] = useState(defaultChallenge ?? null);
  const [selectedPlayer, setSelectedPlayer] = useState(auth.user?.player ?? null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [showEmbed, setShowEmbed] = useState(false);

  const { mutateAsync: postPlayer } = usePostPlayer();

  const { mutate: submitRun } = usePostSubmission((submission) => {
    navigate("/submission/" + submission.id);
  });

  //#region Form Setup
  const form = useForm({
    defaultValues: {
      proof_url: "",
      raw_session_url: "",
      player_notes: "",
      is_fc: null,
      suggested_difficulty_id: null,
      frac: 50,
      is_personal: false,
      time_taken: "",
      date_achieved: new Date().toISOString(),
      like_challenge: false,
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    if (data.is_fc === null) {
      toast.error(t("feedback.select_is_fc"));
      return;
    }

    submitRun({
      challenge_id: challenge.id,
      player_id: selectedPlayer.id,
      ...data,
      time_taken: durationToSeconds(data.time_taken),
      like_challenge: data.like_challenge,
    });
  });
  const errors = form.formState.errors;
  const proof_url = form.watch("proof_url");
  const raw_session_url = form.watch("raw_session_url");
  const suggested_difficulty_id = form.watch("suggested_difficulty_id");
  const sameUrl = proof_url === raw_session_url && raw_session_url !== "";
  const needsRawSession =
    challenge !== null && challenge.difficulty.sort >= DIFF_CONSTS.RAW_SESSION_REQUIRED_SORT;
  const is_fc = form.watch("is_fc");
  //#endregion

  //#region Campaign/Map/Challenge Selection
  const onCampaignSelect = (campaign) => {
    setCampaign(campaign);
    if (campaign !== null && campaign.maps.length === 1) {
      setMap(campaign.maps[0]);
      if (campaign.maps[0].challenges.length === 1) {
        onChallengeSelect(campaign.maps[0].challenges[0]);
      } else {
        onChallengeSelect(null);
      }
    } else {
      setMap(null);
      onChallengeSelect(null);
    }
  };
  const onMapSelect = (map) => {
    setMap(map);
    if (map !== null && map.challenges.length === 1) {
      onChallengeSelect(map.challenges[0]);
    } else {
      onChallengeSelect(null);
    }
  };

  const onChallengeSelect = (challenge) => {
    setChallenge(challenge);
    if (challenge !== null) {
      if (challenge.has_fc) {
        form.setValue("is_fc", null);
      } else {
        form.setValue("is_fc", challenge.requires_fc);
      }
    } else {
      form.setValue("is_fc", null);
    }
  };
  //#endregion

  //#region Player Management
  const addPlayer = () => {
    if (isAddingPlayer) {
      if (newPlayerName !== "") {
        postPlayer({ name: newPlayerName })
          .then((response) => {
            setSelectedPlayer(response.data);
            setIsAddingPlayer(false);
          })
          .catch((e) => {});
      } else {
        setIsAddingPlayer(false);
      }
    } else {
      setIsAddingPlayer(true);
    }
  };
  //#endregion

  //#region Render
  return (
    <>
      <h1 style={{ marginBottom: "0" }}>{t("header")}</h1>
      <Stack gap={2}>
        <h4 style={{ marginBottom: "0" }}>{t("select")}</h4>
        <CampaignSelect selected={campaign} setSelected={onCampaignSelect} />
        {campaign && (
          <>
            <MapSelect campaign={campaign} selected={map} setSelected={onMapSelect} />
          </>
        )}
        {map && <ChallengeSelect map={map} selected={challenge} setSelected={onChallengeSelect} />}
        {campaign && map === null && campaign.challenges?.length > 0 && (
          <>
            <Divider>
              <Chip label={t("full_game")} size="small" />
            </Divider>
            <CampaignChallengeSelect
              campaign={campaign}
              selected={challenge}
              setSelected={onChallengeSelect}
            />
          </>
        )}
      </Stack>
      {challenge && (
        <>
          {challenge.is_rejected && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {t("rejected_notice")}
            </Alert>
          )}
          <h4>{t("challenge_data")}</h4>
          <FullChallengeDisplay challenge={challenge} map={map} campaign={campaign} hideMap showObjective />
          {map?.note && <NoteDisclaimer note={map.note} title={t("map_note")} sx={{ mt: 2 }} />}
          {challenge.description && (
            <NoteDisclaimer note={challenge.description} title={t("challenge_note")} sx={{ mt: 2 }} />
          )}
        </>
      )}
      <Divider sx={{ my: 3 }} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography variant="h6">{t("your_run")}</Typography>
            {!auth.hasHelperPriv && (
              <>
                <Typography variant="h6">
                  <FontAwesomeIcon icon={faArrowRight} />
                </Typography>
                <PlayerChip player={selectedPlayer} />
              </>
            )}
          </Stack>
        </Grid>
      </Grid>
      <form>
        <Grid container spacing={2}>
          {auth.hasHelperPriv && (
            <>
              <Grid item xs={12} sm={6}>
                <PlayerSelect
                  type="all"
                  label={t("verifier.player_select")}
                  value={selectedPlayer}
                  onChange={(e, v) => setSelectedPlayer(v)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" gap={1} alignItems="center" sx={{ height: "100%" }}>
                  {isAddingPlayer && (
                    <TextField
                      label={t("verifier.new_player_name")}
                      fullWidth
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                    />
                  )}
                  <Button
                    variant={isAddingPlayer ? "contained" : "outlined"}
                    color={isAddingPlayer && newPlayerName.length < 3 ? "error" : "primary"}
                    onClick={addPlayer}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {t(
                      isAddingPlayer && newPlayerName.length < 3
                        ? "verifier.buttons.cancel"
                        : "verifier.buttons.add_player",
                    )}
                  </Button>
                </Stack>
              </Grid>
            </>
          )}
          <Grid item xs={12}>
            <CFCSelector value={is_fc} onChange={(v) => form.setValue("is_fc", v)} challenge={challenge} />
          </Grid>
          <Grid item xs>
            <TextField
              label={t_fs("proof_url") + " *"}
              fullWidth
              {...form.register("proof_url", { validate: validateUrl })}
              error={errors.proof_url}
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
              {t(showEmbed ? "hide_embed" : "test_embed")}
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ "&&": { pt: 0 } }}>
            <FormHelperText>{t("proof_note")}</FormHelperText>
          </Grid>
          {showEmbed && (
            <Grid item xs={12} sx={{ "&&": { pt: 1 } }}>
              <ProofEmbed url={form.watch("proof_url")} />
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              label={t_fs("raw_session_url") + (needsRawSession ? " *" : " (Optional)")}
              fullWidth
              {...form.register("raw_session_url", {
                validate: needsRawSession ? validateUrl : validateUrlNotRequired,
              })}
              error={errors.raw_session_url}
              helperText={
                errors.raw_session_url?.message ? (
                  <Trans
                    t={t_ff}
                    i18nKey={"submission_url." + errors.raw_session_url?.message}
                    components={{ CustomLink: <StyledLink /> }}
                  />
                ) : null
              }
            />
            <FormHelperText>{t("raw_session_note")}</FormHelperText>
            {sameUrl && (
              <Typography variant="caption" color="error">
                {t("raw_session_same_url_info")}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t_fs("player_notes")}
              multiline
              fullWidth
              minRows={2}
              {...form.register("player_notes")}
            />
            <CharsCountLabel text={form.watch("player_notes")} maxChars={5000} />
          </Grid>
          <Grid item xs={12} sm>
            <Controller
              control={form.control}
              name="suggested_difficulty_id"
              render={({ field }) => (
                <DifficultySelectControlled
                  label={t_a("components.difficulty_select.label")}
                  difficultyId={field.value}
                  setDifficultyId={field.onChange}
                  isSuggestion
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm="auto" display="flex" alignItems="center" justifyContent="center">
            <Controller
              control={form.control}
              name="is_personal"
              render={({ field }) => (
                <FormControlLabel
                  onChange={field.onChange}
                  label={t_fs("is_personal")}
                  checked={field.value}
                  control={<Checkbox />}
                />
              )}
            />
            <TooltipInfoButton title={t_fs("personal_note")} />
          </Grid>
          <Grid item xs={12} sm={12} sx={{ "&&": { pt: 0 } }}>
            <Controller
              control={form.control}
              name="frac"
              render={({ field }) => (
                <DifficultyFracGrid
                  value={field.value}
                  onChange={field.onChange}
                  disabled={suggested_difficulty_id === null}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ mt: 2 }}>
            <TextField
              {...form.register("time_taken", FormOptions.TimeTaken(t_ff))}
              label={t_fs("time_taken")}
              fullWidth
              InputLabelProps={{ shrink: true }}
              placeholder="(hh:)mm:ss"
              error={!!errors.time_taken}
            />
            {errors.time_taken && (
              <Typography variant="caption" color="error">
                {errors.time_taken.message}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} display="flex" alignItems="center" sx={{ mt: { xs: 0, sm: 2 } }}>
            <Controller
              control={form.control}
              name="like_challenge"
              render={({ field }) => (
                <FormControlLabel
                  onChange={field.onChange}
                  label={t("like_challenge")}
                  checked={field.value}
                  control={<Checkbox />}
                />
              )}
            />
          </Grid>
          <Grid item xs>
            <Controller
              control={form.control}
              name="date_achieved"
              render={({ field }) => (
                <DateAchievedTimePicker
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs="auto" display="flex" alignItems="center" justifyContent="center">
            <TooltipInfoButton title={t("date_achieved_note")} />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={onSubmit}
              disabled={challenge === null || selectedPlayer === null}
            >
              {t("button")}
            </Button>
          </Grid>
          <NotificationNotice />
        </Grid>
      </form>
    </>
  );
  //#endregion
}
//#endregion

import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Trans, useTranslation } from "react-i18next";

import { durationToSeconds } from "../../util/data_util";
import { DIFF_CONSTS, FormOptions, difficultyIdToSort } from "../../util/constants";
import { useAuth } from "../../hooks/AuthProvider";
import { ProofEmbed, StyledLink, TooltipInfoButton } from "../basic";
import { PlayerSelect, PlayerChip, DateAchievedTimePicker, DifficultySelectControlled } from "../goldberries";
import { usePostSubmission } from "../../hooks/useApi";
import { getCollectibleOptions, getCollectibleVariantOptions } from "../forms/Map";
import { StringListEditor } from "../StringListEditor";
import { DifficultyFracGrid } from "../forms/Submission";
import { CharsCountLabel } from "../../pages/Suggestions";

import { CFCSelector, NotificationNotice, validateUrl, validateUrlNotRequired } from "./shared";

//#region NewChallengeSubmission
export function NewChallengeSubmission({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "submit.tabs.new" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const { t: t_fs } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  const { t: t_fm } = useTranslation(undefined, { keyPrefix: "forms.map" });
  const { t: t_ts } = useTranslation(undefined, { keyPrefix: "submit.tabs.single" });
  const { t: t_a } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState(auth.user?.player ?? null);
  const [showEmbed, setShowEmbed] = useState(false);

  const { mutate: submitRun } = usePostSubmission((submission) => {
    navigate("/submission/" + submission.id);
  });

  //#region Form Setup
  const form = useForm({
    defaultValues: {
      new_challenge: {
        url: "",
        name: "",
        description: "",
        collectibles: null,
        golden_changes: "",
      },
      proof_url: "",
      raw_session_url: "",
      player_notes: "",
      is_fc: null,
      suggested_difficulty_id: null,
      frac: 50,
      is_personal: false,
      time_taken: "",
      date_achieved: new Date().toISOString(),
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    if (data.new_challenge?.collectibles) {
      const filteredCollectibles = data.new_challenge.collectibles.filter(
        (item) => item[0] && item[0] !== "",
      );
      data.new_challenge.collectibles = filteredCollectibles.length > 0 ? filteredCollectibles : null;
    }
    submitRun({
      player_id: selectedPlayer.id,
      ...data,
      time_taken: durationToSeconds(data.time_taken),
    });
  });
  const errors = form.formState.errors;
  const suggested_difficulty_id = form.watch("suggested_difficulty_id");
  const proof_url = form.watch("proof_url");
  const raw_session_url = form.watch("raw_session_url");
  const needsRawSession =
    suggested_difficulty_id !== null &&
    difficultyIdToSort(suggested_difficulty_id) >= DIFF_CONSTS.RAW_SESSION_REQUIRED_SORT;
  const sameUrl = proof_url === raw_session_url && raw_session_url !== "";
  const is_fc = form.watch("is_fc");
  //#endregion

  //#region Render
  return (
    <>
      <h1 style={{ marginBottom: "0" }}>{t("header")}</h1>
      <form>
        <Typography variant="body1">{t("info")}</Typography>
        <h4>{t("challenge_data")}</h4>
        <Stack direction="column" gap={2}>
          <TextField
            label={t("gamebanana_url") + " *"}
            fullWidth
            {...form.register("new_challenge.url", FormOptions.UrlRequired(t_ff))}
            error={errors.new_challenge?.url}
            helperText={errors.new_challenge?.url?.message}
          />
          <TextField
            label={t_a("forms.create_full_challenge.map_name") + " *"}
            fullWidth
            {...form.register("new_challenge.name", FormOptions.Name128Required(t_ff))}
            error={errors.new_challenge?.name}
            helperText={errors.new_challenge?.name?.message}
          />
          <TextField
            label={t("challenge_description.label")}
            fullWidth
            multiline
            minRows={3}
            {...form.register("new_challenge.description")}
            InputLabelProps={{ shrink: true }}
            placeholder={t("challenge_description.placeholder")}
          />
          <TextField
            label={t("golden_changes.label")}
            fullWidth
            multiline
            minRows={2}
            {...form.register("new_challenge.golden_changes")}
            InputLabelProps={{ shrink: true }}
            placeholder={t("golden_changes.placeholder")}
          />
          <Controller
            control={form.control}
            name="new_challenge.collectibles"
            render={({ field }) => (
              <StringListEditor
                label={t_fm("collectibles.label")}
                valueTypes={[
                  {
                    type: "enum",
                    options: getCollectibleOptions(),
                  },
                  { type: "enum", options: (item, index, value) => getCollectibleVariantOptions(item[0]) },
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
                list={field.value}
                setList={field.onChange}
                valueCount={5}
                reorderable
                inline={[6, 6, 12, 6, 6]}
              />
            )}
          />
        </Stack>
        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
              <Typography variant="h6">{t_ts("your_run")}</Typography>
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
        <Grid container spacing={2}>
          {auth.hasHelperPriv && (
            <>
              <Grid item xs={12} sm={6}>
                <PlayerSelect
                  type="all"
                  label={t_ts("verifier.player_select")}
                  value={selectedPlayer}
                  onChange={(e, v) => setSelectedPlayer(v)}
                />
              </Grid>
              <Grid item xs={12} sm={6}></Grid>
            </>
          )}
          <Grid item xs={12}>
            <CFCSelector value={is_fc} onChange={(v) => form.setValue("is_fc", v)} challenge={null} enabled />
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
            <FormHelperText>{t_ts("raw_session_note")}</FormHelperText>
            {sameUrl && (
              <Typography variant="caption" color="error">
                {t_ts("raw_session_same_url_info")}
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
          <Grid item xs={12} sm={12}>
            <TextField
              {...form.register("time_taken", FormOptions.TimeTaken(t_ff))}
              label={t_fs("time_taken")}
              fullWidth
              sx={{ mt: 2 }}
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
            <TooltipInfoButton title={t_ts("date_achieved_note")} />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Button variant="contained" fullWidth onClick={onSubmit}>
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

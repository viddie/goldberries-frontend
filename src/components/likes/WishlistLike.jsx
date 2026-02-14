import { Button, Divider, Slider, Stack, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { usePostChallengeLike } from "../../hooks/useApi";
import { FormOptions } from "../../util/constants";
import { durationToSeconds, secondsToDuration } from "../../util/data_util";
import { SkullIcon } from "../goldberries";

export function FormWishlistLike({ like, onSave, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.wishlist_like" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });

  const { mutate: saveLike } = usePostChallengeLike((data) => {
    toast.success(t("feedback.updated"));
    if (onSave) onSave(data);
  });

  const form = useForm({
    defaultValues: {
      progress: like.progress,
      comment: like.comment ?? "",
      time_taken: like.time_taken ? secondsToDuration(like.time_taken) : "",
      state: like.state ?? null,
      low_death: like.low_death ?? null,
    },
  });

  const progress = form.watch("progress");
  const state = form.watch("state");
  const lowDeath = form.watch("low_death");

  const onUpdateSubmit = form.handleSubmit((data) => {
    const timeTakenSeconds = data.time_taken ? durationToSeconds(data.time_taken) : null;
    saveLike({
      id: like.id,
      challenge_id: like.challenge_id,
      is_wishlist: true,
      state: data.state,
      progress: data.progress,
      comment: data.comment.trim() || null,
      time_taken: timeTakenSeconds,
      low_death: data.progress !== null ? data.low_death : null,
    });
  });

  const onRemoveWishlist = () => {
    saveLike({
      id: like.id,
      challenge_id: like.challenge_id,
      is_wishlist: false,
      state: null,
      progress: null,
      comment: null,
      time_taken: null,
      low_death: null,
    });
  };

  const onRemoveProgress = () => {
    form.setValue("progress", null);
    form.setValue("low_death", null);
  };

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        {t("title")}
      </Typography>

      {/* State */}
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {t("state")}
      </Typography>
      <WishlistStateButtons value={state} onChange={(value) => form.setValue("state", value)} />

      {/* Progress */}
      <Typography variant="subtitle2" sx={{ mt: 1.0 }}>
        {t("progress")}
      </Typography>
      {progress === null ? (
        <Button variant="outlined" size="small" sx={{ mt: 0.5 }} onClick={() => form.setValue("progress", 0)}>
          {t("add_progress")}
        </Button>
      ) : (
        <Stack direction="column" gap={1} sx={{ mt: 0.5 }}>
          <Stack direction="row" alignItems="center" gap={2} sx={{ ml: 1.0 }}>
            <Slider
              value={progress}
              onChange={(_, value) => form.setValue("progress", value)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
              step={1}
              min={0}
              max={100}
              sx={{ flex: 1 }}
            />
            <Typography variant="body2" sx={{ fontWeight: "bold", minWidth: "36px", textAlign: "right" }}>
              {progress}%
            </Typography>
            <LowDeathInput value={lowDeath} onChange={(value) => form.setValue("low_death", value)} />
          </Stack>
          <Button variant="text" size="small" color="error" fullWidth onClick={onRemoveProgress}>
            {t("remove_progress")}
          </Button>
        </Stack>
      )}

      {/* Comment */}
      <TextField
        {...form.register("comment")}
        label={t("comment")}
        fullWidth
        multiline
        minRows={3}
        inputProps={{ maxLength: 1000 }}
        sx={{ mt: 2.0 }}
      />

      {/* Time Taken */}
      <TextField
        {...form.register("time_taken", FormOptions.TimeTaken(t_ff))}
        label={t("time_taken")}
        fullWidth
        InputLabelProps={{ shrink: true }}
        placeholder="(hh:)mm:ss"
        error={!!form.formState.errors.time_taken}
        sx={{ mt: 2.0 }}
      />
      {form.formState.errors.time_taken && (
        <Typography variant="caption" color="error">
          {form.formState.errors.time_taken.message}
        </Typography>
      )}

      {/* Save Button */}
      <Button variant="contained" fullWidth color="primary" onClick={onUpdateSubmit} sx={{ mt: 2 }}>
        {t("save")}
      </Button>

      <Divider sx={{ my: 2 }} />

      {/* Remove Wishlist Entry */}
      <Button variant="outlined" fullWidth color="error" onClick={onRemoveWishlist}>
        {t("remove_wishlist")}
      </Button>
    </form>
  );
}

//#region Constants
const LIKE_STATES = ["current", "soon", "on_hold", "backlog"];
const WISHLIST_STATE_COLORS_ALT = {
  current: "#42a5f5",
  on_hold: "#ef5350",
  soon: "#d4a000",
  backlog: "#adadad",
};
//#endregion

//#region WishlistStateButtons
function WishlistStateButtons({ value, onChange }) {
  const { t } = useTranslation(undefined, { keyPrefix: "likes.state" });

  return (
    <Stack direction="row" gap={1}>
      {LIKE_STATES.map((state) => {
        const isSelected = value === state;
        const color = WISHLIST_STATE_COLORS_ALT[state];
        return (
          <Button
            key={state}
            variant={isSelected ? "contained" : "outlined"}
            size="small"
            onClick={() => onChange(state)}
            sx={{
              flex: 1,
              borderColor: color,
              color: isSelected ? "#fff" : color,
              backgroundColor: isSelected ? color : "transparent",
              "&:hover": {
                borderColor: color,
                backgroundColor: isSelected ? color : `${color}22`,
              },
            }}
          >
            {t(state)}
          </Button>
        );
      })}
    </Stack>
  );
}
//#endregion

//#region LowDeathInput
function LowDeathInput({ value, onChange }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.wishlist_like" });

  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      <SkullIcon height="18px" />
      <TextField
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(null);
            return;
          }
          const parsed = parseInt(raw, 10);
          if (!isNaN(parsed) && parsed >= 0) {
            onChange(parsed);
          }
        }}
        size="small"
        placeholder={t("low_death_placeholder")}
        inputProps={{ min: 0, style: { width: "60px", textAlign: "center" } }}
        sx={{ "& .MuiInputBase-input": { py: 0.5 } }}
      />
    </Stack>
  );
}
//#endregion

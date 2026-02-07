import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import { useForm } from "react-hook-form";
import { Alert, Button, FormHelperText, Grid, Stack, TextField } from "@mui/material";
import { toast } from "react-toastify";

import { usePostSuggestion } from "../../hooks/useApi";
import { CharsCountLabel } from "../../pages/Suggestions";
import { BackButton } from "./CreateSuggestionModal";

export function FeatureSuggestionForm({ onSuccess, onBack }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.create" });
  const theme = useTheme();
  const { mutate: postSuggestion, isLoading: postSuggestionLoading } = usePostSuggestion(() => {
    toast.success(t("feedback.created"));
    if (onSuccess) onSuccess();
  });

  const form = useForm({
    defaultValues: {
      comment: "",
    },
  });

  const comment = form.watch("comment");
  const isDisabled = comment.length < 10;

  const onSubmit = form.handleSubmit((data) => {
    // Hardcoded English prefix since it's sent to the server
    const featurePrefix =
      "FEATURE: This is a feature suggestion. Vote 'for' if you would use this feature or 'against' if you wouldn't use it.";
    const fullComment = `${featurePrefix}\n\n${data.comment}`;
    postSuggestion({
      challenge_id: null,
      suggested_difficulty_id: null,
      comment: fullComment,
    });
  });

  return (
    <>
      <Grid item xs={12}>
        <Alert severity="info" variant="outlined">
          {t("feature_alert")}
        </Alert>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t("comment.label")}
          placeholder={t("feature_placeholder")}
          required
          multiline
          minRows={3}
          variant="outlined"
          {...form.register("comment")}
        />
        <CharsCountLabel text={comment} maxChars={1000} minChars={10} />
        {comment.length < 10 && (
          <FormHelperText sx={{ color: theme.palette.error.main }}>{t("comment.required")}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" gap={1} justifyContent="space-between">
          <BackButton onBack={onBack} />
          <Button
            variant="contained"
            color="primary"
            onClick={onSubmit}
            disabled={isDisabled || postSuggestionLoading}
          >
            {t("button")}
          </Button>
        </Stack>
      </Grid>
    </>
  );
}

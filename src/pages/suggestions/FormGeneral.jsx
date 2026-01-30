import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import { useForm } from "react-hook-form";
import { Button, FormHelperText, Grid, Stack, TextField } from "@mui/material";
import { toast } from "react-toastify";

import { usePostSuggestion } from "../../hooks/useApi";
import { CharsCountLabel } from "./Suggestions";
import { BackButton } from "./CreateSuggestionModal";

export function GeneralSuggestionForm({ onSuccess, onBack }) {
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
    postSuggestion({
      challenge_id: null,
      suggested_difficulty_id: null,
      comment: data.comment,
    });
  });

  return (
    <>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t("comment.label")}
          placeholder={t("comment.placeholder")}
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

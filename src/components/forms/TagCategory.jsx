import { Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { MuiColorInput } from "mui-color-input";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { usePostTagCategory } from "../../hooks/useApi";
import { TagChip } from "../tags";

export function FormTagCategory({ category, onSave, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.tag_category" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  const isNew = category.id === null;

  const { mutate: saveCategory, isLoading } = usePostTagCategory((data) => {
    toast.success(t(isNew ? "feedback.created" : "feedback.updated"));
    if (onSave) onSave(data);
  });

  const form = useForm({ defaultValues: getDefaultValues(category) });
  const onSubmit = form.handleSubmit((data) => {
    saveCategory({
      id: data.id ?? undefined,
      name: data.name,
      description: data.description,
      color: data.color || null,
      sort: parseInt(data.sort) || 0,
      is_archived: data.is_archived,
    });
  });

  useEffect(() => {
    form.reset(getDefaultValues(category));
  }, [category]);

  const name = form.watch("name");
  const color = form.watch("color");
  const errors = form.formState.errors;

  return (
    <form {...props}>
      <Stack direction="row" alignItems="center" gap={2}>
        <Typography variant="h6">
          {t("title")} ({isNew ? t_g("new") : category.id})
        </Typography>
        <TagChip
          tag={{ name: name || "…", description: "" }}
          value={null}
          category={{ color: color || null }}
          showTooltip={false}
        />
      </Stack>

      <TextField
        label={t("name") + " *"}
        sx={{ mt: 2 }}
        fullWidth
        error={!!errors.name}
        {...form.register("name", { required: true, maxLength: 64 })}
      />
      <TextField
        label={t_g("description")}
        sx={{ mt: 2 }}
        fullWidth
        multiline
        minRows={2}
        {...form.register("description")}
      />
      <Stack direction="row" gap={2} sx={{ mt: 2 }} alignItems="center">
        <Controller
          control={form.control}
          name="color"
          render={({ field: { onChange, value } }) => (
            <MuiColorInput
              format="hex"
              label={t("color")}
              value={value ?? ""}
              fullWidth
              onChange={(value, colors) => onChange(value === "" ? "" : colors.hex)}
              isAlphaHidden
            />
          )}
        />
        <Button variant="outlined" onClick={() => form.setValue("color", "")} sx={{ whiteSpace: "nowrap" }}>
          {t("reset_color")}
        </Button>
      </Stack>
      <TextField
        label={t("sort")}
        type="number"
        sx={{ mt: 2 }}
        fullWidth
        helperText={t("sort_note")}
        {...form.register("sort")}
      />
      <Controller
        control={form.control}
        name="is_archived"
        render={({ field }) => (
          <FormControlLabel
            sx={{ mt: 1 }}
            onChange={field.onChange}
            label={t("is_archived")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <Typography variant="caption" color="text.secondary" component="div">
        {t("is_archived_note")}
      </Typography>

      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={onSubmit} disabled={isLoading}>
        {t(isNew ? "buttons.create" : "buttons.update")}
      </Button>
    </form>
  );
}

function getDefaultValues(category) {
  return {
    id: category.id,
    name: category.name ?? "",
    description: category.description ?? "",
    color: category.color ?? "",
    sort: category.sort ?? 0,
    is_archived: category.is_archived ?? false,
  };
}

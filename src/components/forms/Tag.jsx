import { faArrowDown, faArrowUp, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Alert,
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { usePostTag } from "../../hooks/useApi";
import { CustomIconButton } from "../basic";
import { TAG_SELECTION_MODES, isImplicitTag } from "../tags";

export function FormTag({ tag, categories, onSave, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.tag" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [values, setValues] = useState(() => getDefaultValueRows(tag));

  const isNew = tag.id === null;

  const { mutate: saveTag, isLoading } = usePostTag((data) => {
    toast.success(t(isNew ? "feedback.created" : "feedback.updated"));
    if (onSave) onSave(data);
  });

  const form = useForm({ defaultValues: getDefaultValues(tag) });
  const onSubmit = form.handleSubmit((data) => {
    if (values.some((row) => row.name.trim() === "")) {
      toast.error(t("feedback.value_name_required"));
      return;
    }
    saveTag({
      id: data.id ?? undefined,
      category_id: data.category_id,
      name: data.name,
      short: data.short.trim() === "" ? null : data.short.trim(),
      description: data.description,
      sort: parseInt(data.sort) || 0,
      is_common: data.is_common,
      is_player_assignable: data.is_player_assignable,
      is_ordinal: data.is_ordinal,
      selection_mode: data.selection_mode,
      values: values.map((row) => ({
        id: row.id ?? undefined,
        name: row.name,
        description: row.description,
      })),
    });
  });

  useEffect(() => {
    form.reset(getDefaultValues(tag));
    setValues(getDefaultValueRows(tag));
  }, [tag]);

  const errors = form.formState.errors;

  const keptIds = new Set(values.map((row) => row.id).filter((id) => id !== null));
  const removedValues =
    isImplicitTag(tag) && values.length === 0 ? [] : tag.values.filter((v) => !keptIds.has(v.id));

  //#region Value list handling
  const updateRow = (index, changes) => {
    setValues(values.map((row, i) => (i === index ? { ...row, ...changes } : row)));
  };
  const moveRow = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const copy = [...values];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setValues(copy);
  };
  const removeRow = (index) => {
    setValues(values.filter((_, i) => i !== index));
  };
  const addRow = () => {
    setValues([...values, { key: Math.random(), id: null, name: "", description: "" }]);
  };
  //#endregion

  return (
    <form {...props}>
      <Typography variant="h6">
        {t("title")} ({isNew ? t_g("new") : tag.id})
      </Typography>

      <Controller
        control={form.control}
        name="category_id"
        rules={{ required: true }}
        render={({ field }) => (
          <TextField
            select
            label={t("category") + " *"}
            sx={{ mt: 2 }}
            fullWidth
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            error={!!errors.category_id}
            SelectProps={{ MenuProps: { disableScrollLock: true } }}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <TextField
        label={t("name") + " *"}
        sx={{ mt: 2 }}
        fullWidth
        error={!!errors.name}
        {...form.register("name", { required: true, maxLength: 64 })}
      />
      <TextField
        label={t("short")}
        sx={{ mt: 2 }}
        fullWidth
        helperText={t("short_note")}
        error={!!errors.short}
        {...form.register("short", { maxLength: 64 })}
      />
      <TextField
        label={t_g("description") + " *"}
        sx={{ mt: 2 }}
        fullWidth
        multiline
        minRows={2}
        error={!!errors.description}
        {...form.register("description", { required: true })}
      />
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("sort")}
            type="number"
            fullWidth
            helperText={t("sort_note")}
            {...form.register("sort")}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            control={form.control}
            name="selection_mode"
            render={({ field }) => (
              <TextField
                select
                label={t("selection_mode.label")}
                fullWidth
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                helperText={t("selection_mode.notes." + field.value)}
                SelectProps={{ MenuProps: { disableScrollLock: true } }}
              >
                {TAG_SELECTION_MODES.map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    {t("selection_mode.options." + mode)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
      </Grid>

      <Stack direction="column" sx={{ mt: 1 }}>
        <FormCheckbox form={form} name="is_ordinal" label={t("is_ordinal")} note={t("is_ordinal_note")} />
        <FormCheckbox form={form} name="is_common" label={t("is_common")} note={t("is_common_note")} />
        <FormCheckbox
          form={form}
          name="is_player_assignable"
          label={t("is_player_assignable")}
          note={t("is_player_assignable_note")}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">{t("values.title")}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t("values.note")}
      </Typography>
      <Stack direction="column" gap={1.5}>
        {values.length === 0 && (
          <Typography variant="body2" fontStyle="italic">
            {t("values.none")}
          </Typography>
        )}
        {values.map((row, index) => (
          <Stack key={row.key} direction="row" gap={1} alignItems="flex-start">
            <Grid container spacing={1}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t("values.name") + " *"}
                  size="small"
                  fullWidth
                  value={row.name}
                  error={row.name.trim() === ""}
                  onChange={(e) => updateRow(index, { name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label={t("values.description")}
                  size="small"
                  fullWidth
                  multiline
                  value={row.description}
                  onChange={(e) => updateRow(index, { description: e.target.value })}
                />
              </Grid>
            </Grid>
            <ButtonGroup size="small" sx={{ alignSelf: "stretch" }}>
              <CustomIconButton onClick={() => moveRow(index, -1)} disabled={index === 0}>
                <FontAwesomeIcon icon={faArrowUp} />
              </CustomIconButton>
              <CustomIconButton onClick={() => moveRow(index, 1)} disabled={index === values.length - 1}>
                <FontAwesomeIcon icon={faArrowDown} />
              </CustomIconButton>
              <CustomIconButton color="error" onClick={() => removeRow(index)}>
                <FontAwesomeIcon icon={faTrash} />
              </CustomIconButton>
            </ButtonGroup>
          </Stack>
        ))}
        <Button
          variant="outlined"
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={addRow}
          sx={{ alignSelf: "flex-start" }}
        >
          {t("values.add")}
        </Button>
        {removedValues.length > 0 && (
          <Alert severity="warning">
            {t("values.removed_warning", { values: removedValues.map((v) => v.name ?? tag.name).join(", ") })}
          </Alert>
        )}
      </Stack>

      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={onSubmit} disabled={isLoading}>
        {t(isNew ? "buttons.create" : "buttons.update")}
      </Button>
    </form>
  );
}

function FormCheckbox({ form, name, label, note, disabled = false }) {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Stack direction="column">
          <FormControlLabel
            onChange={field.onChange}
            label={label}
            checked={field.value}
            disabled={disabled}
            control={<Checkbox />}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: -1, mb: 0.5, ml: 4 }}>
            {note}
          </Typography>
        </Stack>
      )}
    />
  );
}

function getDefaultValues(tag) {
  return {
    id: tag.id,
    category_id: tag.category_id ?? null,
    name: tag.name ?? "",
    short: tag.short ?? "",
    description: tag.description ?? "",
    sort: tag.sort ?? 0,
    is_common: tag.is_common ?? false,
    is_player_assignable: tag.is_player_assignable ?? true,
    is_ordinal: tag.is_ordinal ?? false,
    selection_mode: tag.selection_mode ?? "single",
  };
}

function getDefaultValueRows(tag) {
  //Tags without qualifiers have a single implicit value, which is represented as an empty list in the form
  if (!tag.values || isImplicitTag(tag)) return [];
  return tag.values.map((value) => ({
    key: value.id,
    id: value.id,
    name: value.name ?? "",
    description: value.description ?? "",
  }));
}

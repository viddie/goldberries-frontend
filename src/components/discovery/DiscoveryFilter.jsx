import {
  faCheck,
  faChevronDown,
  faChevronUp,
  faFilter,
  faPlus,
  faRotateLeft,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { TooltipInfoButton } from "../basic";
import { TagChip, getTagCategoryColor, isImplicitTag } from "../tags";

const MAX_CONFIDENCE = 100;
const DEFAULT_AGREEMENT = 50;
const MAX_CONDITIONS = 20;
const FILTER_BACKGROUND = "#303030";
const CONDITION_BACKGROUND = "#3a3a3a";

//#region DiscoveryFilter
// Builds a filter in the format of GET /challenge/discovery. `filter` is the currently applied (already sanitized)
// API filter. Changes are only kept locally until the user applies them.
export function DiscoveryFilter({ filter, onApply, lookup }) {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery.filter" });
  const [collapsed, setCollapsed] = useState(false);
  const [conditions, setConditions] = useState(() => fromApiFilter(filter, lookup));
  const [confidence, setConfidence] = useState(filter.confidence ?? 1);
  const [agreement, setAgreement] = useState(filter.agreement ?? DEFAULT_AGREEMENT);

  // Reset the local state if the applied filter was changed from the outside (e.g. browser navigation)
  const filterString = JSON.stringify(filter);
  useEffect(() => {
    if (JSON.stringify(toApiFilter(conditions, confidence, agreement, lookup)) !== filterString) {
      setConditions(fromApiFilter(filter, lookup));
      setConfidence(filter.confidence ?? 1);
      setAgreement(filter.agreement ?? DEFAULT_AGREEMENT);
    }
  }, [filterString]);

  const localFilter = toApiFilter(conditions, confidence, agreement, lookup);
  const hasChanges = JSON.stringify(localFilter) !== filterString;
  const isDefault = conditions.length === 0 && confidence === 1 && agreement === DEFAULT_AGREEMENT;

  const updateCondition = (index, changes) => {
    setConditions(conditions.map((c, i) => (i === index ? { ...c, ...changes } : c)));
  };
  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };
  const addCondition = (tag) => {
    setConditions([...conditions, createCondition(tag.id)]);
  };
  const onReset = () => {
    setConditions([]);
    setConfidence(1);
    setAgreement(DEFAULT_AGREEMENT);
    onApply({});
  };
  const onApplyClick = () => {
    onApply(localFilter);
  };

  const allTags = lookup.categories.flatMap((category) =>
    (category.tags ?? []).map((tag) => ({ tag, category })),
  );
  const appliedCount = filter.conditions?.length ?? 0;

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        backgroundColor: FILTER_BACKGROUND,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <FontAwesomeIcon icon={faFilter} />
        <Typography variant="h6">{t("title")}</Typography>
        {appliedCount > 0 && (
          <Typography variant="body1" color="text.secondary">
            ({appliedCount})
          </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {!collapsed && !isDefault && (
          <Button
            size="small"
            variant="text"
            startIcon={<FontAwesomeIcon icon={faRotateLeft} size="sm" />}
            onClick={onReset}
          >
            {t("reset")}
          </Button>
        )}
        <Tooltip title={collapsed ? t("expand") : t("collapse")} arrow>
          <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
            <FontAwesomeIcon icon={collapsed ? faChevronDown : faChevronUp} size="sm" fixedWidth />
          </IconButton>
        </Tooltip>
      </Stack>

      <Collapse in={!collapsed}>
        <Stack direction="column" gap={1.5} sx={{ pt: 1.5 }}>
          {conditions.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {t("no_conditions")}
            </Typography>
          )}
          {conditions.map((condition, index) => (
            <FilterConditionRow
              key={condition.key}
              condition={condition}
              lookup={lookup}
              onChange={(changes) => updateCondition(index, changes)}
              onRemove={() => removeCondition(index)}
            />
          ))}

          <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems={{ xs: "stretch", sm: "center" }}>
            <Autocomplete
              options={allTags}
              value={null}
              onChange={(e, option) => option && addCondition(option.tag)}
              groupBy={(option) => option.category.name}
              getOptionLabel={(option) => option.tag.name}
              isOptionEqualToValue={(option, value) => option.tag.id === value.tag.id}
              disabled={conditions.length >= MAX_CONDITIONS}
              blurOnSelect
              clearOnBlur
              sx={{ flex: 1, maxWidth: { sm: 400 } }}
              size="small"
              renderOption={(props, option) => (
                <li {...props} key={option.tag.id}>
                  <Stack direction="column">
                    <span>{option.tag.name}</span>
                    <Typography variant="caption" color="text.secondary">
                      {option.tag.description}
                    </Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("add_condition")}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <FontAwesomeIcon icon={faPlus} style={{ marginLeft: 6, marginRight: 4 }} />
                    ),
                  }}
                />
              )}
            />
            <Stack direction="row" alignItems="center" gap={1}>
              <FilterNumberField
                label={t("agreement")}
                value={agreement}
                onChange={setAgreement}
                min={0}
                max={100}
              />
              <FilterNumberField
                label={t("confidence")}
                value={confidence}
                onChange={setConfidence}
                min={1}
                max={MAX_CONFIDENCE}
              />
              <TooltipInfoButton title={<FilterThresholdsNote />} />
            </Stack>
            <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }} />
            <Button
              variant="contained"
              startIcon={<FontAwesomeIcon icon={faCheck} size="sm" />}
              onClick={onApplyClick}
              disabled={!hasChanges}
            >
              {t("apply")}
            </Button>
          </Stack>
        </Stack>
      </Collapse>
    </Box>
  );
}
//#endregion

//#region FilterConditionRow
function FilterConditionRow({ condition, lookup, onChange, onRemove }) {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery.filter" });
  const { tag, category } = lookup.tagsById[condition.tag_id];
  const implicit = isImplicitTag(tag);
  const operators = getOperatorsForTag(tag);
  const color = getTagCategoryColor(category);

  const onOperatorChange = (op) => {
    onChange({ op, values: [], min: null, max: null });
  };
  const toggleValue = (valueId) => {
    const values = condition.values.includes(valueId)
      ? condition.values.filter((id) => id !== valueId)
      : [...condition.values, valueId];
    onChange({ values });
  };

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      gap={1}
      alignItems={{ xs: "stretch", md: "center" }}
      sx={{
        p: 1,
        borderRadius: 1,
        borderLeft: "3px solid " + color,
        backgroundColor: CONDITION_BACKGROUND,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: { md: 160 } }}>
        <TagChip tag={tag} value={null} category={category} />
        <Box sx={{ flexGrow: 1 }} />
        <IconButton size="small" onClick={onRemove} sx={{ display: { xs: "inline-flex", md: "none" } }}>
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </Stack>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={condition.mode}
        onChange={(e, mode) => mode && onChange({ mode })}
      >
        <ToggleButton value="include" color="success">
          {t("modes.include")}
        </ToggleButton>
        <ToggleButton value="exclude" color="error">
          {t("modes.exclude")}
        </ToggleButton>
      </ToggleButtonGroup>
      {!implicit && (
        <TextField
          select
          size="small"
          value={condition.op}
          onChange={(e) => onOperatorChange(e.target.value)}
          sx={{ minWidth: 150 }}
          SelectProps={{ MenuProps: { disableScrollLock: true } }}
        >
          {operators.map((op) => (
            <MenuItem key={op} value={op}>
              {t("operators." + op)}
            </MenuItem>
          ))}
        </TextField>
      )}
      {condition.op === "one_of" && (
        <Stack direction="row" gap={0.5} flexWrap="wrap" alignItems="center">
          {tag.values.map((value) => (
            <Chip
              key={value.id}
              size="small"
              label={value.name}
              color={condition.values.includes(value.id) ? "primary" : "default"}
              variant={condition.values.includes(value.id) ? "filled" : "outlined"}
              onClick={() => toggleValue(value.id)}
            />
          ))}
        </Stack>
      )}
      {(condition.op === "gte" || condition.op === "between") && (
        <ValueSelect tag={tag} label={t("min")} value={condition.min} onChange={(min) => onChange({ min })} />
      )}
      {(condition.op === "lte" || condition.op === "between") && (
        <ValueSelect tag={tag} label={t("max")} value={condition.max} onChange={(max) => onChange({ max })} />
      )}
      {!isConditionComplete(condition) && (
        <Typography variant="caption" color="warning.main">
          {t("incomplete")}
        </Typography>
      )}
      <Box sx={{ flexGrow: 1, display: { xs: "none", md: "block" } }} />
      <IconButton size="small" onClick={onRemove} sx={{ display: { xs: "none", md: "inline-flex" } }}>
        <FontAwesomeIcon icon={faXmark} />
      </IconButton>
    </Stack>
  );
}
//#endregion

//#region FilterNumberField
// Number input that allows typing freely, but only passes on valid (clamped) values
function FilterNumberField({ label, value, onChange, min, max }) {
  const [input, setInput] = useState(String(value));

  useEffect(() => {
    if (parseInt(input) !== value) setInput(String(value));
  }, [value]);

  const onInputChange = (newInput) => {
    setInput(newInput);
    const parsed = parseInt(newInput);
    if (isNaN(parsed)) return;
    onChange(Math.max(min, Math.min(max, parsed)));
  };

  return (
    <TextField
      label={label}
      type="number"
      size="small"
      value={input}
      onChange={(e) => onInputChange(e.target.value)}
      onBlur={() => setInput(String(value))}
      inputProps={{ min, max }}
      sx={{ width: 130 }}
    />
  );
}
//#endregion

//#region FilterThresholdsNote
function FilterThresholdsNote() {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery.filter" });
  return (
    <Stack direction="column" gap={1}>
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {t("agreement")}
        </Typography>
        <Typography variant="body2">{t("agreement_note")}</Typography>
      </Box>
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {t("confidence")}
        </Typography>
        <Typography variant="body2">{t("confidence_note")}</Typography>
      </Box>
    </Stack>
  );
}
//#endregion

//#region ValueSelect
function ValueSelect({ tag, label, value, onChange }) {
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      sx={{ minWidth: 140 }}
      SelectProps={{ MenuProps: { disableScrollLock: true } }}
    >
      {tag.values.map((v) => (
        <MenuItem key={v.id} value={v.id}>
          {v.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
//#endregion

//#region Utility Functions
function createCondition(tagId, changes = {}) {
  return {
    key: Math.random(),
    tag_id: tagId,
    mode: "include",
    op: "any",
    values: [],
    min: null,
    max: null,
    ...changes,
  };
}

function getOperatorsForTag(tag) {
  if (isImplicitTag(tag)) return ["any"];
  if (tag.is_ordinal) return ["any", "one_of", "gte", "lte", "between"];
  return ["any", "one_of"];
}

function isConditionComplete(condition) {
  switch (condition.op) {
    case "one_of":
      return condition.values.length > 0;
    case "gte":
      return condition.min !== null;
    case "lte":
      return condition.max !== null;
    case "between":
      return condition.min !== null && condition.max !== null;
    default:
      return true;
  }
}

export function toApiFilter(conditions, confidence, agreement, lookup) {
  const apiConditions = [];
  for (const condition of conditions) {
    if (!isConditionComplete(condition)) continue;
    const entry = { tag_id: condition.tag_id };
    if (condition.mode === "exclude") entry.mode = "exclude";
    if (condition.op === "one_of") {
      entry.values = [...condition.values];
    } else if (condition.op === "gte") {
      entry.min = condition.min;
    } else if (condition.op === "lte") {
      entry.max = condition.max;
    } else if (condition.op === "between") {
      // Swap bounds if they were entered in the wrong order
      const minIndex = lookup.valuesById[condition.min]?.index ?? 0;
      const maxIndex = lookup.valuesById[condition.max]?.index ?? 0;
      entry.min = minIndex <= maxIndex ? condition.min : condition.max;
      entry.max = minIndex <= maxIndex ? condition.max : condition.min;
    }
    apiConditions.push(entry);
  }
  const filter = {};
  if (confidence !== 1) filter.confidence = confidence;
  if (agreement !== DEFAULT_AGREEMENT) filter.agreement = agreement;
  if (apiConditions.length > 0) filter.conditions = apiConditions;
  return filter;
}

function fromApiFilter(filter, lookup) {
  return (filter.conditions ?? [])
    .filter((c) => lookup.tagsById[c.tag_id])
    .map((c) => {
      const mode = c.mode === "exclude" ? "exclude" : "include";
      if (c.values) return createCondition(c.tag_id, { mode, op: "one_of", values: c.values });
      if (c.min !== undefined && c.max !== undefined)
        return createCondition(c.tag_id, { mode, op: "between", min: c.min, max: c.max });
      if (c.min !== undefined) return createCondition(c.tag_id, { mode, op: "gte", min: c.min });
      if (c.max !== undefined) return createCondition(c.tag_id, { mode, op: "lte", max: c.max });
      return createCondition(c.tag_id, { mode });
    });
}

// Set of all tag value ids that are included by the filter (e.g. for highlighting them)
export function getIncludedTagValueIds(filter, lookup) {
  const ids = new Set();
  for (const condition of filter?.conditions ?? []) {
    if (condition.mode === "exclude") continue;
    const tagInfo = lookup.tagsById[condition.tag_id];
    if (!tagInfo) continue;
    const values = tagInfo.tag.values;
    if (condition.values) {
      condition.values.forEach((id) => ids.add(id));
    } else if (condition.min !== undefined || condition.max !== undefined) {
      const minIndex = condition.min !== undefined ? (lookup.valuesById[condition.min]?.index ?? 0) : 0;
      const maxIndex =
        condition.max !== undefined ? (lookup.valuesById[condition.max]?.index ?? 0) : values.length - 1;
      values.slice(minIndex, maxIndex + 1).forEach((v) => ids.add(v.id));
    } else {
      values.forEach((v) => ids.add(v.id));
    }
  }
  return ids;
}

// Removes conditions that reference tags or values that don't exist (anymore), e.g. from an old shared link
export function sanitizeFilter(filter, lookup) {
  const conditions = [];
  for (const condition of filter.conditions ?? []) {
    const tagInfo = lookup.tagsById[condition?.tag_id];
    if (!tagInfo) continue;
    const valueIds = new Set(tagInfo.tag.values.map((v) => v.id));
    const entry = { tag_id: condition.tag_id };
    if (condition.mode === "exclude") entry.mode = "exclude";
    if (Array.isArray(condition.values)) {
      const values = condition.values.filter((id) => valueIds.has(id));
      if (values.length === 0) continue;
      entry.values = values;
    } else if (condition.min !== undefined || condition.max !== undefined) {
      if (!tagInfo.tag.is_ordinal) continue;
      if (condition.min !== undefined) {
        if (!valueIds.has(condition.min)) continue;
        entry.min = condition.min;
      }
      if (condition.max !== undefined) {
        if (!valueIds.has(condition.max)) continue;
        entry.max = condition.max;
      }
    }
    conditions.push(entry);
    if (conditions.length >= MAX_CONDITIONS) break;
  }
  const confidence = parseInt(filter.confidence);
  const result = {};
  if (!isNaN(confidence) && confidence > 1) result.confidence = Math.min(MAX_CONFIDENCE, confidence);
  const agreement = parseInt(filter.agreement);
  if (!isNaN(agreement)) {
    const clamped = Math.max(0, Math.min(100, agreement));
    if (clamped !== DEFAULT_AGREEMENT) result.agreement = clamped;
  }
  if (conditions.length > 0) result.conditions = conditions;
  return result;
}
//#endregion

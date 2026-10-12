import {
  faCheck,
  faChevronDown,
  faChevronUp,
  faFilter,
  faPlus,
  faRotateLeft,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  Collapse,
  FormControlLabel,
  IconButton,
  MenuItem,
  Popover,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../hooks/AuthProvider";
import { getQueryData, useGetObjectives } from "../../hooks/useApi";
import { DIFFICULTIES, DIFF_CONSTS, sortToDifficulty, sortToDifficultyId } from "../../util/constants";
import { ErrorDisplay, LoadingSpinner, TooltipInfoButton } from "../basic";
import { DifficultyChip } from "../goldberries";
import { TagChip, getTagCategoryColor, isImplicitTag } from "../tags";

const MAX_CONFIDENCE = 100;
const DEFAULT_AGREEMENT = 50;
const MAX_CONDITIONS = 20;
const FILTER_BACKGROUND = "#303030";
const CONDITION_BACKGROUND = "#3a3a3a";
const CLEAR_STATES = ["all", "only_c", "only_fc", "no_c", "no_fc"];
const FILTER_CONTROL_SX = { height: 42, display: "flex", alignItems: "center" };

//#region DiscoveryFilter
// Builds a filter in the format of GET /challenge/discovery. `filter` is the currently applied (already sanitized)
// API filter. Changes are only kept locally until the user applies them.
export function DiscoveryFilter({ filter, onApply, lookup }) {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery.filter" });
  const { t: t_s } = useTranslation(undefined, { keyPrefix: "components.submission_filter" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { hasPlayerClaimed } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [conditions, setConditions] = useState(() => fromApiFilter(filter, lookup));
  const [confidence, setConfidence] = useState(filter.confidence ?? 1);
  const [agreement, setAgreement] = useState(filter.agreement ?? DEFAULT_AGREEMENT);
  const [advanced, setAdvanced] = useState(() => getAdvancedFilter(filter));

  // Reset the local state if the applied filter was changed from the outside (e.g. browser navigation)
  const filterString = JSON.stringify(filter);
  useEffect(() => {
    if (JSON.stringify(toApiFilter(conditions, confidence, agreement, lookup, advanced)) !== filterString) {
      setConditions(fromApiFilter(filter, lookup));
      setConfidence(filter.confidence ?? 1);
      setAgreement(filter.agreement ?? DEFAULT_AGREEMENT);
      setAdvanced(getAdvancedFilter(filter));
    }
  }, [filterString]);

  const localFilter = toApiFilter(conditions, confidence, agreement, lookup, advanced);
  const hasChanges = JSON.stringify(localFilter) !== filterString;
  const isDefault = conditions.length === 0 && Object.keys(localFilter).length === 0;
  const changeAdvanced = (key, value) => setAdvanced((prev) => ({ ...prev, [key]: value }));
  const tierRange = [
    DIFFICULTIES[advanced.min_diff_id]?.sort ?? DIFF_CONSTS.MIN_SORT,
    DIFFICULTIES[advanced.max_diff_id]?.sort ?? DIFF_CONSTS.MAX_SORT,
  ];

  const updateCondition = (index, changes) => {
    setConditions(conditions.map((c, i) => (i === index ? { ...c, ...changes } : c)));
  };
  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };
  const addCondition = (tag) => {
    setConditions([...conditions, createCondition(tag.id, { op: isImplicitTag(tag) ? "any" : "one_of" })]);
  };
  const onReset = () => {
    setConditions([]);
    setConfidence(1);
    setAgreement(DEFAULT_AGREEMENT);
    setAdvanced(getAdvancedFilter({}));
    onApply({});
  };
  const onApplyClick = () => {
    onApply(localFilter);
  };

  const allTags = lookup.categories.flatMap((category) =>
    (category.tags ?? []).map((tag) => ({ tag, category })),
  );
  const appliedCount =
    (filter.conditions?.length ?? 0) +
    (filter.min_diff_id !== undefined || filter.max_diff_id !== undefined ? 1 : 0) +
    (filter.hide_objectives?.length > 0 ? 1 : 0) +
    (filter.clear_state ? 1 : 0) +
    (filter.exclude_cleared ? 1 : 0);

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
          <Stack direction="row" gap={3} alignItems="flex-end" flexWrap="wrap">
            <Stack gap={0} sx={{ flex: "1 1 360px", minWidth: 0 }}>
              <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                <Typography>{t("tier_slider")}</Typography>
                <Stack direction="row" gap={0.5} alignItems="center">
                  <DifficultyChip
                    difficulty={{ ...sortToDifficulty(tierRange[0]), id: sortToDifficultyId(tierRange[0]) }}
                  />
                  <Typography component="span">~</Typography>
                  <DifficultyChip
                    difficulty={{ ...sortToDifficulty(tierRange[1]), id: sortToDifficultyId(tierRange[1]) }}
                  />
                </Stack>
              </Stack>
              <Box sx={{ ...FILTER_CONTROL_SX, justifyContent: "center" }}>
                <Slider
                  value={tierRange}
                  onChange={(e, values) =>
                    setAdvanced((prev) => ({
                      ...prev,
                      min_diff_id: sortToDifficultyId(values[0]),
                      max_diff_id: sortToDifficultyId(values[1]),
                    }))
                  }
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => sortToDifficulty(value).name}
                  min={DIFF_CONSTS.MIN_SORT}
                  max={DIFF_CONSTS.MAX_SORT}
                  step={1}
                  marks
                  sx={{ width: "92%" }}
                />
              </Box>
            </Stack>
            <Stack gap={0}>
              <Typography>{t_g("objective", { count: 30 })}</Typography>
              <Box sx={FILTER_CONTROL_SX}>
                <ObjectiveFilterButton
                  hideObjectives={advanced.hide_objectives}
                  onConfirm={(ids) => changeAdvanced("hide_objectives", ids)}
                />
              </Box>
            </Stack>
            <Stack gap={0} sx={{ width: 180, maxWidth: "100%" }}>
              <Typography id="discovery-clear-state-label">{t_s("clear_state.label")}</Typography>
              <Box sx={FILTER_CONTROL_SX}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={advanced.clear_state}
                  onChange={(e) => changeAdvanced("clear_state", Number(e.target.value))}
                  SelectProps={{
                    "aria-labelledby": "discovery-clear-state-label",
                    MenuProps: { disableScrollLock: true },
                  }}
                >
                  {CLEAR_STATES.map((state, index) => (
                    <MenuItem key={state} value={index}>{t_s("clear_state." + state)}</MenuItem>
                  ))}
                </TextField>
              </Box>
            </Stack>
            <Tooltip title={!hasPlayerClaimed ? t("exclude_cleared_requires_player") : ""} arrow>
              <Box component="span" sx={FILTER_CONTROL_SX}>
                <FormControlLabel
                  control={<Checkbox />}
                  checked={advanced.exclude_cleared}
                  disabled={!hasPlayerClaimed && !advanced.exclude_cleared}
                  onChange={(e, checked) => changeAdvanced("exclude_cleared", checked)}
                  label={t("exclude_cleared")}
                  sx={{ mr: 0 }}
                />
              </Box>
            </Tooltip>
          </Stack>
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

//#region ObjectiveFilterButton
function ObjectiveFilterButton({ hideObjectives, onConfirm }) {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery.filter" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [anchorEl, setAnchorEl] = useState(null);
  const [draft, setDraft] = useState([]);
  const query = useGetObjectives();
  const objectives = [...(getQueryData(query) ?? [])].sort((a, b) => a.id - b.id);
  const open = Boolean(anchorEl);
  const filtered = objectives.some((objective) => hideObjectives.includes(objective.id));
  const shownCount = objectives.filter((objective) => !hideObjectives.includes(objective.id)).length;

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? "discovery-objective-filter" : undefined}
        onClick={(event) => {
          setDraft([...hideObjectives]);
          setAnchorEl(event.currentTarget);
        }}
      >
        {filtered ? t("showing_objectives", { count: shownCount }) : t("filter_by_objective")}
      </Button>
      <Popover
        id="discovery-objective-filter"
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableScrollLock
        slotProps={{
          paper: {
            role: "dialog",
            "aria-label": t_g("objective", { count: 30 }),
            sx: { width: 280, maxWidth: "92vw", maxHeight: "80vh", overflowY: "auto" },
          },
        }}
      >
        <Stack gap={1} sx={{ p: 2 }}>
          <Typography variant="h6">{t_g("objective", { count: 30 })}</Typography>
          {query.isLoading ? (
            <LoadingSpinner />
          ) : query.isError ? (
            <ErrorDisplay error={query.error} />
          ) : (
            <>
              <Stack>
                {objectives.map((objective) => (
                  <FormControlLabel
                    key={objective.id}
                    control={<Checkbox />}
                    checked={!draft.includes(objective.id)}
                    onChange={(event, checked) =>
                      setDraft((prev) =>
                        checked ? prev.filter((id) => id !== objective.id) : [...prev, objective.id],
                      )
                    }
                    label={objective.name}
                    sx={{ mr: 0 }}
                  />
                ))}
              </Stack>
              <ButtonGroup size="small" fullWidth>
                <Button onClick={() => setDraft([])}>{t("all")}</Button>
                <Button onClick={() => setDraft(objectives.map((objective) => objective.id))}>
                  {t("none")}
                </Button>
              </ButtonGroup>
              <Button
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faCheck} size="sm" />}
                onClick={() => {
                  onConfirm(draft);
                  setAnchorEl(null);
                }}
              >
                {t("confirm")}
              </Button>
            </>
          )}
        </Stack>
      </Popover>
    </>
  );
}
//#endregion

//#region FilterConditionRow
function FilterConditionRow({ condition, lookup, onChange, onRemove }) {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery.filter" });
  const { tag, category } = lookup.tagsById[condition.tag_id];
  const implicit = isImplicitTag(tag);
  const color = getTagCategoryColor(category);
  // Keep legacy any/range filters intact until their displayed values are edited.
  const selectedValues =
    condition.op === "one_of"
      ? condition.values
      : tag.values
          .slice(
            condition.min !== null ? lookup.valuesById[condition.min].index : 0,
            condition.max !== null ? lookup.valuesById[condition.max].index + 1 : undefined,
          )
          .map((value) => value.id);

  const setValues = (values) => {
    onChange({ op: "one_of", values, min: null, max: null });
  };
  const toggleValue = (valueId) => {
    const values = selectedValues.includes(valueId)
      ? selectedValues.filter((id) => id !== valueId)
      : [...selectedValues, valueId];
    setValues(values);
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
        <TagChip tag={tag} value={null} category={category} showFullName />
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
        <Stack direction="row" gap={0.5} flexWrap="wrap" alignItems="center" sx={{ flex: 1 }}>
          <ButtonGroup size="small" sx={{ mr: 0.5 }}>
            <Button onClick={() => setValues(tag.values.map((value) => value.id))}>
              {t("all")}
            </Button>
            <Button onClick={() => setValues([])}>{t("none")}</Button>
          </ButtonGroup>
          {tag.values.map((value) => (
            <Chip
              key={value.id}
              size="small"
              label={value.name}
              color={selectedValues.includes(value.id) ? "primary" : "default"}
              variant={selectedValues.includes(value.id) ? "filled" : "outlined"}
              onClick={() => toggleValue(value.id)}
            />
          ))}
        </Stack>
      )}
      <Stack direction="row" alignItems="center" gap={0.5} sx={{ ml: "auto" }}>
        {!isConditionComplete(condition) && (
          <Box component="span" sx={{ color: "warning.main", display: "inline-flex" }}>
            <TooltipInfoButton
              title={t("incomplete")}
              icon={faTriangleExclamation}
              aria-label={t("incomplete")}
            />
          </Box>
        )}
        <IconButton size="small" onClick={onRemove} sx={{ display: { xs: "none", md: "inline-flex" } }}>
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </Stack>
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

export function toApiFilter(conditions, confidence, agreement, lookup, advanced = getAdvancedFilter({})) {
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
  if (advanced.min_diff_id !== undefined && DIFFICULTIES[advanced.min_diff_id]?.sort !== DIFF_CONSTS.MIN_SORT)
    filter.min_diff_id = advanced.min_diff_id;
  if (advanced.max_diff_id !== undefined && DIFFICULTIES[advanced.max_diff_id]?.sort !== DIFF_CONSTS.MAX_SORT)
    filter.max_diff_id = advanced.max_diff_id;
  if (advanced.hide_objectives.length > 0) filter.hide_objectives = [...advanced.hide_objectives].sort((a, b) => a - b);
  if (advanced.clear_state !== 0) filter.clear_state = advanced.clear_state;
  if (advanced.exclude_cleared) filter.exclude_cleared = true;
  return filter;
}

function getAdvancedFilter(filter) {
  return {
    min_diff_id: filter.min_diff_id,
    max_diff_id: filter.max_diff_id,
    hide_objectives: filter.hide_objectives ?? [],
    clear_state: filter.clear_state ?? 0,
    exclude_cleared: filter.exclude_cleared ?? false,
  };
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
  const bounds = ["min_diff_id", "max_diff_id"];
  for (const key of bounds) {
    const id = Number(filter[key]);
    if (Number.isInteger(id) && DIFFICULTIES[id]) result[key] = id;
  }
  if (
    result.min_diff_id !== undefined && result.max_diff_id !== undefined &&
    DIFFICULTIES[result.min_diff_id].sort > DIFFICULTIES[result.max_diff_id].sort
  ) {
    [result.min_diff_id, result.max_diff_id] = [result.max_diff_id, result.min_diff_id];
  }
  if (DIFFICULTIES[result.min_diff_id]?.sort === DIFF_CONSTS.MIN_SORT) delete result.min_diff_id;
  if (DIFFICULTIES[result.max_diff_id]?.sort === DIFF_CONSTS.MAX_SORT) delete result.max_diff_id;
  if (Array.isArray(filter.hide_objectives)) {
    const ids = [...new Set(filter.hide_objectives.filter((id) => Number.isInteger(id) && id > 0))];
    if (ids.length > 0) result.hide_objectives = ids.sort((a, b) => a - b);
  }
  const clearState = Number(filter.clear_state);
  if (Number.isInteger(clearState) && clearState > 0 && clearState <= 4) result.clear_state = clearState;
  if (filter.exclude_cleared === true) result.exclude_cleared = true;
  return result;
}
//#endregion

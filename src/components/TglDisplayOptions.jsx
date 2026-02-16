import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Popover,
  Select,
  Slider,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import { useTranslation } from "react-i18next";

import { SettingsEntry } from "../pages/AppSettings";
import { deepCompareObjects } from "../hooks/AppSettingsProvider";
import { useAuth } from "../hooks/AuthProvider";

import { PlayerIdSelect } from "./goldberries";

const sortOptions = [
  { value: "alphabetical", label: "alphabetical" },
  { value: "campaign", label: "campaign" },
  { value: "fractional-tiers", label: "fractional_tier" },
  { value: "clear-count", label: "clear_count" },
  { value: "first-clear-date", label: "first_clear_date" },
];
const personalTglSortOptions = [{ value: "time-taken", label: "time_taken" }];
const sortOrders = [
  { value: "asc", label: "ascending" },
  { value: "desc", label: "descending" },
];

export function TglMoreButton({
  type,
  id,
  variant = "contained",
  options,
  setOptions,
  anchorOrigin,
  transformOrigin,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.tgl_more_button" });
  const auth = useAuth();
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const [localOptions, setLocalOptions] = useState(options);
  const isPlayer = type === "player";
  const isOverall = type === null;
  const defaultOptions = getDefaultOptions(isOverall, auth.user?.player_id);

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOptions(localOptions);
  };
  const open = Boolean(anchorEl);
  const elemId = open ? "tgl-display-options" : undefined;

  useEffect(() => {
    const hadChange = deepCompareObjects(defaultOptions, options);

    if (options.version !== defaultOptions.version || hadChange) {
      console.log("Outdated options found, updating...", options);
      if ((options.version < 1 || options.version === undefined) && defaultOptions.version >= 1) {
        console.log("Updating options from version <undefined> to 1");
      } else {
        if (options.version === 1) {
          console.log("Updating options from version 1: flipping hide/show options");
          options.showImages = !options.hideImages;
          delete options.hideImages;
          options.showFractionalTiers = !options.hideFractionalTiers;
          delete options.hideFractionalTiers;
          options.showEmptyTiers = !options.hideEmptyTiers;
          delete options.hideEmptyTiers;
          options.showTimeTaken = !options.hideTimeTaken;
          delete options.hideTimeTaken;
          options.version = 2;
        }
        if (options.version === 2) {
          console.log("Updating options from version 2: minimum darkenTierColors adjustment");
          options.darkenTierColors = Math.max(60, options.darkenTierColors);
          options.version = 3;
        }
        console.log("Updated options:", options);
      }
      options.version = defaultOptions.version;
      setOptions({ ...options });
    }
  }, []);

  const changedOption = (key, newValue) => {
    console.log("Changed option", key, "to", newValue);
    setLocalOptions((prev) => ({ ...prev, [key]: newValue }));
  };

  const typeString = t("type." + (type ? type : "overall"));
  const sortOptionsFinal = isPlayer ? sortOptions.concat(personalTglSortOptions) : sortOptions;

  return (
    <Stack direction="row" gap={1} alignItems="center">
      <Button aria-describedby={elemId} variant={variant} onClick={handleClick} fullWidth>
        {t("label")}
      </Button>
      <Popover
        id={elemId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={
          anchorOrigin ?? {
            vertical: "center",
            horizontal: "right",
          }
        }
        transformOrigin={transformOrigin}
        disableScrollLock={isMdScreen ? false : true}
        slotProps={{
          paper: {
            sx: {
              width: "400px",
              maxWidth: "92%",
              overflowY: "auto",
              overflowX: "hidden",
            },
          },
        }}
      >
        <Grid container rowSpacing={1} sx={{ p: 2 }}>
          <Grid item xs={12} md={12}>
            <Typography variant="h6" gutterBottom>
              {typeString}
            </Typography>
            <SelectOption
              tKey="sort"
              value={localOptions.sort}
              setValue={(newValue) => changedOption("sort", newValue)}
              options={sortOptionsFinal}
              noNote
            />
            <SelectOption
              tKey="sort_order"
              value={localOptions.sortOrder}
              setValue={(newValue) => changedOption("sortOrder", newValue)}
              options={sortOrders}
              noNote
            />

            <SliderOption
              tKey="darken_tier_colors"
              value={localOptions.darkenTierColors}
              setValue={(newValue) => changedOption("darkenTierColors", newValue)}
              min={0}
              valueFormatter={(v) => `${v}%`}
            />

            <BoolOption
              tKey="compact_mode"
              value={localOptions.compactMode}
              setValue={(newValue) => changedOption("compactMode", newValue)}
            />
            <BoolOption
              tKey="prefer_map_images"
              value={localOptions.preferMapImages}
              setValue={(newValue) => changedOption("preferMapImages", newValue)}
            />
            <BoolOption
              tKey="show_images"
              value={localOptions.showImages}
              setValue={(newValue) => changedOption("showImages", newValue)}
            />
            <Divider sx={{ my: 0.5 }} />
            <BoolOption
              tKey="show_fractional_tiers"
              value={localOptions.showFractionalTiers}
              setValue={(newValue) => changedOption("showFractionalTiers", newValue)}
              noNote
            />
            <BoolOption
              tKey="show_empty_tiers"
              value={localOptions.showEmptyTiers}
              setValue={(newValue) => changedOption("showEmptyTiers", newValue)}
              noNote
            />
            {isPlayer && (
              <BoolOption
                tKey="show_time_taken"
                value={localOptions.showTimeTaken}
                setValue={(newValue) => changedOption("showTimeTaken", newValue)}
                noNote
              />
            )}
            <BoolOption
              tKey="show_like_counts"
              value={localOptions.showLikeCounts}
              setValue={(newValue) => changedOption("showLikeCounts", newValue)}
              noNote
            />
            <BoolOption
              tKey="stack_tiers"
              value={localOptions.stackTiers}
              setValue={(newValue) => changedOption("stackTiers", newValue)}
              noNote
            />
            {!isPlayer && (
              <>
                <Divider sx={{ my: 0.5 }} />
                <Grid container item xs={12} sx={{ mt: 1.5, mb: 0 }} columnSpacing={1}>
                  <Grid item xs={12} sm="auto" sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="subtitle1">{t("options.highlight_player.label")}</Typography>
                  </Grid>
                  <Grid item xs={12} sm>
                    <PlayerIdSelect
                      type="all"
                      value={localOptions.highlightPlayerId}
                      onChange={(e, id) => changedOption("highlightPlayerId", id)}
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Popover>
    </Stack>
  );
}

function BoolOption({ tKey, value, setValue, noNote = false }) {
  const { t: t_s } = useTranslation(undefined, { keyPrefix: "components.tgl_more_button.options" });
  const note = noNote ? undefined : t_s(`${tKey}.note`);
  const title = t_s(`${tKey}.label`);
  return (
    <SettingsEntry titleWidth={0} note={note} sx={{ mb: 0 }}>
      <FormControlLabel
        label={title}
        checked={value}
        onChange={(e) => setValue(e.target.checked)}
        control={<Checkbox sx={{ ml: 0 }} />}
      />
    </SettingsEntry>
  );
}

function SelectOption({ tKey, value, setValue, options, noNote = false }) {
  const { t: t_s } = useTranslation(undefined, { keyPrefix: "components.tgl_more_button.options" });
  const note = noNote ? undefined : t_s(`${tKey}.note`);
  const title = t_s(`${tKey}.label`);
  return (
    <SettingsEntry titleWidth={0} note={note} sx={{ mb: 0.5 }}>
      <Select value={value} onChange={(e) => setValue(e.target.value)} sx={{ ml: 0 }} size="small" fullWidth>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {title + ": " + t_s(tKey + "." + option.label)}
          </MenuItem>
        ))}
      </Select>
    </SettingsEntry>
  );
}

function SliderOption({ tKey, value, setValue, valueFormatter, min = 0, max = 100, step = 5 }) {
  const { t: t_s } = useTranslation(undefined, { keyPrefix: "components.tgl_more_button.options" });
  const note = t_s(`${tKey}.note`);
  const formatter = valueFormatter ? valueFormatter : (v) => v;

  return (
    <SettingsEntry titleWidth={0} note={note} sx={{ mb: 0.5 }}>
      <Slider
        value={value}
        onChange={(e, v) => setValue(v)}
        min={min}
        max={max}
        step={step}
        marks
        valueLabelDisplay="auto"
        valueLabelFormat={formatter}
        sx={{ mx: 1 }}
      />
    </SettingsEntry>
  );
}

export function getDefaultOptions(isOverall = false, playerId = null) {
  return {
    darkenTierColors: 85,
    compactMode: isOverall,
    sort: "fractional-tiers",
    sortOrder: "desc",
    showImages: true,
    preferMapImages: false,
    stackTiers: false,
    showFractionalTiers: true,
    showEmptyTiers: false,
    showTimeTaken: true,
    showLikeCounts: false,
    highlightPlayerId: playerId,
    version: 3,
  };
}

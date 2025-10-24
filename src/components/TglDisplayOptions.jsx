import {
  Button,
  Checkbox,
  darken,
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

const sortOptions = [
  { value: "alphabetical", label: "alphabetical" },
  { value: "fractional-tiers", label: "fractional_tier" },
  { value: "clear-count", label: "clear_count" },
  { value: "first-clear-date", label: "first_clear_date" },
];
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
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const [localOptions, setLocalOptions] = useState(options);

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
    if (options.version !== getDefaultOptions().version) {
      console.log("Outdated options found, updating...");
      if ((options.version < 1 || options.version === undefined) && getDefaultOptions().version >= 1) {
        console.log("Updating options from version <undefined> to 1");
        // Not yet necessary
      }
      options.version = getDefaultOptions().version;
      setOptions({ ...options });
    }
  }, []);

  const changeOptions = (key, newValue) => {
    setLocalOptions((prev) => ({ ...prev, [key]: newValue }));
  };

  const isPlayer = type === "player";
  const typeString = t("type." + (type ? type : "overall"));

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
              overflow: isMdScreen ? "visible" : undefined,
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
              setValue={(newValue) => changeOptions("sort", newValue)}
              options={sortOptions}
              noNote
            />
            <SelectOption
              tKey="sort_order"
              value={localOptions.sortOrder}
              setValue={(newValue) => changeOptions("sortOrder", newValue)}
              options={sortOrders}
              noNote
            />

            <SliderOption
              tKey="darken_tier_colors"
              value={localOptions.darkenTierColors}
              setValue={(newValue) => changeOptions("darkenTierColors", newValue)}
              min={40}
              valueFormatter={(v) => `${v}%`}
            />

            <BoolOption
              tKey="compact_mode"
              value={localOptions.compactMode}
              setValue={(newValue) => changeOptions("compactMode", newValue)}
            />
            <BoolOption
              tKey="prefer_map_images"
              value={localOptions.preferMapImages}
              setValue={(newValue) => changeOptions("preferMapImages", newValue)}
            />
            <BoolOption
              tKey="hide_images"
              value={localOptions.hideImages}
              setValue={(newValue) => changeOptions("hideImages", newValue)}
            />
            <Divider sx={{ my: 0.5 }} />
            <BoolOption
              tKey="hide_fractional_tiers"
              value={localOptions.hideFractionalTiers}
              setValue={(newValue) => changeOptions("hideFractionalTiers", newValue)}
              noNote
            />
            <BoolOption
              tKey="hide_empty_tiers"
              value={localOptions.hideEmptyTiers}
              setValue={(newValue) => changeOptions("hideEmptyTiers", newValue)}
              noNote
            />
            {isPlayer && (
              <BoolOption
                tKey="hide_time_taken"
                value={localOptions.hideTimeTaken}
                setValue={(newValue) => changeOptions("hideTimeTaken", newValue)}
                noNote
              />
            )}
            <BoolOption
              tKey="unstack_tiers"
              value={localOptions.unstackTiers}
              setValue={(newValue) => changeOptions("unstackTiers", newValue)}
              noNote
            />
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

export function getDefaultOptions() {
  return {
    darkenTierColors: 85,
    compactMode: false,
    sort: "fractional-tiers",
    sortOrder: "desc",
    hideImages: false,
    preferMapImages: false,
    unstackTiers: true,
    hideFractionalTiers: false,
    hideEmptyTiers: true,
    hideTimeTaken: false,
    version: 1,
  };
}

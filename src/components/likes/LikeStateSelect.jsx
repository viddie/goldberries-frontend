import { MenuItem, Select } from "@mui/material";
import { useTranslation } from "react-i18next";

const LIKE_STATES = ["current", "on_hold", "soon", "backlog"];

export function LikeStateSelect({ value, onChange, disabled, onOpen, onClose }) {
  const { t } = useTranslation(undefined, { keyPrefix: "likes.state" });

  return (
    <Select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      size="small"
      displayEmpty
      disabled={disabled}
      onOpen={onOpen}
      onClose={onClose}
      sx={{
        minWidth: 120,
        color: "inherit",
        ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.7)" },
        ".MuiSelect-icon": { color: "inherit" },
        "&.Mui-disabled": { color: "rgba(255,255,255,0.3)" },
      }}
      MenuProps={{
        disableScrollLock: true,
        disableRestoreFocus: true,
        sx: { zIndex: 1600 },
      }}
    >
      <MenuItem value="">{t("none")}</MenuItem>
      {LIKE_STATES.map((state) => (
        <MenuItem key={state} value={state}>
          {t(state)}
        </MenuItem>
      ))}
    </Select>
  );
}

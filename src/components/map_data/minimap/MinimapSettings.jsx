import { useState } from "react";
import {
  Box,
  Checkbox,
  ClickAwayListener,
  FormControlLabel,
  IconButton,
  Paper,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faGear, faInfoCircle, faRotateLeft, faXmark } from "@fortawesome/free-solid-svg-icons";

import { IgnoreUnhandled } from "./entity_definitions";
import { useMinimapStore } from "./useMinimapStore";

const DEFAULT_SHOWN_GROUPS = ["importantTriggers", "variantTriggers", "miscGameplayTriggers"];

function sortEntityNames(nameSet) {
  return [...nameSet].sort((a, b) => {
    const aHasSlash = a.includes("/");
    const bHasSlash = b.includes("/");
    if (aHasSlash !== bHasSlash) return aHasSlash ? 1 : -1;
    return a.localeCompare(b);
  });
}

export function MinimapSettings() {
  const [open, setOpen] = useState(false);

  const showUnhandledEntities = useMinimapStore((s) => s.showUnhandledEntities);
  const setShowUnhandledEntities = useMinimapStore((s) => s.setShowUnhandledEntities);
  const showUnhandledTriggers = useMinimapStore((s) => s.showUnhandledTriggers);
  const setShowUnhandledTriggers = useMinimapStore((s) => s.setShowUnhandledTriggers);
  const debugMode = useMinimapStore((s) => s.debugMode);
  const setDebugMode = useMinimapStore((s) => s.setDebugMode);
  const antiSpoilerMode = useMinimapStore((s) => s.antiSpoilerMode);
  const setAntiSpoilerMode = useMinimapStore((s) => s.setAntiSpoilerMode);
  const shownIgnoreGroups = useMinimapStore((s) => s.shownIgnoreGroups);
  const toggleIgnoreGroup = useMinimapStore((s) => s.toggleIgnoreGroup);
  const setShownIgnoreGroups = useMinimapStore((s) => s.setShownIgnoreGroups);
  const gridType = useMinimapStore((s) => s.gridType);
  const setGridType = useMinimapStore((s) => s.setGridType);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box>
        <IconButton
          onClick={() => setOpen((v) => !v)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            color: "white",
            backgroundColor: "rgba(0,0,0,0.4)",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
          }}
          size="small"
        >
          <FontAwesomeIcon icon={faGear} />
        </IconButton>
        {open && (
          <Paper
            elevation={8}
            sx={{
              position: "absolute",
              top: 44,
              right: 8,
              zIndex: 10,
              p: 2,
              minWidth: 220,
              backgroundColor: "rgb(30,30,30)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Minimap Settings
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={showUnhandledEntities}
                  onChange={(e) => setShowUnhandledEntities(e.target.checked)}
                  size="small"
                />
              }
              label="Show unhandled entities"
              sx={{ display: "flex", mb: 0.5 }}
              slotProps={{ typography: { variant: "body2" } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showUnhandledTriggers}
                  onChange={(e) => setShowUnhandledTriggers(e.target.checked)}
                  size="small"
                />
              }
              label="Show unhandled triggers"
              sx={{ display: "flex", mb: 1.5 }}
              slotProps={{ typography: { variant: "body2" } }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              <Typography variant="body2">Show Groups</Typography>
              <Tooltip title="Show all" arrow>
                <IconButton
                  size="small"
                  onClick={() => setShownIgnoreGroups(Object.keys(IgnoreUnhandled))}
                  sx={{ color: "rgba(255,255,255,0.6)", p: 0.25 }}
                >
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: "0.65rem" }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Default" arrow>
                <IconButton
                  size="small"
                  onClick={() => setShownIgnoreGroups(DEFAULT_SHOWN_GROUPS)}
                  sx={{ color: "rgba(255,255,255,0.6)", p: 0.25 }}
                >
                  <FontAwesomeIcon icon={faRotateLeft} style={{ fontSize: "0.65rem" }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Show none" arrow>
                <IconButton
                  size="small"
                  onClick={() => setShownIgnoreGroups([])}
                  sx={{ color: "rgba(255,255,255,0.6)", p: 0.25 }}
                >
                  <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.65rem" }} />
                </IconButton>
              </Tooltip>
            </Box>
            {Object.entries(IgnoreUnhandled).map(([group, nameSet]) => (
              <Box key={group} sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shownIgnoreGroups.has(group)}
                      onChange={() => toggleIgnoreGroup(group)}
                      size="small"
                    />
                  }
                  label={group.charAt(0).toUpperCase() + group.slice(1)}
                  sx={{ flex: 1, mb: 0.5 }}
                  slotProps={{ typography: { variant: "body2" } }}
                />
                <EntityListPopover nameSet={nameSet} />
              </Box>
            ))}

            <FormControlLabel
              control={
                <Checkbox checked={debugMode} onChange={(e) => setDebugMode(e.target.checked)} size="small" />
              }
              label="Debug mode"
              sx={{ display: "flex", mb: 0.5, mt: 1 }}
              slotProps={{ typography: { variant: "body2" } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={antiSpoilerMode}
                  onChange={(e) => setAntiSpoilerMode(e.target.checked)}
                  size="small"
                />
              }
              label="Anti-spoiler mode"
              sx={{ display: "flex", mb: 1 }}
              slotProps={{ typography: { variant: "body2" } }}
            />

            <Typography variant="body2" sx={{ mt: 1, mb: 0.5 }}>
              Grid
            </Typography>
            <ToggleButtonGroup
              value={gridType}
              exclusive
              onChange={(e, v) => {
                if (v !== null) setGridType(v);
              }}
              size="small"
              fullWidth
            >
              <ToggleButton value="tile">Tile</ToggleButton>
              <ToggleButton value="pixel">Pixel</ToggleButton>
              <ToggleButton value="none">Off</ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}

function EntityListPopover({ nameSet }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const sorted = sortEntityNames(nameSet);

  return (
    <>
      <span
        style={{ display: "inline-flex", cursor: "help", opacity: 0.5 }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <FontAwesomeIcon icon={faInfoCircle} size="xs" />
      </span>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
        transformOrigin={{ vertical: "center", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 300,
              overflow: "auto",
              p: 1,
              backgroundColor: "rgb(30,30,30)",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.7rem" }}
        >
          {sorted.join("\n")}
        </Typography>
      </Popover>
    </>
  );
}

import { useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";

import { useMinimapStore } from "./useMinimapStore";

export function MinimapSettings() {
  const [open, setOpen] = useState(false);

  const showUnhandledEntities = useMinimapStore((s) => s.showUnhandledEntities);
  const setShowUnhandledEntities = useMinimapStore((s) => s.setShowUnhandledEntities);
  const showUnhandledTriggers = useMinimapStore((s) => s.showUnhandledTriggers);
  const setShowUnhandledTriggers = useMinimapStore((s) => s.setShowUnhandledTriggers);
  const gridType = useMinimapStore((s) => s.gridType);
  const setGridType = useMinimapStore((s) => s.setGridType);

  return (
    <>
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
            backgroundColor: "rgba(30,30,30,0.95)",
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

          <Typography variant="body2" sx={{ mb: 0.5 }}>
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
            <ToggleButton value="none">No Grid</ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      )}
    </>
  );
}

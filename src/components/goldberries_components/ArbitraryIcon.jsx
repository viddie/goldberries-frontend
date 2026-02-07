import { Tooltip } from "@mui/material";

export function ArbitraryIcon({ height = "1em" }) {
  return (
    <Tooltip title="Arbitrary" arrow placement="top">
      (A)
    </Tooltip>
  );
}

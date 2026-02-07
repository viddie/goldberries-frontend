import { Tooltip } from "@mui/material";

export function TooltipLineBreaks({ title, children }) {
  return (
    <Tooltip title={<span style={{ whiteSpace: "pre-line" }}>{title}</span>} arrow placement="top">
      {children}
    </Tooltip>
  );
}

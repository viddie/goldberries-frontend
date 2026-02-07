import { Tooltip } from "@mui/material";

export function OtherIcon({ url, title, alt, hideOutline = false, height = "1em", style = {} }) {
  if (title === undefined) {
    return (
      <img
        src={url}
        className={hideOutline ? "" : "outlined"}
        alt={alt}
        style={{ height: height, ...style }}
      />
    );
  }

  return (
    <Tooltip title={title} arrow placement="top">
      <img
        src={url}
        className={hideOutline ? "" : "outlined"}
        alt={alt}
        style={{ height: height, ...style }}
      />
    </Tooltip>
  );
}

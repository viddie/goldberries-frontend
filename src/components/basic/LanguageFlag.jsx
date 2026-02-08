import { Tooltip } from "@mui/material";

import { COUNTRY_CODES } from "../../util/country_codes";

export function LanguageFlag({ code, height = "20", style, showTooltip = false }) {
  const alt = COUNTRY_CODES[code];
  const img = (
    <img src={`/locales/flags/${code}.png`} height={height} loading="lazy" alt={alt} style={style} />
  );
  if (showTooltip) {
    return (
      <Tooltip title={alt} arrow placement="top">
        {img}
      </Tooltip>
    );
  }
  return img;
}

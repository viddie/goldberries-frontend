import { Tooltip } from "@mui/material";

import { useAppSettings } from "../../hooks/AppSettingsProvider";
import { getChallengeFcLong, getChallengeFcShort, getSubmissionFcShort } from "../../util/data_util";

export function ChallengeFcIcon({
  challenge,
  height = "1em",
  showClear = false,
  allowTextIcons = false,
  style = {},
  ...props
}) {
  const { settings } = useAppSettings();
  const icon = challenge.requires_fc
    ? "fullclear.png"
    : challenge.has_fc
      ? "clear-fullclear.png"
      : "clear.png";
  const alt = getChallengeFcLong(challenge);
  const shortAlt = getChallengeFcShort(challenge);

  if (
    !challenge.requires_fc &&
    !challenge.has_fc &&
    allowTextIcons &&
    !settings.visual.topGoldenList.useTextFcIcons &&
    !showClear
  ) {
    return null;
  }

  return (
    <Tooltip title={alt} arrow placement="top">
      {allowTextIcons && settings.visual.topGoldenList.useTextFcIcons ? (
        <span style={{ whiteSpace: "nowrap", ...style }}>{shortAlt}</span>
      ) : (
        <img
          src={"/icons/" + icon}
          alt={alt}
          className="outlined"
          style={{
            height: height,
            ...style,
          }}
          {...props}
          loading="lazy"
        />
      )}
    </Tooltip>
  );
}

export function SubmissionFcIcon({
  submission,
  height = "1em",
  disableTooltip = false,
  showClear = false,
  allowTextIcons = false,
  style,
  ...props
}) {
  const { settings } = useAppSettings();

  if (!submission.is_fc && !showClear) return null;
  const isFc = submission.is_fc;

  const icon = isFc ? "fullclear.png" : "clear.png";
  const alt = isFc ? "Full Clear" : "Regular Clear";
  const shortAlt = getSubmissionFcShort(submission, !showClear);

  let comp = null;
  if (allowTextIcons && settings.visual.topGoldenList.useTextFcIcons) {
    comp = <span style={{ whiteSpace: "nowrap" }}>{shortAlt}</span>;
  } else {
    comp = (
      <img
        src={"/icons/" + icon}
        alt={alt}
        className="outlined"
        style={{
          height: height,
          ...style,
        }}
        {...props}
        loading="lazy"
      />
    );
  }

  if (disableTooltip) return comp;

  return (
    <Tooltip title={alt} arrow placement="top">
      {comp}
    </Tooltip>
  );
}

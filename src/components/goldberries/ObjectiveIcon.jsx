import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";

import { getChallengeIcon } from "../../util/data_util";

export function ObjectiveIcon({ objective, challenge = null, height = "1em", style = {} }) {
  const description = objective.description;
  let icon_url = null;
  if (challenge) {
    icon_url = getChallengeIcon(challenge);
  } else {
    icon_url = objective.icon_url;
  }

  if (icon_url === null || icon_url === undefined)
    return (
      <Tooltip title={description} arrow placement="top">
        <FontAwesomeIcon icon={faInfoCircle} height={height} style={style} />
      </Tooltip>
    );

  return (
    <Tooltip title={description} arrow placement="top">
      <img
        src={icon_url}
        alt={objective.name}
        className="outlined"
        style={{
          height: height,
          ...style,
        }}
        loading="lazy"
      />
    </Tooltip>
  );
}

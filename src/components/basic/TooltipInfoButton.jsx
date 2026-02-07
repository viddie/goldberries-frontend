import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";

export function TooltipInfoButton({ title }) {
  return (
    <Tooltip title={title} placement="top" arrow>
      <FontAwesomeIcon icon={faInfoCircle} />
    </Tooltip>
  );
}

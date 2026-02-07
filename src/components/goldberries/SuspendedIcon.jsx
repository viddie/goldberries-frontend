import { faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

export function SuspendedIcon({ reason }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.suspended_icon" });
  const text = reason ? t("with_reason", { reason }) : t("no_reason");
  return (
    <Tooltip title={text} arrow placement="top">
      <FontAwesomeIcon icon={faBan} />
    </Tooltip>
  );
}

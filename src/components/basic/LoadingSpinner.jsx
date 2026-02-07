import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export function LoadingSpinner({ size = "normal", ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components" });
  const sizes = {
    normal: "h6",
    small: "body1",
  };
  const variant = sizes[size] ?? sizes["normal"];
  return (
    <Typography variant={variant} {...props}>
      {t("loading")} <FontAwesomeIcon icon={faSpinner} spin />
    </Typography>
  );
}

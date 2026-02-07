import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

export function VerificationStatusChip({ isVerified, i18keySuffix = null, ...props }) {
  const key = "components.verification_status_chip" + (i18keySuffix ? "." + i18keySuffix : "");
  const { t } = useTranslation(undefined, { keyPrefix: key });
  const text = isVerified === null ? t("pending") : isVerified ? t("verified") : t("rejected");
  const color = isVerified === null ? "warning" : isVerified ? "success" : "error";
  return <Chip label={text} color={color} {...props} />;
}

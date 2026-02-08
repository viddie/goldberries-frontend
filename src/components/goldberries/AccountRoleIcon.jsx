import { faHammer, faHand, faNewspaper, faShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

import { isAdmin, isHelper, isNewsWriter, isVerifier } from "../../hooks/AuthProvider";

export function AccountRoleIcon({ account }) {
  if (isNewsWriter(account)) return <NewsWriterIcon />;
  if (isHelper(account)) return <HelperIcon />;
  if (isVerifier(account)) return <VerifierIcon />;
  if (isAdmin(account)) return <AdminIcon />;
  return null;
}

export function NewsWriterIcon() {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("components.roles.news_writer")} arrow placement="top">
      <FontAwesomeIcon icon={faNewspaper} color="grey" />
    </Tooltip>
  );
}

export function HelperIcon() {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("components.roles.helper")} arrow placement="top">
      <FontAwesomeIcon icon={faHand} color="grey" />
    </Tooltip>
  );
}

export function VerifierIcon() {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("components.roles.verifier")} arrow placement="top">
      <FontAwesomeIcon icon={faShield} color="grey" />
    </Tooltip>
  );
}

export function AdminIcon() {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("components.roles.admin")} arrow placement="top">
      <FontAwesomeIcon icon={faHammer} color="grey" />
    </Tooltip>
  );
}

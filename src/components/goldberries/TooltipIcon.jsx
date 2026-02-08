import { faCircleExclamation, faComment, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "@emotion/react";
import { useTranslation } from "react-i18next";

import { TooltipLineBreaks } from "../basic/TooltipLineBreaks";

export function TooltipIcon({ title, icon, fontSize = "1em" }) {
  return (
    <TooltipLineBreaks title={title}>
      <FontAwesomeIcon icon={icon} fontSize={fontSize} />
    </TooltipLineBreaks>
  );
}

export function VerifierNotesIcon({ notes, fontSize = "1em" }) {
  return <TooltipIcon title={notes} icon={faCircleExclamation} fontSize={fontSize} />;
}

export function PlayerNotesIcon({ notes, fontSize = "1em" }) {
  return <TooltipIcon title={notes} icon={faComment} fontSize={fontSize} />;
}

export function ObsoleteIcon() {
  const theme = useTheme();
  const { t } = useTranslation(undefined, { keyPrefix: "components.top_golden_list" });
  return (
    <TooltipLineBreaks title={t("obsolete_notice")}>
      <FontAwesomeIcon icon={faExclamationTriangle} color={theme.palette.text.secondary} size="sm" />
    </TooltipLineBreaks>
  );
}

export function PlayerNotesTooltip({ note }) {
  const theme = useTheme();
  return (
    <TooltipLineBreaks title={note}>
      <FontAwesomeIcon icon={faComment} color={theme.palette.text.secondary} size="sm" />
    </TooltipLineBreaks>
  );
}

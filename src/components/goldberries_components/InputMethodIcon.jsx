import { faChildCombatant, faGamepad, faKeyboard, faPersonDrowning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

export const INPUT_METHOD_ICONS = {
  keyboard: faKeyboard,
  dpad: faGamepad,
  analog: faGamepad,
  hybrid: faPersonDrowning,
  other: faChildCombatant,
};

export function InputMethodIcon({ method, ...props }) {
  const { t } = useTranslation();
  const icon = INPUT_METHOD_ICONS[method];
  const inputMethodName = t("components.input_methods." + method);
  return (
    <Tooltip title={inputMethodName} arrow placement="top">
      <FontAwesomeIcon icon={icon} {...props} />
    </Tooltip>
  );
}

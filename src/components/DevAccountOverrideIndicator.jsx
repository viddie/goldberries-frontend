import { Tooltip, useTheme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserSecret } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

import { setDevAccountOverride, useAuth } from "../hooks/AuthProvider";

import { SegmentedChip, safeDarken } from "./basic";

export function DevAccountOverrideIndicator() {
  const { t } = useTranslation(undefined, { keyPrefix: "app_settings.tabs.dev.account_override" });
  const auth = useAuth();
  const theme = useTheme();

  if (!auth.isDevAccountOverrideActive) return null;

  const color = theme.palette.warning.main;
  const shade = safeDarken(color, 0.3);
  const name = auth.user.player?.name ?? "#" + auth.user.id;
  const onClick = () => {
    setDevAccountOverride(null);
    window.location.reload();
  };

  return (
    <Tooltip title={t("indicator_tooltip")}>
      <SegmentedChip
        onClick={onClick}
        segments={[
          {
            key: "label",
            label: (
              <>
                <FontAwesomeIcon icon={faUserSecret} style={{ marginRight: 4 }} />
                {t("indicator")}
              </>
            ),
            color,
          },
          { key: "name", label: name, color: shade, sx: { fontWeight: "bold" } },
        ]}
      />
    </Tooltip>
  );
}

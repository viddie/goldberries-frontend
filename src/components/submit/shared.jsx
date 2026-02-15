import { Button, Grid, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../hooks/AuthProvider";
import { NOTIFICATIONS, hasFlag } from "../../pages/Account";

//#region NotificationNotice
export function NotificationNotice({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "submit.notifications" });
  const auth = useAuth();
  const hasDiscord = auth.user?.discord_id !== null;
  const notifsEnabled = hasDiscord && hasFlag(auth.user.notifications, NOTIFICATIONS.sub_verified.flag);
  return (
    <>
      {(notifsEnabled || true) && (
        <Grid item xs={12} sm={12}>
          <Typography variant="caption" color="textSecondary">
            {t("your_settings")}{" "}
          </Typography>
          <Typography variant="caption" color={notifsEnabled ? "success.main" : "error.main"}>
            {t(notifsEnabled ? "enabled" : "disabled")}
          </Typography>
        </Grid>
      )}
    </>
  );
}
//#endregion

//#region CFCSelector
export function CFCSelector({ value, onChange, challenge, enabled }) {
  const { t } = useTranslation(undefined, { keyPrefix: "submit.tabs.single.cfc_selector" });
  const requiresFc = challenge?.requires_fc ?? false;
  const hasFc = challenge?.has_fc ?? false;
  const isDisabledRegular = !enabled && (challenge === null || requiresFc);
  const isDisabledFull = !enabled && (challenge === null || (!hasFc && !requiresFc));
  const color = "success";
  const sx = {
    fontSize: "0.9rem",
    py: 1.5,
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Button
        variant={value === false ? "contained" : "outlined"}
        onClick={() => onChange(false)}
        disabled={isDisabledRegular}
        color={color}
        fullWidth
        sx={sx}
      >
        {t("regular_clear")}
      </Button>
      <Button
        variant={value === true ? "contained" : "outlined"}
        onClick={() => onChange(true)}
        disabled={isDisabledFull}
        color={color}
        fullWidth
        sx={sx}
      >
        {t("full_clear")}
      </Button>
    </Stack>
  );
}
//#endregion

//#region URL Validation
const disallowedUrls = ["discord.com", "imgur.com"];
const disallowedVariantUrls = ["youtube.com/playlist", "youtube.com/live/", "b23.tv/", "space.bilibili.com/"];

export function validateUrl(url, required = true) {
  url = url.trim();

  if (url === "") {
    if (required) {
      return "required";
    } else {
      return true;
    }
  }

  try {
    new URL(url);
  } catch (e) {
    return "invalid";
  }

  if (disallowedUrls.some((disallowed) => url.includes(disallowed))) {
    return "disallowed";
  }
  if (disallowedVariantUrls.some((disallowed) => url.includes(disallowed))) {
    return "disallowed_variant";
  }

  return true;
}

export function validateUrlNotRequired(url) {
  return validateUrl(url, false);
}
//#endregion

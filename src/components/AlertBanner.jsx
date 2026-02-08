import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { useState } from "react";

import { useAuth } from "../hooks/AuthProvider";

import { StyledLink } from "./basic";

const ALERT_STORAGE_KEY = "dismissed_alerts";

//#region AlertBanner
/**
 * A reusable alert banner component that displays below the navbar
 * @param {Object} props
 * @param {string} props.alertId - Unique identifier for this alert (for dismissal tracking)
 * @param {string} props.severity - Alert severity: 'info', 'warning', 'error', 'success'
 * @param {React.ReactNode} props.children - Alert content
 * @param {boolean} props.show - Whether to show the alert (external condition)
 * @param {string} props.hideForDayLabel - Label for "hide for 1 day" button
 * @param {string} props.hidePermanentlyLabel - Label for "don't show again" button
 * @param {Function} props.onDismiss - Optional callback when alert is dismissed
 */
export function AlertBanner({
  alertId,
  severity = "info",
  children,
  show = true,
  hideForDayLabel,
  hidePermanentlyLabel,
  onDismiss,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.alert_banner" });

  // Use state to trigger re-render when dismissed
  const [, setDismissedVersion] = useState(0);

  const isDismissed = isAlertDismissed(alertId);

  if (!show || isDismissed) {
    return null;
  }

  const handleHideForDay = () => {
    dismissAlert(alertId, false);
    setDismissedVersion((v) => v + 1);
    onDismiss?.();
  };

  const handleHidePermanently = () => {
    dismissAlert(alertId, true);
    setDismissedVersion((v) => v + 1);
    onDismiss?.();
  };

  return (
    <Box
      sx={{
        width: "100%",
        position: "fixed",
        top: { xs: 56, md: 48 },
        left: 0,
        zIndex: 1100,
      }}
    >
      <Alert
        severity={severity}
        sx={{
          borderRadius: 0,
          alignItems: "center",
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          gap={1}
          width="100%"
        >
          <Box flex={1}>{children}</Box>
          <Stack direction="row" gap={1} alignItems="center" flexShrink={0}>
            <Button
              size="small"
              variant="text"
              color="inherit"
              onClick={handleHidePermanently}
              sx={{ whiteSpace: "nowrap", opacity: 0.7 }}
            >
              {hidePermanentlyLabel || t("hide_permanently")}
            </Button>
            <Button
              size="small"
              variant="contained"
              color={severity}
              onClick={handleHideForDay}
              sx={{ whiteSpace: "nowrap" }}
            >
              {hideForDayLabel || t("hide_for_day")}
            </Button>
          </Stack>
        </Stack>
      </Alert>
    </Box>
  );
}
//#endregion

//#region ProfileSettingsAlert
/**
 * Alert reminding users to set their country and input method in account settings
 */
export function ProfileSettingsAlert() {
  const auth = useAuth();

  // Only show if user is logged in and has a claimed player
  const show = auth.isLoggedIn && auth.hasPlayerClaimed;

  // Check if user has already set country and input method
  const account = auth.user;
  const hasCountry = account?.country && account.country !== "";
  const hasInputMethod = account?.input_method && account.input_method !== "";

  // Don't show if both are already set
  const needsReminder = !hasCountry || !hasInputMethod;

  return (
    <AlertBanner alertId="profile-settings-reminder" severity="info" show={show && needsReminder}>
      <Typography variant="body2">
        <Trans
          i18nKey="components.alert_banner.profile_settings.message"
          components={{
            SettingsLink: <StyledLink to="/my-account/profile" />,
            StatsLink: <StyledLink to="/stats/tier-clears/country" />,
          }}
        />
      </Typography>
    </AlertBanner>
  );
}
//#endregion

//#region Utility Functions
/**
 * Get the dismissed alerts from localStorage
 * @returns {Object} Object with alert IDs as keys and dismissal info as values
 */
function getDismissedAlerts() {
  try {
    const stored = localStorage.getItem(ALERT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Check if an alert is currently dismissed
 * @param {string} alertId - Unique identifier for the alert
 * @returns {boolean} Whether the alert is dismissed
 */
function isAlertDismissed(alertId) {
  const dismissed = getDismissedAlerts();
  const dismissal = dismissed[alertId];

  if (!dismissal) return false;

  // Check if permanent dismissal
  if (dismissal.permanent) return true;

  // Check if temporary dismissal has expired
  if (dismissal.until) {
    const until = new Date(dismissal.until);
    if (until > new Date()) return true;
  }

  return false;
}

/**
 * Dismiss an alert
 * @param {string} alertId - Unique identifier for the alert
 * @param {boolean} permanent - Whether to dismiss permanently
 * @param {number} durationMs - Duration in milliseconds for temporary dismissal
 */
function dismissAlert(alertId, permanent = false, durationMs = 24 * 60 * 60 * 1000) {
  const dismissed = getDismissedAlerts();

  if (permanent) {
    dismissed[alertId] = { permanent: true };
  } else {
    const until = new Date(Date.now() + durationMs);
    dismissed[alertId] = { until: until.toISOString() };
  }

  localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(dismissed));
}
//#endregion

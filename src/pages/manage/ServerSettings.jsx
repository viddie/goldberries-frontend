import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "@emotion/react";
import { faBroom, faSpinner, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

import { StringListEditor } from "../../components/StringListEditor";
import { getGlobalNoticeSeverityInfo } from "../../components/GlobalNotices";
import {
  getQueryData,
  useGetServerSettings,
  usePostServerSettings,
  useRunAdminAction,
} from "../../hooks/useApi";
import { BasicContainerBox, ErrorDisplay, HeadTitle, LoadingSpinner } from "../../components/basic";

export function PageManageServerSettings({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.server_settings" });

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={t("title")} />
      <Typography variant="h4" gutterBottom>
        {t("title")}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <ServerSettingsFormWrapper />

      <Divider sx={{ my: 3 }} />

      <AdminActionsSection />
    </BasicContainerBox>
  );
}

function ServerSettingsFormWrapper({}) {
  const query = useGetServerSettings();
  const serverSettings = getQueryData(query);

  if (query.isLoading) return <LoadingSpinner />;
  else if (query.isError) return <ErrorDisplay error={query.error} />;

  return <ServerSettingsForm serverSettings={serverSettings} />;
}

function ServerSettingsForm({ serverSettings }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.server_settings.form" });
  const theme = useTheme();
  const form = useForm({
    defaultValues: serverSettings,
  });
  const onSubmit = form.handleSubmit((data) => {
    updateServerSettings(data);
  });

  const { mutate: updateServerSettings } = usePostServerSettings((data) => {
    toast.success(t("feedback.updated"));
  });

  return (
    <Grid container>
      <Grid item xs={12}>
        <Controller
          control={form.control}
          name="registrations_enabled"
          render={({ field }) => (
            <FormControlLabel
              onChange={field.onChange}
              label={t("registrations_enabled")}
              checked={field.value}
              control={<Checkbox />}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          control={form.control}
          name="submissions_enabled"
          render={({ field }) => (
            <FormControlLabel
              onChange={field.onChange}
              label={t("submissions_enabled")}
              checked={field.value}
              control={<Checkbox />}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          control={form.control}
          name="maintenance_mode"
          render={({ field }) => (
            <FormControlLabel
              onChange={field.onChange}
              label={t("maintenance_mode")}
              checked={field.value}
              control={<Checkbox />}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
      </Grid>

      <Grid item xs={12}>
        <Controller
          control={form.control}
          name="global_notices"
          render={({ field }) => (
            <StringListEditor
              label={t("global_notices.label")}
              valueTypes={[
                {
                  type: "enum",
                  options: getSeverityOptions(theme),
                },
                { type: "string", multiline: true },
              ]}
              valueLabels={[t("global_notices.severity"), t("global_notices.message")]}
              list={field.value}
              setList={field.onChange}
              valueCount={2}
              reorderable
              inline={[3, 9]}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
      </Grid>

      <Grid item xs={12}>
        <Button variant="contained" fullWidth color="primary" onClick={onSubmit}>
          {t("buttons.update")}
        </Button>
      </Grid>
    </Grid>
  );
}

//#region Admin Actions
const ADMIN_ACTIONS = [
  {
    category: "database",
    actions: [
      {
        key: "clean_traffic",
        name: "Clean Traffic",
        description: "Delete traffic entries with NULL user_agent",
        icon: faBroom,
        dangerous: false,
      },
    ],
  },
];

const CONFIRM_DELAY_MS = 1500;
const CONFIRM_TIMEOUT_MS = 5000;

function AdminActionsSection() {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.server_settings.admin_actions" });
  const [lastResult, setLastResult] = useState(null);

  const { mutate: runAction, isLoading } = useRunAdminAction((data) => {
    setLastResult(data);
    if (data?.message) {
      toast.success(data.message);
    }
  });

  const handleRunAction = (actionKey, params = {}) => {
    runAction({ action: actionKey, params });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{t("title")}</Typography>

      {ADMIN_ACTIONS.map((category) => (
        <Stack key={category.category} spacing={1}>
          <Typography variant="subtitle1" sx={{ textTransform: "capitalize", fontWeight: "bold" }}>
            {category.category}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {category.actions.map((action) => (
              <AdminActionButton
                key={action.key}
                action={action}
                onRun={handleRunAction}
                disabled={isLoading}
              />
            ))}
          </Stack>
        </Stack>
      ))}

      {lastResult !== null && (
        <Stack spacing={1}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {t("last_result")}
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: (theme) => theme.palette.background.default,
              fontFamily: "monospace",
              fontSize: "0.875rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(lastResult, null, 2)}
          </Paper>
        </Stack>
      )}
    </Stack>
  );
}

function AdminActionButton({ action, onRun, disabled }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.server_settings.admin_actions" });
  const [confirming, setConfirming] = useState(false);
  const [confirmReady, setConfirmReady] = useState(false);
  const confirmTimerRef = useRef(null);
  const readyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    };
  }, []);

  const handleClick = () => {
    if (action.dangerous && !confirming) {
      setConfirming(true);
      setConfirmReady(false);
      readyTimerRef.current = setTimeout(() => {
        setConfirmReady(true);
      }, CONFIRM_DELAY_MS);
      confirmTimerRef.current = setTimeout(() => {
        setConfirming(false);
        setConfirmReady(false);
      }, CONFIRM_TIMEOUT_MS);
      return;
    }

    if (action.dangerous && !confirmReady) return;

    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    setConfirming(false);
    setConfirmReady(false);
    onRun(action.key);
  };

  const isConfirming = action.dangerous && confirming;

  return (
    <Button
      variant={isConfirming ? "contained" : "outlined"}
      color={isConfirming ? "warning" : "primary"}
      onClick={handleClick}
      disabled={disabled || (isConfirming && !confirmReady)}
      startIcon={
        <FontAwesomeIcon
          icon={isConfirming ? (confirmReady ? faTriangleExclamation : faSpinner) : action.icon}
          spin={isConfirming && !confirmReady}
        />
      }
      sx={{ textTransform: "none" }}
    >
      {isConfirming ? t("confirm") : action.name}
    </Button>
  );
}
//#endregion

const SEVERITIES = [
  { value: "success", name: "Success" },
  { value: "info", name: "Info" },
  { value: "warning", name: "Warning" },
  { value: "error", name: "Error" },
];

function getSeverityOptions(theme) {
  return SEVERITIES.map((severity) => {
    const info = getGlobalNoticeSeverityInfo(theme, severity.value);
    return (
      <MenuItem key={severity.value} value={severity.value}>
        <Stack direction="row" gap={1} alignItems="center">
          <FontAwesomeIcon icon={info.icon} color={info.color} fontSize="1.5em" />
          <Typography variant="body1" color={info.color}>
            {severity.name}
          </Typography>
        </Stack>
      </MenuItem>
    );
  });
}

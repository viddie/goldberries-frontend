import { Button, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightArrowLeft,
  faBan,
  faBroom,
  faSpinner,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import { useRunAdminAction } from "../../hooks/useApi";
import { useAuth } from "../../hooks/AuthProvider";
import { BasicContainerBox, HeadTitle } from "../../components/basic";

export function PageManageActions() {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.actions" });
  const auth = useAuth();

  const [lastResult, setLastResult] = useState(null);

  const { mutate: runAction, isLoading } = useRunAdminAction((data) => {
    setLastResult(data);
    // if (data?.message) {
    //   toast.success(data.message);
    // }
  });

  const handleRunAction = (actionKey, params = {}) => {
    runAction({ action: actionKey, params });
  };

  const helperActions = auth.hasHelperPriv ? HELPER_ACTIONS : [];
  const verifierActions = auth.hasVerifierPriv ? VERIFIER_ACTIONS : [];
  const adminActions = auth.hasAdminPriv ? ADMIN_ACTIONS : [];

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={t("title")} />
      <Typography variant="h4" gutterBottom>
        {t("title")}
      </Typography>

      {helperActions.length > 0 && (
        <ActionCategorySection actions={helperActions} onRun={handleRunAction} disabled={isLoading} />
      )}

      {verifierActions.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <ActionCategorySection
            title={t("verifier_section")}
            actions={verifierActions}
            onRun={handleRunAction}
            disabled={isLoading}
          />
        </>
      )}

      {adminActions.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <ActionCategorySection
            title={t("admin_section")}
            actions={adminActions}
            onRun={handleRunAction}
            disabled={isLoading}
          />
        </>
      )}

      {lastResult !== null && (
        <Stack spacing={1} sx={{ mt: 3 }}>
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
    </BasicContainerBox>
  );
}

function ActionCategorySection({ title, actions, onRun, disabled }) {
  return (
    <Stack spacing={2}>
      {title && <Typography variant="h5">{title}</Typography>}
      {actions.map((category) => (
        <Stack key={category.category} spacing={1}>
          <Typography variant="subtitle1" sx={{ textTransform: "capitalize", fontWeight: "bold" }}>
            {category.category}
          </Typography>
          <Stack direction="column" gap={1}>
            {category.actions.map((action) => (
              <AdminActionButton action={action} onRun={onRun} disabled={disabled} />
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

//#region Action Definitions
const HELPER_ACTIONS = [
  {
    category: "challenges",
    actions: [
      {
        key: "reject_challenge",
        name: "Reject Challenge",
        description:
          "Reject a challenge and all submissions to it. CAUTION: Sends discord notifications for the updated verification state of the submissions.",
        icon: faBan,
        dangerous: true,
        params: [
          { key: "id", label: "Challenge ID", type: "number" },
          { key: "reason", label: "Reason", type: "string" },
        ],
      },
    ],
  },
  {
    category: "campaigns",
    actions: [
      {
        key: "swap_lobbies",
        name: "Swap Lobbies",
        description: "Swap the order of two lobbies in a campaign.",
        icon: faArrowRightArrowLeft,
        dangerous: true,
        params: [
          { key: "campaign_id", label: "Campaign ID", type: "number" },
          { key: "sort_a", label: "Sort A", type: "number" },
          { key: "sort_b", label: "Sort B", type: "number" },
        ],
      },
    ],
  },
];

const VERIFIER_ACTIONS = [];

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
//#endregion

//#region Action Button
const CONFIRM_DELAY_MS = 1500;
const CONFIRM_TIMEOUT_MS = 5000;

function AdminActionButton({ action, onRun, disabled }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.actions" });
  const [confirming, setConfirming] = useState(false);
  const [confirmReady, setConfirmReady] = useState(false);
  const [paramValues, setParamValues] = useState({});
  const [showParams, setShowParams] = useState(false);
  const confirmTimerRef = useRef(null);
  const readyTimerRef = useRef(null);

  const hasParams = action.params && action.params.length > 0;

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    };
  }, []);

  const handleParamChange = (key, value) => {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  };

  const allParamsFilled =
    !hasParams ||
    action.params.every((p) => {
      const val = paramValues[p.key];
      return val !== undefined && val !== "";
    });

  const handleClick = () => {
    // If action has params and they're not yet shown, show them first
    if (hasParams && !showParams) {
      setShowParams(true);
      return;
    }

    // If params are required but not all filled, don't proceed
    if (!allParamsFilled) return;

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
    setShowParams(false);
    setParamValues({});
    onRun(action.key, hasParams ? paramValues : {});
  };

  const isConfirming = action.dangerous && confirming;

  return (
    <Stack gap={1} sx={{ width: showParams ? "100%" : "auto" }}>
      <Stack direction="row" gap={2} alignItems="center">
        <Stack direction="row" gap={1} alignItems="center">
          <Button
            variant={isConfirming ? "contained" : "outlined"}
            color={isConfirming ? "warning" : "primary"}
            onClick={handleClick}
            disabled={
              disabled || (isConfirming && !confirmReady) || (showParams && !allParamsFilled && !isConfirming)
            }
            startIcon={
              <FontAwesomeIcon
                icon={isConfirming ? (confirmReady ? faTriangleExclamation : faSpinner) : action.icon}
                spin={isConfirming && !confirmReady}
              />
            }
            sx={{ textTransform: "none", whiteSpace: "nowrap" }}
          >
            {isConfirming ? t("confirm") : action.name}
          </Button>
          {showParams && (
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setShowParams(false);
                setParamValues({});
                setConfirming(false);
                setConfirmReady(false);
              }}
              sx={{ textTransform: "none" }}
            >
              {t("cancel")}
            </Button>
          )}
        </Stack>
        <Typography variant="body2" color="textSecondary">
          {action.description}
        </Typography>
      </Stack>
      {showParams && (
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ pl: 1 }}>
          {action.params.map((param) => (
            <TextField
              key={param.key}
              label={param.label}
              size="small"
              type={param.type === "number" ? "number" : "text"}
              value={paramValues[param.key] ?? ""}
              onChange={(e) => handleParamChange(param.key, e.target.value)}
              disabled={isConfirming}
              sx={{ minWidth: 120 }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
//#endregion

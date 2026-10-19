import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckCircle,
  faKey,
  faRotateRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import {
  BasicContainerBox,
  CopyToClipboardButton,
  HeadTitle,
  LoadingSpinner,
  NoticeBox,
  StyledLink,
} from "../components/basic";
import { useAuth } from "../hooks/AuthProvider";
import { getQueryData, useGetApiKeys, usePostApiKey } from "../hooks/useApi";
import { isValidHttpUrl } from "../util/util";

import { API_KEY_MAX_NAME_LENGTH, API_KEY_SCOPES } from "./Account";

const RETURN_URL_PARAM = "api_key";
const STATUS = {
  IDLE: "idle",
  DELIVERING: "delivering",
  SUCCESS: "success",
  DELIVERY_FAILED: "delivery_failed",
  CANCELLED: "cancelled",
};

export function PageAuthApplication() {
  const { t } = useTranslation(undefined, { keyPrefix: "auth_application" });
  const [searchParams] = useSearchParams();

  const request = useMemo(() => parseAuthRequest(searchParams), [searchParams]);

  return (
    <BasicContainerBox modern maxWidth="xs" sx={{ mt: { xs: 1, sm: 6 } }}>
      <HeadTitle title={t("title")} />
      {request.error ? (
        <AuthApplicationInvalid error={request.error} />
      ) : (
        <AuthApplicationDialog request={request} />
      )}
    </BasicContainerBox>
  );
}

function AuthApplicationInvalid({ error }) {
  const { t } = useTranslation(undefined, { keyPrefix: "auth_application" });
  return (
    <Stack direction="column" gap={2} alignItems="center" sx={{ py: 2 }}>
      <Typography variant="h5">{t("invalid.title")}</Typography>
      <NoticeBox severity="error" sx={{ width: "100%" }}>
        {t("invalid.errors." + error.key, error.params)}
      </NoticeBox>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {t("invalid.note")}
      </Typography>
    </Stack>
  );
}

function AuthApplicationDialog({ request }) {
  const { t } = useTranslation(undefined, { keyPrefix: "auth_application" });
  const { t: t_s } = useTranslation(undefined, {
    keyPrefix: "account.tabs.danger_zone.api_key.scopes",
  });
  const auth = useAuth();
  const [status, setStatus] = useState(STATUS.IDLE);
  const [apiKey, setApiKey] = useState(null);
  const keysQuery = useGetApiKeys();
  const { mutate: postApiKey, isLoading: isCreating } = usePostApiKey(
    (createdKey) => {
      setApiKey(createdKey);
      deliverKey(createdKey);
    },
  );

  const existingKeys = getQueryData(keysQuery) ?? [];
  const nameTaken = existingKeys.some(
    (key) => key.name.toLowerCase() === request.name.toLowerCase(),
  );

  const deliverKey = async (key) => {
    setStatus(STATUS.DELIVERING);
    const success = await sendKeyToReturnUrl(request.returnUrl, key.key);
    setStatus(success ? STATUS.SUCCESS : STATUS.DELIVERY_FAILED);
  };

  const onAuthorize = () => {
    postApiKey({ name: request.name, scopes: request.scopes });
  };

  const onCancel = () => {
    // Only works for tabs opened by scripts, so fall back to telling the user to close it themselves
    window.close();
    setStatus(STATUS.CANCELLED);
  };

  if (status === STATUS.SUCCESS) {
    return (
      <AuthApplicationResult
        icon={faCheckCircle}
        color="success.main"
        title={t("success.title")}
        text={t("success.text", { name: request.name })}
      />
    );
  }
  if (status === STATUS.CANCELLED) {
    return (
      <AuthApplicationResult
        icon={faXmark}
        color="text.secondary"
        title={t("cancelled.title")}
        text={t("cancelled.text")}
      />
    );
  }
  if (status === STATUS.DELIVERING) {
    return (
      <Stack direction="column" gap={2} alignItems="center" sx={{ py: 3 }}>
        <LoadingSpinner />
        <Typography variant="body1">
          {t("delivering", { name: request.name })}
        </Typography>
      </Stack>
    );
  }
  if (status === STATUS.DELIVERY_FAILED) {
    return (
      <AuthApplicationDeliveryFailed
        request={request}
        apiKey={apiKey}
        onRetry={() => deliverKey(apiKey)}
      />
    );
  }

  return (
    <Stack direction="column" gap={2}>
      <Stack direction="column" alignItems="center" gap={1}>
        <Box sx={{ fontSize: "2.5rem", color: "primary.main" }}>
          <FontAwesomeIcon icon={faKey} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t("external_application")}
        </Typography>
        <Typography
          variant="h5"
          textAlign="center"
          sx={{ wordBreak: "break-word" }}
        >
          {request.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          <Trans
            t={t}
            i18nKey="wants_access"
            values={{ player: auth.user.player?.name ?? "" }}
            components={{ b: <b /> }}
          />
        </Typography>
      </Stack>

      <Divider />

      <Box>
        <Typography variant="overline" color="text.secondary">
          {t("scopes_label")}
        </Typography>
        <List dense disablePadding>
          {request.scopeKeys.map((scopeKey) => (
            <ListItem key={scopeKey} disableGutters>
              <ListItemIcon sx={{ minWidth: 28, color: "success.main" }}>
                <FontAwesomeIcon icon={faCheck} />
              </ListItemIcon>
              <ListItemText primary={t_s(scopeKey)} />
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      <Stack direction="column" gap={0.5}>
        <Typography variant="caption" color="text.secondary">
          {t("return_url_label")}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ wordBreak: "break-all", fontFamily: "monospace" }}
        >
          {request.returnUrl}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <Trans
            t={t}
            i18nKey="revoke_note"
            components={{
              CustomLink: (
                <StyledLink to="/my-account/danger-zone" target="_blank" />
              ),
            }}
          />
        </Typography>
      </Stack>

      {nameTaken && (
        <NoticeBox severity="warning">
          <Trans
            t={t}
            i18nKey="name_taken"
            values={{ name: request.name }}
            components={{
              CustomLink: (
                <StyledLink to="/my-account/danger-zone" target="_blank" />
              ),
            }}
          />
        </NoticeBox>
      )}

      <Stack direction="row" gap={1} justifyContent="flex-end">
        <Button variant="outlined" onClick={onCancel} disabled={isCreating}>
          {t("buttons.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={onAuthorize}
          disabled={isCreating || keysQuery.isLoading || nameTaken}
        >
          {t("buttons.authorize")}
        </Button>
      </Stack>
    </Stack>
  );
}

function AuthApplicationResult({ icon, color, title, text }) {
  return (
    <Stack direction="column" gap={1.5} alignItems="center" sx={{ py: 2 }}>
      <Box sx={{ fontSize: "3rem", color: color }}>
        <FontAwesomeIcon icon={icon} />
      </Box>
      <Typography variant="h5" textAlign="center">
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center">
        {text}
      </Typography>
    </Stack>
  );
}

function AuthApplicationDeliveryFailed({ request, apiKey, onRetry }) {
  const { t } = useTranslation(undefined, {
    keyPrefix: "auth_application.delivery_failed",
  });
  return (
    <Stack direction="column" gap={2}>
      <Typography variant="h5" textAlign="center">
        {t("title")}
      </Typography>
      <NoticeBox severity="error">
        {t("text", { name: request.name })}
      </NoticeBox>
      <Button
        variant="contained"
        startIcon={<FontAwesomeIcon icon={faRotateRight} />}
        onClick={onRetry}
      >
        {t("retry")}
      </Button>
      <Divider />
      <Typography variant="body2" color="text.secondary">
        {t("manual")}
      </Typography>
      <Stack direction="row" gap={1} alignItems="center">
        <TextField
          value={apiKey.key}
          fullWidth
          size="small"
          type="password"
          InputProps={{ readOnly: true }}
        />
        <CopyToClipboardButton
          text={apiKey.key}
          size="small"
          sx={{ height: 40, flexShrink: 0 }}
        />
      </Stack>
    </Stack>
  );
}

//#region Utility Functions
function parseAuthRequest(searchParams) {
  const name = (searchParams.get("name") ?? "").trim();
  const scopesParam = searchParams.get("scopes") ?? "";
  const returnUrl = searchParams.get("return_url") ?? "";

  if (name === "") return { error: { key: "missing_name" } };
  if (name.length > API_KEY_MAX_NAME_LENGTH)
    return {
      error: { key: "name_too_long", params: { max: API_KEY_MAX_NAME_LENGTH } },
    };

  const scopeKeys = [
    ...new Set(
      scopesParam
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
    ),
  ];
  if (scopeKeys.length === 0) return { error: { key: "missing_scopes" } };

  let scopes = 0;
  for (const scopeKey of scopeKeys) {
    const scope = API_KEY_SCOPES[scopeKey];
    if (scope === undefined)
      return { error: { key: "unknown_scope", params: { scope: scopeKey } } };
    if (scope.helper)
      return { error: { key: "forbidden_scope", params: { scope: scopeKey } } };
    scopes |= scope.flag;
  }

  if (returnUrl === "") return { error: { key: "missing_return_url" } };
  if (!isValidHttpUrl(returnUrl))
    return { error: { key: "invalid_return_url" } };

  return { name, scopes, scopeKeys, returnUrl, error: null };
}

// Sent from the client instead of the server, so that applications listening on localhost can receive the key.
// "no-cors" lets the request through without the application having to send CORS headers, at the cost of not
// being able to read the response. A rejected fetch means the application wasn't reachable.
async function sendKeyToReturnUrl(returnUrl, key) {
  const url = new URL(returnUrl);
  url.searchParams.set(RETURN_URL_PARAM, key);
  try {
    await fetch(url.toString(), {
      method: "GET",
      mode: "no-cors",
      credentials: "omit",
      cache: "no-store",
    });
    return true;
  } catch (error) {
    console.log("Failed to send API key to return URL", error);
    return false;
  }
}
//#endregion

import { useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import "@mui/material";
import { Box, Button, Divider, Grid, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { useAuth } from "../hooks/AuthProvider";
import { MemoWebsiteIcon } from "../components/goldberries";
import {
  useForgotPasswordRequest,
  useForgotPasswordVerify,
  useRegister,
  useVerifyEmail,
} from "../hooks/useApi";
import {
  BasicContainerBox,
  CustomIconButton,
  HeadTitle,
  ModalLink,
  NoticeBox,
  StyledLink,
} from "../components/basic";
import { ACCOUNT_TEAM, FormOptions } from "../util/constants";
import { displayDate } from "../util/data_util";
import { jsonDateToJsDate } from "../util/util";

import { PlayerChipAsync } from "./Post";

export function PageLogin() {
  const { t } = useTranslation(undefined, { keyPrefix: "login.login" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const auth = useAuth();
  const { redirect } = useParams();
  const form = useForm();
  const [suspension, setSuspension] = useState(null);
  const onSubmit = form.handleSubmit(async (data) => {
    setSuspension(await auth.loginWithEmail(data.email, data.password, redirect));
  });
  const errors = form.formState.errors;

  if (auth.user) {
    return <AlreadyLoggedInBox title={t("title")} />;
  }

  return (
    <LoginBox title={t("title")}>
      {suspension && <SuspensionNotice suspension={suspension} />}
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          label={t("email")}
          {...form.register("email", FormOptions.Email(t_ff))}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label={t("password")}
          {...form.register("password", FormOptions.Password(t_ff))}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {t("buttons.sign_in")}
        </Button>
        <Grid container>
          <Grid item xs>
            <StyledLink to="/forgot-password" variant="body2">
              {t("buttons.forgot_password")}
            </StyledLink>
          </Grid>
          <Grid item>
            <StyledLink to="/register" variant="body2">
              {t("buttons.sign_up")}
            </StyledLink>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mt: 2, mb: 0 }} flexItem>
        {t("or")}
      </Divider>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2, mb: 1 }}
        onClick={() => auth.loginWithDiscord(redirect)}
        endIcon={<FontAwesomeIcon icon={faDiscord} />}
      >
        {t("buttons.discord")}
      </Button>
    </LoginBox>
  );
}

export function PageRegister() {
  const { t } = useTranslation(undefined, { keyPrefix: "login.register" });
  const { t: t_l } = useTranslation(undefined, { keyPrefix: "login.login" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const auth = useAuth();
  const { error } = useParams();
  const [searchParams] = useSearchParams();
  const [postRegister, setPostRegister] = useState(false);
  const { mutate: register } = useRegister(() => {
    setPostRegister(true);
  });
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    register({
      email: data.email,
      password: data.password,
    });
  });
  const errors = form.formState.errors;

  const validateConfirmPassword = (value) => {
    return value === form.watch("password") || t_l("feedback.password_not_match");
  };

  if (auth.user) {
    return <AlreadyLoggedInBox title={t("title")} />;
  }
  if (postRegister) {
    return (
      <LoginBox title={t("title")} titleColor="green">
        <Typography variant="body2" color="green" textAlign="center">
          {t("success")}
        </Typography>
      </LoginBox>
    );
  }

  return (
    <LoginBox title={t("title")}>
      {error === "suspended" ? (
        <SuspensionNotice
          suspension={{ reason: searchParams.get("reason"), date_appeal: searchParams.get("date_appeal") }}
        />
      ) : (
        error && (
          <NoticeBox severity="error" sx={{ mb: 2, alignSelf: "stretch" }}>
            {decodeURIComponent(error)}
          </NoticeBox>
        )
      )}
      <Typography variant="body2" textAlign="center">
        {t("info")}
      </Typography>
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          label={t_l("email")}
          {...form.register("email", FormOptions.Email(t_ff))}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label={t_l("password")}
          {...form.register("password", FormOptions.Password(t_ff))}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label={t("confirm_password")}
          {...form.register("confirmPassword", { validate: validateConfirmPassword })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {t("buttons.register")}
        </Button>
        <Grid container>
          <Grid item>
            <StyledLink to="/login" variant="body2">
              {t("buttons.sign_in")}
            </StyledLink>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mt: 2, mb: 0 }} flexItem>
        {t_l("or")}
      </Divider>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2, mb: 1 }}
        onClick={() => auth.registerWithDiscord()}
        endIcon={<FontAwesomeIcon icon={faDiscord} />}
      >
        {t("buttons.discord")}
      </Button>
    </LoginBox>
  );
}

export function PageVerifyEmail() {
  const { t } = useTranslation(undefined, { keyPrefix: "login.verify_email" });
  const auth = useAuth();
  const { verify } = useParams();
  const [postSubmit, setPostSubmit] = useState(false);
  const { mutate: verifyEmail } = useVerifyEmail(() => {
    setPostSubmit(true);
  });
  const onSubmit = () => {
    verifyEmail(verify);
  };

  if (auth.user) {
    return <AlreadyLoggedInBox title={t("title")} />;
  }
  if (postSubmit) {
    return (
      <LoginBox title={t("title")} titleColor="green">
        <Typography variant="body2" color="green" textAlign="center">
          {t("success")}
        </Typography>
        <StyledLink to="/login">{t("to_login")}</StyledLink>
      </LoginBox>
    );
  }

  return (
    <LoginBox title={t("title")}>
      <Typography variant="body2" textAlign="center">
        {t("info")}
      </Typography>
      <Button onClick={onSubmit} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        {t("button")}
      </Button>
    </LoginBox>
  );
}

export function PageForgotPassword() {
  const { token } = useParams();

  if (token) {
    return <PageForgotPasswordVerify token={token} />;
  }

  return <PageForgotPasswordRequest />;
}

export function PageForgotPasswordRequest() {
  const { t } = useTranslation(undefined, { keyPrefix: "login.forgot_password.request" });
  const { t: t_l } = useTranslation(undefined, { keyPrefix: "login.login" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const auth = useAuth();
  const [postSubmit, setPostSubmit] = useState(false);
  const { mutate: requestPasswordChange } = useForgotPasswordRequest(() => {
    setPostSubmit(true);
  });
  const form = useForm({
    defaultValues: {
      email: "",
    },
  });
  const errors = form.formState.errors;
  const onSubmit = form.handleSubmit((data) => {
    requestPasswordChange(data.email);
  });

  if (auth.user) {
    return <AlreadyLoggedInBox title={t("title")} />;
  }
  if (postSubmit) {
    return (
      <LoginBox title={t("title")} titleColor="green">
        <Typography variant="body2" color="green" textAlign="center">
          {t("info")}
        </Typography>
      </LoginBox>
    );
  }

  return (
    <LoginBox title="Forgot Password">
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          label={t_l("email")}
          {...form.register("email", FormOptions.Email(t_ff))}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {t("button")}
        </Button>
      </Box>
    </LoginBox>
  );
}

export function PageForgotPasswordVerify({ token }) {
  const { t } = useTranslation(undefined, { keyPrefix: "login.forgot_password.verify" });
  const { t: t_l } = useTranslation(undefined, { keyPrefix: "login.login" });
  const { t: t_r } = useTranslation(undefined, { keyPrefix: "login.register" });
  const { t: t_ve } = useTranslation(undefined, { keyPrefix: "login.verify_email" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const auth = useAuth();
  const [postSubmit, setPostSubmit] = useState(false);
  const { mutate: changePassword } = useForgotPasswordVerify(() => {
    setPostSubmit(true);
  });
  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: token,
    },
  });
  const errors = form.formState.errors;
  const onSubmit = form.handleSubmit((data) => {
    changePassword({ token, password: data.password });
  });

  const validateConfirmPassword = (value) => {
    return value === form.watch("password") || t_l("feedback.password_not_match");
  };

  if (auth.user) {
    return <AlreadyLoggedInBox title={t("title")} />;
  }
  if (postSubmit) {
    return (
      <LoginBox title={t("title")} titleColor="green">
        <Typography variant="body2" color="green" textAlign="center">
          {t("success")}
        </Typography>
        <StyledLink to="/login">{t_ve("to_login")}</StyledLink>
      </LoginBox>
    );
  }

  return (
    <LoginBox title={t("title")}>
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <Typography variant="body2" textAlign="center">
          {t("info")}
        </Typography>
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label={t("new_password")}
          {...form.register("password", FormOptions.Password(t_ff))}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label={t_r("confirm_password")}
          {...form.register("confirmPassword", { validate: validateConfirmPassword })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {t("button")}
        </Button>
      </Box>
    </LoginBox>
  );
}

function LoginBox({ children, title, titleColor }) {
  return (
    <BasicContainerBox modern maxWidth="xs" sx={{ mt: { xs: 1, sm: 6 }, border: "none" }} innerSx={{ p: 0 }}>
      <HeadTitle title={title} />
      <LoginHeader title={title} titleColor={titleColor} />
      <Stack direction="column" justifyContent="center" alignItems="center" sx={{ p: { xs: 2, sm: 3 } }}>
        {children}
      </Stack>
    </BasicContainerBox>
  );
}
function LoginHeader({ title, titleColor }) {
  return (
    <Stack
      direction="column"
      alignItems="center"
      gap={0.5}
      sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 2, backgroundColor: "#333333" }}
    >
      <MemoWebsiteIcon preventFunny height="3em" />
      <Typography component="h1" variant="h5" fontWeight="bold" color={titleColor}>
        {title}
      </Typography>
    </Stack>
  );
}

function AlreadyLoggedInBox({ title }) {
  const { t } = useTranslation(undefined, { keyPrefix: "login" });
  return (
    <LoginBox title={title}>
      <Typography variant="body1">{t("already_logged_in")}</Typography>
    </LoginBox>
  );
}

function SuspensionNotice({ suspension }) {
  const { t } = useTranslation(undefined, { keyPrefix: "login.suspended" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  let appealText = t("appeal_indefinite");
  if (suspension.date_appeal) {
    appealText =
      jsonDateToJsDate(suspension.date_appeal) <= new Date()
        ? t("appeal_now")
        : t("appeal_from", { date: displayDate(suspension.date_appeal, t_g) });
  }

  return (
    <NoticeBox severity="error" alignItems="flex-start" sx={{ mb: 1, alignSelf: "stretch" }}>
      <Typography fontWeight="bold">{t("title")}</Typography>
      {suspension.reason && (
        <Typography variant="body2">{t("reason", { reason: suspension.reason })}</Typography>
      )}
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {appealText}
      </Typography>
      {suspension.date_appeal && (
        <ModalLink label={t("appeal.link")} title={t("appeal.title")} sx={{ mt: 0.5 }}>
          <AppealInstructions />
        </ModalLink>
      )}
    </NoticeBox>
  );
}

const APPEAL_STEP_COUNT = 3;
function AppealInstructions() {
  const { t } = useTranslation(undefined, { keyPrefix: "login.suspended.appeal" });
  const steps = Array.from({ length: APPEAL_STEP_COUNT }, (_, i) => i + 1);

  return (
    <Stack direction="column" gap={2}>
      <Typography variant="body1">{t("intro")}</Typography>
      <Box component="ol" sx={{ m: 0, pl: 3, "& li": { py: 0.25 } }}>
        {steps.map((step) => (
          <Typography key={step} component="li" variant="body1">
            {t("steps." + step)}
          </Typography>
        ))}
      </Box>

      <Stack direction="column" gap={1}>
        <Typography variant="h6">{t("team_header")}</Typography>
        {ACCOUNT_TEAM.map((member) => (
          <AccountTeamMember key={member.player_id} member={member} />
        ))}
      </Stack>
    </Stack>
  );
}

function AccountTeamMember({ member }) {
  const { t } = useTranslation(undefined, { keyPrefix: "login.suspended.appeal" });
  const [copied, setCopied] = useState(false);
  const copyHandle = () => {
    navigator.clipboard.writeText(member.discord);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={1}
      flexWrap="wrap"
      sx={{ p: 1, borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.05)" }}
    >
      <PlayerChipAsync id={member.player_id} size="small" />
      <Stack direction="row" alignItems="center" gap={1}>
        <FontAwesomeIcon icon={faDiscord} color="#5865F2" />
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
          {member.discord}
        </Typography>
        <Tooltip title={copied ? t("copied") : t("copy_handle")}>
          <CustomIconButton size="small" color={copied ? "success" : "primary"} onClick={copyHandle}>
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
          </CustomIconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

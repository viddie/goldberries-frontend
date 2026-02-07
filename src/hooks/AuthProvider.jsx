import { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { APP_URL, DISCORD_AUTH_URL, IS_DEBUG } from "../util/constants";
import { getErrorMessage } from "../components/basic_components";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useMediaQuery } from "@mui/material";
import { getDefaultSettings } from "./AppSettingsProvider";

const AuthContext = createContext();
export const ROLES = {
  USER: 0,
  EX_HELPER: 10,
  EX_VERIFIER: 11,
  EX_ADMIN: 12,
  NEWS_WRITER: 15,
  HELPER: 20,
  VERIFIER: 30,
  ADMIN: 40,
};

export function isNewsWriter(account) {
  return account.role === ROLES.NEWS_WRITER;
}
export function isHelper(account) {
  return account.role === ROLES.HELPER;
}
export function isVerifier(account) {
  return account.role === ROLES.VERIFIER;
}
export function isAdmin(account) {
  return account.role === ROLES.ADMIN;
}

export function AuthProvider({ children }) {
  const { t } = useTranslation(undefined, { keyPrefix: "hooks.auth" });
  const [user, setUser] = useLocalStorage("user", null);

  //For role override during dev settings
  const [settings, setSettings] = useLocalStorage("app_settings", getDefaultSettings());
  const roleOverride = settings?.dev?.roleOverride;

  const navigate = useNavigate();

  const loginWithEmail = async (email, password, redirect) => {
    const data = new FormData();
    data.append("email", email);
    data.append("password", password);
    try {
      const response = await axios.post("/auth/login", data);
      const user = await response.data;
      setUser(user);
      if (redirect) {
        navigate(redirect);
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loginWithDiscord = (url) => {
    let redirect = url ? encodeURIComponent("/" + url) : "";
    let postOAuthLogin = APP_URL + "/post-oauth" + redirect;
    window.location.href = DISCORD_AUTH_URL + "?login=true&redirect=" + postOAuthLogin;
  };

  const registerWithDiscord = () => {
    window.location.href = DISCORD_AUTH_URL;
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
      setUser(null);
      toast.success(t("logout_success"));
    } catch (err) {
      if (err.response.status === 401) {
        // Reachable, but wasn't logged in
        setUser(null);
        toast.error(t("not_logged_in"));
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  };

  const checkSession = async () => {
    try {
      const response = await axios.get("/auth/check_session");
      const user = await response.data;
      setUser(user);
    } catch (err) {
      if (err.response.status === 401) {
        // Unauthorized, but check succeeded
        setUser(null);
      } else {
        console.log("Failed session check", err);
      }
    }
  };

  // Call once per page load
  useEffect(() => {
    checkSession();
  }, []);

  const isLoggedIn = user !== null;

  let checkRole = isLoggedIn ? user.role : null;
  if (IS_DEBUG && isLoggedIn && roleOverride !== null) {
    checkRole = roleOverride;
  }

  const isNewsWriter = isLoggedIn && checkRole === ROLES.NEWS_WRITER;
  const isHelper = isLoggedIn && checkRole === ROLES.HELPER;
  const isVerifier = isLoggedIn && checkRole === ROLES.VERIFIER;
  const isAdmin = isLoggedIn && checkRole === ROLES.ADMIN;

  const hasNewsWriterPriv = isNewsWriter || isHelper || isVerifier || isAdmin;
  const hasHelperPriv = isHelper || isVerifier || isAdmin;
  const hasVerifierPriv = isVerifier || isAdmin;
  const hasAdminPriv = isAdmin;

  const hasPlayerClaimed = isLoggedIn && user.player_id !== null;
  const isPlayerWithId = (id) => hasPlayerClaimed && user.player_id === id;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isNewsWriter,
        isHelper,
        isVerifier,
        isAdmin,
        hasNewsWriterPriv,
        hasHelperPriv,
        hasVerifierPriv,
        hasAdminPriv,
        hasPlayerClaimed,
        loginWithEmail,
        loginWithDiscord,
        registerWithDiscord,
        logout,
        checkSession,
        isPlayerWithId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

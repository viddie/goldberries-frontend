import { useTranslation } from "react-i18next";

import { useAuth } from "./AuthProvider";

// Checks if the logged in account has the given restriction (an entry of RESTRICTIONS in pages/Account.jsx)
export function useRestriction(restriction) {
  const { t } = useTranslation(undefined, { keyPrefix: "restrictions" });
  const auth = useAuth();

  const restrictions = auth.user?.restrictions ?? 0;
  const isRestricted = auth.isLoggedIn && (restrictions & restriction.flag) === restriction.flag;
  const message = isRestricted ? t("notice", { reason: t("types." + restriction.key + ".label") }) : null;

  return { isRestricted, message };
}

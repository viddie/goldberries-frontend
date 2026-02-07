import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export function ErrorDisplay({ error }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components" });
  const errorMsg = getErrorMessage(error);
  return (
    <>
      <Typography variant="h4" color="error.main">
        {t("error")}
      </Typography>
      <Typography variant="body1" color="error.main">
        {errorMsg}
      </Typography>
    </>
  );
}

export function getErrorMessage(error) {
  return error.response?.data ? error.response.data.error : error.message;
}

export function getErrorFromMultiple(...queries) {
  for (let query of queries) {
    if (query.isError) {
      return query.error;
    }
  }
  return null;
}

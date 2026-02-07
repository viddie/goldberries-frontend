import { useTheme } from "@emotion/react";
import { getQueryData, useGetRecentSubmissions } from "../../hooks/useApi";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { VerificationStatusChip } from "../goldberries";
import { useTranslation } from "react-i18next";
import { RecentSubmissionsHeadless } from "./RecentSubmissionsHeadless";

export function RecentSubmissions({ playerId = null }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.recent_submissions" });
  const [verified, setVerified] = useLocalStorage("recent_submissions_verified", 1);
  const verifiedValue = verified === 0 ? null : verified === -1 ? false : true;

  const onChangeVerified = (value) => {
    setVerified(value);
  };

  return (
    <>
      <Grid container>
        <Grid item xs={12} sm>
          <Typography variant="h5">{t("title")}</Typography>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ pb: 1 }}>
            <Typography variant="body1">{t("show")}</Typography>
            <TextField
              select
              variant="standard"
              value={verified}
              onChange={(e) => onChangeVerified(e.target.value)}
              SelectProps={{
                MenuProps: {
                  disableScrollLock: true,
                },
              }}
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                border: (t) => "1px solid " + t.palette.box.border,
                borderRadius: "5px",
              }}
            >
              <MenuItem value={1}>
                <VerificationStatusChip isVerified={true} size="small" sx={{ mx: 1 }} />
              </MenuItem>
              <MenuItem value={0}>
                <VerificationStatusChip isVerified={null} size="small" sx={{ mx: 1 }} />
              </MenuItem>
              <MenuItem value={-1}>
                <VerificationStatusChip isVerified={false} size="small" sx={{ mx: 1 }} />
              </MenuItem>
            </TextField>
          </Stack>
        </Grid>
      </Grid>
      <RecentSubmissionsHeadless verified={verifiedValue} playerId={playerId} />
    </>
  );
}

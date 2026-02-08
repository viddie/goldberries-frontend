import { MenuItem, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

import { COUNTRY_CODES } from "../../util/country_codes";

import { LanguageFlag } from "./LanguageFlag";

export function CountrySelect({ value, setValue, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.country_select" });
  return (
    <TextField
      select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      fullWidth
      SelectProps={{
        MenuProps: {
          disableScrollLock: true,
        },
      }}
      {...props}
    >
      <MenuItem value="">
        <em>{t("not_specified")}</em>
      </MenuItem>
      {Object.keys(COUNTRY_CODES).map((code) => (
        <MenuItem key={code} value={code}>
          <Stack direction="row" alignItems="center">
            <LanguageFlag code={code} height="20" style={{ marginRight: "0.5rem" }} />
            {COUNTRY_CODES[code]}
          </Stack>
        </MenuItem>
      ))}
    </TextField>
  );
}

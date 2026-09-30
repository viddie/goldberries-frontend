import { Autocomplete, TextField } from "@mui/material";

import { getAccountName } from "../../util/data_util";

export function AccountSelect({ accounts, value, onChange, label, placeholder, ...props }) {
  return (
    <Autocomplete
      options={accounts}
      value={value}
      onChange={onChange}
      getOptionLabel={(account) => getAccountName(account)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={(props, account) => (
        <li {...props} key={account.id}>
          {getAccountName(account)}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={label} placeholder={placeholder} />}
      {...props}
    />
  );
}

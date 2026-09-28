import { Alert } from "@mui/material";

import { useRestriction } from "../../hooks/useRestriction";

// Shows a notice if the logged in account has the given restriction (an entry of RESTRICTIONS), otherwise nothing
export function RestrictionNotice({ restriction, sx }) {
  const { isRestricted, message } = useRestriction(restriction);
  if (!isRestricted) return null;
  return (
    <Alert severity="warning" sx={sx}>
      {message}
    </Alert>
  );
}

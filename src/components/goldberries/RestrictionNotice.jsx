import { faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { alpha, Box, Typography } from "@mui/material";

import { useRestriction } from "../../hooks/useRestriction";

// Shows a notice if the logged in account has the given restriction (an entry of RESTRICTIONS), otherwise nothing
export function RestrictionNotice({ restriction, value, sx }) {
  const { isRestricted, message } = useRestriction(restriction, value);
  if (!isRestricted) return null;
  return (
    <Box
      role="alert"
      sx={[
        {
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 2,
          borderRadius: 1,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.error.main, 0.6),
          backgroundColor: (theme) => alpha(theme.palette.error.main, 0.12),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box component="span" sx={{ color: "error.main", flexShrink: 0 }}>
        <FontAwesomeIcon icon={faBan} fixedWidth />
      </Box>
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
}

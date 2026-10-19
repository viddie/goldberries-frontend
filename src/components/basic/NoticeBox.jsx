import { alpha, Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

const DEFAULT_ICONS = {
  error: faCircleExclamation,
  warning: faTriangleExclamation,
  info: faCircleInfo,
  success: faCircleCheck,
};

// Outlined notice with a tinted background. severity: "error" | "warning" | "info" | "success"
// icon: undefined = default icon for the severity, null/false = no icon, otherwise a FontAwesome icon definition
export function NoticeBox({
  severity = "info",
  icon,
  alignItems = "center",
  children,
  sx,
}) {
  const iconDef = icon === undefined ? DEFAULT_ICONS[severity] : icon;
  return (
    <Box
      role="alert"
      sx={[
        {
          display: "flex",
          alignItems: alignItems,
          gap: 1,
          p: 2,
          borderRadius: 1,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette[severity].main, 0.6),
          backgroundColor: (theme) => alpha(theme.palette[severity].main, 0.12),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {iconDef && (
        <Box component="span" sx={{ color: severity + ".main", flexShrink: 0 }}>
          <FontAwesomeIcon icon={iconDef} fixedWidth />
        </Box>
      )}
      <Typography component="div" variant="body1" sx={{ flex: 1, minWidth: 0 }}>
        {children}
      </Typography>
    </Box>
  );
}

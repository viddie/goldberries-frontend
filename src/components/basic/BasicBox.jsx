import { Box } from "@mui/material";
import { useTheme } from "@emotion/react";

export function BasicBox({ children, sx = {}, ...props }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: {
          xs: "100%",
          sm: "fit-content",
        },
        background: theme.palette.background.other,
        borderRadius: "10px",
        p: 1,
        border: "1px solid " + theme.palette.box.border,
        boxShadow: 1,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

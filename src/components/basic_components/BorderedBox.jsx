import { Box } from "@mui/material";

export function BorderedBox({ children, sx = {}, ...props }) {
  return (
    <Box
      {...props}
      sx={{
        p: {
          xs: 2,
          sm: 3,
        },
        borderRadius: "10px",
        border: "1px solid #cccccc99",
        boxShadow: 1,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

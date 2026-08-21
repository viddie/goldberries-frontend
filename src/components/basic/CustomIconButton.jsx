import { Button } from "@mui/material";

export function CustomIconButton({ children, sx = {}, variant = "outlined", color, ...props }) {
  return (
    <Button variant={variant} color={color} sx={{ minWidth: "unset", ...sx }} {...props}>
      {children}
    </Button>
  );
}

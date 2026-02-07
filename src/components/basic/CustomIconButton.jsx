import { Button } from "@mui/material";

export function CustomIconButton({ children, sx = {}, ...props }) {
  return (
    <Button variant="outlined" sx={{ minWidth: "unset", ...sx }} {...props}>
      {children}
    </Button>
  );
}

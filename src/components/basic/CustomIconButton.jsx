import { Button } from "@mui/material";
import { forwardRef } from "react";

// Forwards its ref to the Button, so it can be used as the child of a Tooltip (which needs a DOM node as anchor)
export const CustomIconButton = forwardRef(function CustomIconButton(
  { children, sx = {}, variant = "outlined", color, ...props },
  ref,
) {
  return (
    <Button ref={ref} variant={variant} color={color} sx={{ minWidth: "unset", ...sx }} {...props}>
      {children}
    </Button>
  );
});

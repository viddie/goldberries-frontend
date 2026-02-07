import { useTheme } from "@emotion/react";
import { Link } from "react-router-dom";

export function StyledLink({ to, children, underline = false, style, ...props }) {
  const theme = useTheme();
  return (
    <Link to={to} style={{ color: theme.palette.links.main, ...style }} {...props} className="styled-link">
      {children}
    </Link>
  );
}

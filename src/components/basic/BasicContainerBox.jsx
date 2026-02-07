import { Box, Container } from "@mui/material";

export function BasicContainerBox({
  maxWidth = "sm",
  children,
  sx = {},
  containerSx = {},
  ignoreNewMargins = false,
  ...props
}) {
  const newMargins = ignoreNewMargins
    ? {}
    : {
        mx: {
          xs: 0.5,
          sm: "auto",
        },
        width: {
          xs: "unset",
          sm: "unset",
        },
      };
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        "&&": {
          px: 0,
          ...newMargins,
          ...containerSx,
        },
      }}
    >
      <Box
        {...props}
        sx={{
          p: {
            xs: 2,
            sm: 5,
          },
          pt: {
            xs: 1,
            sm: 3,
          },
          pb: {
            xs: 1,
            sm: 3,
          },
          mt: {
            xs: 0,
            sm: 1,
          },
          borderRadius: {
            xs: "10px",
            sm: "10px",
          },
          border: "1px solid #cccccc99",
          boxShadow: 1,
          ...sx,
        }}
      >
        {children}
      </Box>
    </Container>
  );
}

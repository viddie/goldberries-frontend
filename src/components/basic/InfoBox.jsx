import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";

export function InfoBox({ children }) {
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 1,
        bgcolor: (t) => t.palette.infoBox,
      }}
    >
      <Stack direction="column" gap={0.25}>
        {children}
      </Stack>
    </Box>
  );
}

export function InfoBoxIconTextLine({ icon, text, color, isSecondary = false, isMultiline = false }) {
  const theme = useTheme();
  let textColor = isSecondary ? theme.palette.text.secondary : theme.palette.text.primary;
  textColor = color ? color : textColor;
  return (
    <Stack direction="row" gap={1} alignItems="center">
      {icon}
      <Typography
        variant="body1"
        color={textColor}
        fontWeight={isSecondary ? "normal" : "bold"}
        sx={{ width: "100%", wordBreak: "break-word", whiteSpace: isMultiline ? "pre-line" : "unset" }}
      >
        {text}
      </Typography>
    </Stack>
  );
}

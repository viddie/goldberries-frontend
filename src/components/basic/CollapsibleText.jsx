import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const DEFAULT_MAX_HEIGHT = 80;

export function CollapsibleText({ text, label, maxHeight = DEFAULT_MAX_HEIGHT }) {
  const { t } = useTranslation(undefined, { keyPrefix: "general" });
  const contentRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasContent = text && text.trim().length > 0;

  const checkOverflow = useCallback(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > maxHeight);
    }
  }, [maxHeight]);

  useEffect(() => {
    checkOverflow();
  }, [text, checkOverflow]);

  if (!hasContent) return null;

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <Box
        ref={contentRef}
        sx={{
          maxHeight: !isExpanded ? maxHeight : "none",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <Typography variant="body2" component="div">
          {text}
        </Typography>
      </Box>
      {isOverflowing && (
        <Typography
          variant="body2"
          color="primary"
          onClick={() => setIsExpanded((prev) => !prev)}
          textAlign="center"
          sx={{
            cursor: "pointer",
            mt: 0.5,
            fontWeight: "bold",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {isExpanded ? t("show_less") : t("show_all")}
        </Typography>
      )}
    </Box>
  );
}

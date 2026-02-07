import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function CopyToClipboardButton({ text, variant = "outlined", ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.copy_to_clipboard_button" });
  const { t: t_sb } = useTranslation(undefined, { keyPrefix: "components.share_button" });
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 5000);
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      color={copied ? "success" : "primary"}
      startIcon={<FontAwesomeIcon icon={copied ? faCheck : faCopy} />}
      {...props}
    >
      {copied ? t_sb("copied") : t("copy")}
    </Button>
  );
}

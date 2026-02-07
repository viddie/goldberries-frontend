import { Button } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function ShareButton({ text, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.share_button" });
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <Button onClick={handleClick} variant="outlined" color={copied ? "success" : "primary"} {...props}>
      {t(copied ? "copied" : "copy_link")}
    </Button>
  );
}

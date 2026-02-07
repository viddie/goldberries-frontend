import { useTheme } from "@emotion/react";
import { Dialog, DialogContent, DialogContentText, Stack } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const SafeExternalDomains = [
  "https://www.youtube.com",
  "https://youtu.be",
  "https://discord.com",
  "https://discord.gg",
  "https://www.twitch.tv",
  "https://bilibili.com",
  "https://www.bilibili.com",
  "https://github.com",
  "https://archive.org",
  "https://gamebanana.com",
  "https://docs.google.com",
  "https://www.google.com",
  "https://goldberries.net", //lmao
  "/", //lmao again
  "everest:https://gamebanana.com",
];

export function StyledExternalLink({
  href,
  children,
  underline = true,
  target = "_blank",
  style,
  isSafe = false,
  ...props
}) {
  const theme = useTheme();

  //url has to start with one of the safe domains
  const isSafeLink = SafeExternalDomains.some((domain) => href.startsWith(domain)) || href.startsWith("#");
  const [openModal, setOpenModal] = useState(false);

  if (!isSafeLink && !isSafe) {
    const onCloseModal = () => {
      setOpenModal(false);
    };
    return (
      <>
        <a
          href={href}
          style={{ color: theme.palette.links.main, ...style }}
          onClick={(e) => {
            e.preventDefault();
            setOpenModal(true);
          }}
          {...props}
          className="styled-link"
        >
          {children}
        </a>
        <OpenExternalLinkModal href={href} isOpen={openModal} onClose={onCloseModal} />
      </>
    );
  }

  return (
    <a
      href={href}
      style={{ color: theme.palette.links.main, ...style }}
      {...props}
      className="styled-link"
      target={target}
      rel={target === "_blank" ? "noopener" : ""}
    >
      {children}
    </a>
  );
}

function OpenExternalLinkModal({ href, isOpen, onClose }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components" });
  return (
    <Dialog open={isOpen} onClose={onClose} disableScrollLock>
      <DialogContent dividers>
        <DialogContentText>
          <Stack direction="column" gap={1} alignItems="center">
            <span>{t("external_link.warning")}</span>
            <StyledExternalLink href={href} isSafe style={{ wordBreak: "break-all" }}>
              {href}
            </StyledExternalLink>
          </Stack>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

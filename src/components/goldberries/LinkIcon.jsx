import { faExternalLinkAlt, faLink, faQuestionCircle, faTrophy } from "@fortawesome/free-solid-svg-icons";
import {
  faDiscord,
  faTwitch,
  faYoutube,
  faSteam,
  faXTwitter,
  faGithub,
  faInstagram,
  faReddit,
  faBilibili,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import { useState } from "react";
import { useTheme } from "@emotion/react";
import { StyledExternalLink } from "../basic/StyledExternalLink";

const LINK_ICONS = {
  youtube: { icon: faYoutube, color: "red", identifier: ["youtu.be/", "youtube.com/"] },
  twitch: { icon: faTwitch, color: "purple", identifier: ["twitch.tv/"] },
  discord: { icon: faDiscord, color: "#5460ef", identifier: ["discord.gg/"] },
  twitter: {
    icon: faXTwitter,
    color: "white",
    identifier: ["twitter.com/", "x.com/"],
  },
  github: { icon: faGithub, color: "white", identifier: ["github.com/"] },
  instagram: { icon: faInstagram, color: "#ff2083", identifier: ["instagram.com/"] },
  speedrun: { icon: faTrophy, color: "#ffcf33", identifier: ["speedrun.com/"] },
  reddit: { icon: faReddit, color: "#ff4500", identifier: ["reddit.com/"] },
  bilibili: { icon: faBilibili, color: "#00a2d7", identifier: ["bilibili.com/", "b23.tv/"] },
  steam: {
    icon: faSteam,
    color: "white",
    identifier: ["steamcommunity.com/", "steampowered.com/"],
  },
};

export function LinkIcon({ url }) {
  const theme = useTheme();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const openTooltip = () => {
    setTooltipOpen(true);
  };
  const closeTooltip = () => {
    setTooltipOpen(false);
  };

  let linkIconElement = null;
  for (const [, value] of Object.entries(LINK_ICONS)) {
    if (value.identifier.some((i) => url.includes(i))) {
      linkIconElement = <FontAwesomeIcon icon={value.icon} color={value.color} />;
      break;
    }
  }

  if (linkIconElement === null) {
    linkIconElement = <FontAwesomeIcon icon={faLink} color={theme.palette.links.main} />;
  }

  return (
    <Tooltip title={url} open={tooltipOpen} onOpen={openTooltip} onClose={closeTooltip} arrow placement="top">
      <StyledExternalLink href={url} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
        {linkIconElement}
      </StyledExternalLink>
    </Tooltip>
  );
}

export function getPlatformIcon(url) {
  if (url === null) return faQuestionCircle;
  let icon = faExternalLinkAlt;
  for (const [, value] of Object.entries(LINK_ICONS)) {
    if (value.identifier.some((i) => url.includes(i))) {
      icon = value.icon;
      break;
    }
  }
  return icon;
}

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
import { useTheme } from "@emotion/react";

import { StyledExternalLink } from "../basic/StyledExternalLink";

const LINK_ICONS = {
  youtube: { name: "YouTube", icon: faYoutube, color: "red", identifier: ["youtu.be/", "youtube.com/"] },
  twitch: { name: "Twitch", icon: faTwitch, color: "#9147ff", identifier: ["twitch.tv/"] },
  discord: { name: "Discord", icon: faDiscord, color: "#5460ef", identifier: ["discord.gg/"] },
  twitter: { name: "X", icon: faXTwitter, color: "white", identifier: ["twitter.com/", "x.com/"] },
  github: { name: "GitHub", icon: faGithub, color: "white", identifier: ["github.com/"] },
  instagram: { name: "Instagram", icon: faInstagram, color: "#ff2083", identifier: ["instagram.com/"] },
  speedrun: { name: "speedrun.com", icon: faTrophy, color: "#ffcf33", identifier: ["speedrun.com/"] },
  reddit: { name: "Reddit", icon: faReddit, color: "#ff4500", identifier: ["reddit.com/"] },
  bilibili: {
    name: "Bilibili",
    icon: faBilibili,
    color: "#00a2d7",
    identifier: ["bilibili.com/", "b23.tv/"],
  },
  steam: {
    name: "Steam",
    icon: faSteam,
    color: "white",
    identifier: ["steamcommunity.com/", "steampowered.com/"],
  },
};

export function LinkIcon({ url }) {
  const theme = useTheme();

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
    <Tooltip title={url} arrow placement="top">
      <StyledExternalLink href={url}>{linkIconElement}</StyledExternalLink>
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

// Returns { name, icon, color } of the platform the url points to, or null if the platform is unknown
export function getLinkPlatform(url) {
  if (!url) return null;
  for (const value of Object.values(LINK_ICONS)) {
    if (value.identifier.some((i) => url.includes(i))) {
      return { name: value.name, icon: value.icon, color: value.color };
    }
  }
  return null;
}

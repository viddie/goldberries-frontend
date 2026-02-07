import { Typography } from "@mui/material";
import { TWITCH_EMBED_PARENT } from "../../util/constants";
import { StyledExternalLink } from "./StyledExternalLink";
import { useTranslation } from "react-i18next";

export function ProofEmbed({ url, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components" });
  if (url === undefined || url === null || url === "") {
    return (
      <div {...props}>
        <Typography color="text.secondary">No clear video attached.</Typography>
      </div>
    );
  }

  const youtubeData = parseYouTubeUrl(url);
  if (youtubeData !== null) {
    //Create embed url
    let embedUrl = `https://www.youtube.com/embed/${youtubeData.videoId}`;
    if (youtubeData.timestamp) {
      embedUrl += `?start=${youtubeData.timestamp.replace("s", "")}`;
    }

    return (
      <div {...props}>
        <div style={{ position: "relative", width: "100%", paddingBottom: "56.55%" }}>
          <iframe
            src={embedUrl}
            title="YouTube video player"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            style={{ width: "100%", height: "100%", position: "absolute", top: "0", left: "0" }}
          ></iframe>
        </div>
      </div>
    );
  } else if (url.includes("bilibili.com") && !url.includes("space.bilibili.com")) {
    let data = parseBilibiliUrl(url);
    url = `https://player.bilibili.com/player.html?bvid=${data.id}&page=${data.page}&high_quality=1&autoplay=false`;

    return (
      <div {...props}>
        <div style={{ position: "relative", width: "100%", paddingBottom: "56.55%" }}>
          <iframe
            src={url}
            title="Bilibili video player"
            allowFullScreen
            style={{ width: "100%", height: "100%", position: "absolute", top: "0", left: "0" }}
          ></iframe>
        </div>
      </div>
    );
  } else if (url.includes("twitch.tv")) {
    const { id } = parseTwitchUrl(url);
    const embedUrl = `https://player.twitch.tv/?video=${id}&parent=${TWITCH_EMBED_PARENT}`;
    return (
      <div {...props}>
        <div style={{ position: "relative", width: "100%", paddingBottom: "56.55%" }}>
          <iframe
            src={embedUrl}
            title="Twitch Video Player"
            allowFullScreen
            style={{ width: "100%", height: "100%", position: "absolute", top: "0", left: "0" }}
          ></iframe>
        </div>
      </div>
    );
  }

  return (
    <div {...props}>
      <Typography color="text.secondary">
        {t("video_embed.error")} <StyledExternalLink href={url}>{url}</StyledExternalLink>
      </Typography>
    </div>
  );
}

export function parseBilibiliUrl(link) {
  let id;

  // If it starts with 'av', it is an aid
  if (link.includes("/av")) {
    // Extract the AV id
    id = link.match(/av[0-9]+/g)[0];
  } else {
    // Extract the BV id
    id = link.match(/[bB][vV][0-9a-zA-Z]+/g)[0];
  }

  // Extract the page number, default to 1 if not found
  let pageMatch = link.match(/(\?|&)p=(\d+)/);
  let page = pageMatch ? parseInt(pageMatch[2]) : 1;

  // Return the result as an object
  return {
    id: id,
    page: page,
  };
}

export function parseTwitchUrl(url) {
  //URLs look like: https://www.twitch.tv/videos/2222820930
  const urlRegex = /^(https?:\/\/)?((www|m)\.)?(twitch\.tv)\/videos\/([^#&?]*).*/;
  const match = url.match(urlRegex);
  if (!match || !match[5]) {
    return null;
  }
  const id = match[5];
  return {
    id: id || null,
  };
}

export function parseYouTubeUrl(url) {
  const urlRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^#&?]*)(?:[?&][^#&?=]+=[^#&?]*)*/;
  const match = url.match(urlRegex);

  if (!match || !match[5]) {
    return null;
  }

  const videoId = match[5];

  try {
    const parsedUrl = new URL(url);
    const params = new URLSearchParams(parsedUrl.search);
    const timestamp = params.get("t") || null;

    return {
      videoId: videoId || null,
      timestamp: timestamp || null,
    };
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}

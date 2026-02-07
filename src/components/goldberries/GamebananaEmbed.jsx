import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getGamebananaEmbedUrl } from "../../util/data_util";
import { PlaceholderImage } from "../PlaceholderImage";

export function GamebananaEmbed({ campaign, size = "medium", ...props }) {
  const { t } = useTranslation();
  const embedUrl = getGamebananaEmbedUrl(campaign.url, size);

  if (embedUrl === null) return;

  return (
    <Link to={campaign.url} target="_blank" {...props}>
      <PlaceholderImage
        src={embedUrl}
        alt={t("components.gamebanana_embed.alt")}
        style={{ borderRadius: "5px", aspectRatio: "350 / 75", maxWidth: "350px" }}
      />
    </Link>
  );
}

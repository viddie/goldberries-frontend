import { API_BASE_URL } from "../../util/constants";
import { StyledLink } from "../basic";
import { PlaceholderImage } from "../PlaceholderImage";

const COMMON_STYLE = {
  width: "100%",
  objectPosition: "center",
  cursor: "pointer",
  borderRadius: "4px",
};

export function CampaignImageFull({
  id,
  alt,
  onClick,
  width = "100%",
  scale = 6,
  doLink = false,
  style = {},
}) {
  const imageElement = (
    <PlaceholderImage
      src={API_BASE_URL + "/embed/img/campaign_collage.php?id=" + id + "&scale=" + scale}
      alt={alt}
      loading="lazy"
      style={{
        ...COMMON_STYLE,
        width: width,
        objectFit: "contain",
        aspectRatio: "16 / 9",
        ...style,
      }}
      onClick={onClick}
    />
  );

  if (!doLink) {
    return imageElement;
  }

  return (
    <StyledLink to={"/campaign/" + id} style={{ lineHeight: "0", display: "block" }}>
      {imageElement}
    </StyledLink>
  );
}

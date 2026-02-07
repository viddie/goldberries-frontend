import { API_BASE_URL } from "../../util/constants";
import { StyledLink } from "../basic";
import { PlaceholderImage } from "../PlaceholderImage";

const COMMON_STYLE = {
  width: "100%",
  objectPosition: "center",
  cursor: "pointer",
  borderRadius: "4px",
};

export function MapImageFull({ id, alt, onClick, width = "100%", scale = 6, linkToMap = false, style = {} }) {
  const imageElement = (
    <PlaceholderImage
      src={API_BASE_URL + "/img/map/" + id + "&scale=" + scale}
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

  if (!linkToMap) {
    return imageElement;
  }

  return (
    <StyledLink to={"/map/" + id} style={{ lineHeight: "0", display: "block" }}>
      {imageElement}
    </StyledLink>
  );
}

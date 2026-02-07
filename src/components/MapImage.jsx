import { Box, Grid, Stack, Typography, useTheme } from "@mui/material";
import { CustomModal, useModal } from "../hooks/useModal";
import { API_BASE_URL } from "../util/constants";
import { StyledLink } from "./basic_components";
import { getCampaignName, getMapName, isMapSameNameAsCampaign, mapIsSide } from "../util/data_util";
import { PlaceholderImage } from "./PlaceholderImage";
import { useTranslation } from "react-i18next";

const COMMON_STYLE = {
  width: "100%",
  objectPosition: "center",
  cursor: "pointer",
  borderRadius: "4px",
};

export function MapImageBanner({ id, alt, style = {} }) {
  const modalHook = useModal(id);
  return (
    <>
      <PlaceholderImage
        src={API_BASE_URL + "/img/map/" + id + "&scale=2"}
        alt={alt}
        loading="lazy"
        style={{
          ...COMMON_STYLE,
          objectFit: "cover",
          aspectRatio: "6 / 1",
          ...style,
        }}
        onClick={() => modalHook.open(id)}
      />
      <CustomModal modalHook={modalHook} maxWidth={"lg"} options={{ hideFooter: true }}>
        <MapImageFull id={id} onClick={() => modalHook.close()} />
      </CustomModal>
    </>
  );
}

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

export function CampaignGallery({ campaign, ...props }) {
  const hasMajorSort = campaign.sort_major_name !== null;

  if (hasMajorSort) {
    return campaign.sort_major_labels.map((major, index) => (
      <CampaignGalleryMajorSort key={index} index={index} campaign={campaign} {...props} />
    ));
  }

  return <CampaignGalleryImages campaign={campaign} maps={campaign.maps} {...props} />;
}
function CampaignGalleryMajorSort({ campaign, index }) {
  const maps = campaign.maps.filter((map) => map.sort_major === index);
  const name = campaign.sort_major_labels[index];
  const color = campaign.sort_major_colors[index] || "#ffffff";

  return (
    <Stack gap={1} sx={{ mt: 1, borderLeft: "5px solid " + color, pl: 1 }}>
      <Typography variant="h5">{name}</Typography>
      <CampaignGalleryImages campaign={campaign} maps={maps} />
    </Stack>
  );
}
function CampaignGalleryImages({ campaign, maps, ...props }) {
  return (
    <Grid container spacing={1.5} {...props}>
      {maps.map((map) => (
        <CampaignGallerySingleImage key={map.id} campaign={campaign} map={map} />
      ))}
    </Grid>
  );
}
export function CampaignGallerySingleImage({ campaign, map, isSearch = false, ...props }) {
  const theme = useTheme();
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  const hasMinorSort = campaign.sort_minor_name !== null;
  const hasMajorSort = campaign.sort_major_name !== null;
  let borderColor = hasMinorSort ? campaign.sort_minor_colors[map.sort_minor] || "#ffffff" : null;
  if (isSearch && hasMajorSort) {
    // Take major sort instead
    borderColor = campaign.sort_major_colors[map.sort_major] || "#ffffff";
  }
  if (!borderColor) {
    borderColor = "#cccccc";
  }
  const mapName = getMapName(map, campaign, isSearch);

  const showCampaign = isSearch && !isMapSameNameAsCampaign(map, campaign) && !mapIsSide(map);

  return (
    <Grid item xs={6} sm={4} md={3} lg={2} key={map.id} {...props}>
      <Stack direction="column" gap={0}>
        {isSearch && (
          <Typography variant="body1" align="center" noWrap>
            <StyledLink to={"/map/" + map.id}>{mapName}</StyledLink>
          </Typography>
        )}
        <Box sx={{ border: "3px solid " + borderColor, borderRadius: "4px" }}>
          <MapImageFull id={map.id} alt={mapName} linkToMap scale={1} style={{ borderRadius: undefined }} />
        </Box>
        {!isSearch && (
          <Typography variant="caption" align="center" noWrap>
            {mapName}
          </Typography>
        )}
        {isSearch && showCampaign && (
          <Typography variant="caption" align="center">
            <StyledLink to={"/campaign/" + campaign.id}>{getCampaignName(campaign, t_g)}</StyledLink>
          </Typography>
        )}
      </Stack>
    </Grid>
  );
}

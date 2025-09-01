import { Grid, Stack, Typography } from "@mui/material";
import { CustomModal, useModal } from "../hooks/useModal";
import { API_BASE_URL } from "../util/constants";
import { StyledLink } from "./BasicComponents";
import { getMapName } from "../util/data_util";

const COMMON_STYLE = {
  width: "100%",
  objectPosition: "center",
  cursor: "pointer",
  borderRadius: "4px",
};

export function MapImageBanner({ id, style = {} }) {
  const modalHook = useModal(id);
  return (
    <>
      <img
        src={API_BASE_URL + "/img/map/" + id + "&scale=2"}
        alt="Map Image"
        loading="lazy"
        style={{
          ...COMMON_STYLE,
          height: "100px",
          objectFit: "cover",
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

export function MapImageFull({ id, onClick, width = "100%", scale = 6, linkToMap = false, style = {} }) {
  const imageElement = (
    <img
      src={API_BASE_URL + "/img/map/" + id + "&scale=" + scale}
      alt="Map Full Image"
      loading="lazy"
      style={{
        ...COMMON_STYLE,
        width: width,
        height: "auto",
        objectFit: "contain",
        ...style,
      }}
      onClick={onClick}
    />
  );

  if (!linkToMap) {
    return imageElement;
  }

  return (
    <StyledLink to={"/map/" + id} style={{ lineHeight: "0" }}>
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
function CampaignGallerySingleImage({ campaign, map }) {
  const hasMinorSort = campaign.sort_minor_name !== null;
  const minorColor = hasMinorSort ? campaign.sort_minor_colors[map.sort_minor] || "#ffffff" : null;
  return (
    <Grid item xs={6} sm={4} md={3} lg={2} key={map.id}>
      <Stack direction="column" gap={0}>
        <MapImageFull
          id={map.id}
          linkToMap
          scale={1}
          style={{
            border: minorColor ? "3px solid " + minorColor : undefined,
          }}
        />
        <Typography variant="caption" align="center" noWrap>
          {getMapName(map)}
        </Typography>
      </Stack>
    </Grid>
  );
}

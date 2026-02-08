import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  InfoBox,
  InfoBoxIconTextLine,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
  TooltipLineBreaks,
} from "../components/basic";
import {
  ChallengeFcIcon,
  DifficultyChip,
  ObjectiveIcon,
  OtherIcon,
  PlayerNotesIcon,
  ProofExternalLinkButton,
  SubmissionFcIcon,
  VerificationStatusChip,
  VerifierNotesIcon,
} from "../components/goldberries";
import {
  getCalculatedFractionalTierData,
  getChallengeCampaign,
  getChallengeNameShort,
  getChallengeSuffix,
  getGamebananaEmbedUrl,
  getMapLobbyInfo,
  getMapName,
  getPlayerNameColorStyle,
} from "../util/data_util";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBasketShopping,
  faBook,
  faCheckCircle,
  faCircleExclamation,
  faClock,
  faComment,
  faDownload,
  faEdit,
  faExclamationTriangle,
  faExternalLink,
  faFlagCheckered,
  faGauge,
  faGaugeSimpleHigh,
  faInfoCircle,
  faMapLocation,
  faPlus,
  faSignsPost,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import { CustomModal, useModal } from "../hooks/useModal";
import { useAuth } from "../hooks/AuthProvider";
import { FormChallengeWrapper } from "../components/forms/Challenge";
import {
  getQueryData,
  useGetChallenge,
  useGetMap,
  useGetModDirectDownloadLink,
  usePostMap,
} from "../hooks/useApi";
import { Changelog } from "../components/Changelog";
import { SuggestedDifficultyChart, SuggestedDifficultyTierCounts } from "../components/stats_page/Stats";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useTranslation } from "react-i18next";
import { AuthorInfoBoxLine, MapNoProgressTooltip } from "./Campaign";
import { memo, useEffect, useState } from "react";
import { jsonDateToJsDate } from "../util/util";
import { ToggleSubmissionFcButton } from "../components/ToggleSubmissionFc";
import { COLLECTIBLES, getCollectibleIcon, getCollectibleName } from "../components/forms/Map";
import { useTheme } from "@emotion/react";
import { LikeButton } from "../components/likes";
import { API_BASE_URL } from "../util/constants";
import { PlaceholderImage } from "../components/PlaceholderImage";

const displayNoneOnMobile = {
  display: {
    xs: "none",
    sm: "table-cell",
  },
};

export function PageChallenge({}) {
  const { id } = useParams();

  return (
    <BasicContainerBox
      maxWidth="md"
      sx={{
        backgroundColor: "#282828",
        border: "none",
        p: 0,
        pt: 0,
        pb: 0,
        overflow: "hidden",
      }}
    >
      <ChallengeDisplay id={parseInt(id)} />
    </BasicContainerBox>
  );
}

export function ChallengeDisplay({ id, isCompact = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "challenge" });
  const auth = useAuth();
  const query = useGetChallenge(id);

  const editChallengeModal = useModal();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const challenge = getQueryData(query);
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);
  const title = (map?.name ?? campaign.name) + " - " + getChallengeNameShort(challenge);

  const contentPadding = { px: isCompact ? { xs: 1, sm: 1.5 } : { xs: 2, sm: 3 } };

  return (
    <Box sx={{ pb: { xs: 2, sm: 3 } }}>
      <HeadTitle title={title} />

      {/* Banner image - full width, fading into background */}
      {map ? (
        <FadingMapBanner id={map.id} alt={getMapName(map, campaign, false)} />
      ) : (
        <FadingMapBanner alt={campaign.name} src={getGamebananaEmbedUrl(campaign.url, "large")} />
      )}

      {/* Breadcrumbs */}
      {/* <Box sx={{ ...contentPadding, mb: 1.5 }}>
        <GoldberriesBreadcrumbs campaign={campaign} map={map} challenge={challenge} />
      </Box> */}

      {/* Challenge details grid */}
      <Box sx={{ ...contentPadding }}>
        <ChallengeDetailsGrid map={challenge.map} challenge={challenge} />
      </Box>

      {challenge.description && (
        <Box sx={{ ...contentPadding, mt: 1.5 }}>
          <NoteDisclaimer title={t("description")} note={challenge.description} />
        </Box>
      )}

      {/* Like button + Action buttons on the same line */}
      <Box sx={{ ...contentPadding, mt: 1.5 }}>
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
          <LikeButton challengeId={challenge.id} />
          {auth.hasPlayerClaimed && (
            <Stack direction="row" alignItems="center" gap={1} sx={{ ml: { xs: 0, sm: "auto" } }}>
              {!challenge.is_rejected && (
                <Link to={"/submit/single-challenge/" + id}>
                  <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} size="small">
                    {t("buttons.submit")}
                  </Button>
                </Link>
              )}
              {auth.hasHelperPriv && (
                <Button
                  onClick={editChallengeModal.open}
                  variant="outlined"
                  size="small"
                  startIcon={<FontAwesomeIcon icon={faEdit} />}
                >
                  {t("buttons.edit")}
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Submission table */}
      <Box sx={{ ...contentPadding, mt: 2 }}>
        <ChallengeSubmissionTable challenge={challenge} />
      </Box>

      <Box sx={{ ...contentPadding }}>
        <Divider sx={{ my: 2 }}>
          <Chip label={t("difficulty_suggestions")} size="small" />
        </Divider>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SuggestedDifficultyChart challenge={challenge} />
        </div>
        <SuggestedDifficultyTierCounts challenge={challenge} sx={{ mt: 2 }} hideIfEmpty />

        <Divider sx={{ my: 2 }} />
        <Changelog type="challenge" id={id} />
      </Box>

      <CustomModal modalHook={editChallengeModal} options={{ hideFooter: true }}>
        <FormChallengeWrapper id={id} onSave={editChallengeModal.close} />
      </CustomModal>
    </Box>
  );
}

//#region Fading Map Banner
export function FadingMapBanner({ id, alt, src, href, sx }) {
  const modalHook = useModal(id);
  const imageSrc = src ?? API_BASE_URL + "/img/map/" + id + "&scale=2";
  const isClickable = !!href || !!id;

  const handleClick = () => {
    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else if (id) {
      modalHook.open(id);
    }
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "6 / 1",
          overflow: "hidden",
          cursor: isClickable ? "pointer" : "default",
          mb: 1.5,
          ...sx,
        }}
        onClick={isClickable ? handleClick : undefined}
      >
        <PlaceholderImage
          src={imageSrc}
          alt={alt}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
        {/* Gradient fade at the bottom */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            background: "linear-gradient(to bottom, transparent 0%, #282828 100%)",
            pointerEvents: "none",
          }}
        />
      </Box>
      {!href && (
        <CustomModal modalHook={modalHook} maxWidth="lg" options={{ hideFooter: true }}>
          <Box onClick={() => modalHook.close()}>
            <PlaceholderImage src={imageSrc} alt={alt} style={{ width: "100%", borderRadius: "4px" }} />
          </Box>
        </CustomModal>
      )}
    </>
  );
}
//#endregion

//#region Challenge Details Grid
function ChallengeDetailsGrid({ map, challenge }) {
  const { t } = useTranslation(undefined, { keyPrefix: "challenge" });
  const { t: t_cib } = useTranslation(undefined, { keyPrefix: "campaign.info_boxes" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const campaign = getChallengeCampaign(challenge);

  const lobbyInfo = getMapLobbyInfo(map);
  const hasLobbyInfo = lobbyInfo !== null && (lobbyInfo.major !== undefined || lobbyInfo.minor !== undefined);
  const mapHasAuthor = map !== null && map.author_gb_name !== null;

  const showMapRow = map !== null && getMapName(map, campaign) !== campaign.name;

  // Build left and right column items
  const leftItems = [];
  const rightItems = [];

  leftItems.push(
    <DetailsRow
      key="campaign"
      label={t_g("campaign", { count: 1 })}
      icon={<FontAwesomeIcon icon={faBook} fixedWidth />}
    >
      <StyledLink to={"/campaign/" + campaign.id}>{campaign.name}</StyledLink>
    </DetailsRow>,
  );

  if (showMapRow) {
    leftItems.push(
      <DetailsRow
        key="map"
        label={t_g("map", { count: 1 })}
        icon={<FontAwesomeIcon icon={faMapLocation} fixedWidth />}
      >
        <Stack direction="row" alignItems="center" gap={0.75}>
          <StyledLink to={"/map/" + map.id}>{getMapName(map, campaign)}</StyledLink>
          {!map.is_progress && <MapNoProgressTooltip />}
        </Stack>
      </DetailsRow>,
    );
  }

  leftItems.push(
    <DetailsRow
      key="challenge"
      label={t_g("challenge", { count: 1 })}
      icon={<FontAwesomeIcon icon={faFlagCheckered} fixedWidth />}
    >
      <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
        <span>{challenge.objective.name}</span>
        <ObjectiveIcon objective={challenge.objective} challenge={challenge} />
        <ChallengeFcIcon challenge={challenge} />
        {getChallengeSuffix(challenge, true) !== null && (
          <Typography variant="body2" color="text.secondary">
            [{getChallengeSuffix(challenge, true)}]
          </Typography>
        )}
      </Stack>
    </DetailsRow>,
  );

  leftItems.push(
    <DetailsRow
      key="difficulty"
      label={t_g("difficulty", { count: 1 })}
      icon={<FontAwesomeIcon icon={faGaugeSimpleHigh} fixedWidth />}
    >
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <DifficultyChip difficulty={challenge.difficulty} />
        <CalculatedFractionalTierChip challenge={challenge} />
        {challenge.reject_note && !challenge.is_rejected && (
          <TooltipLineBreaks title={challenge.reject_note}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </TooltipLineBreaks>
        )}
      </Stack>
    </DetailsRow>,
  );

  if (hasLobbyInfo) {
    rightItems.push(
      <DetailsRow
        key="lobby"
        label={t("lobby_info")}
        icon={<FontAwesomeIcon icon={faSignsPost} fixedWidth />}
      >
        <LobbyInfoSpan lobbyInfo={lobbyInfo} variant="body2" />
      </DetailsRow>,
    );
  }

  rightItems.push(
    <DetailsRow key="url" label={t_g("url")} icon={<FontAwesomeIcon icon={faExternalLink} fixedWidth />}>
      <ChallengeUrlValue campaign={campaign} map={map} />
    </DetailsRow>,
  );

  if (mapHasAuthor) {
    rightItems.push(
      <DetailsRow key="author" label={t_cib("author")} icon={<FontAwesomeIcon icon={faUser} fixedWidth />}>
        <AuthorValue author_gb_id={map.author_gb_id} author_gb_name={map.author_gb_name} />
      </DetailsRow>,
    );
  }

  if (challenge.is_rejected) {
    rightItems.push(
      <DetailsRow key="status" label={t("status")}>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <VerificationStatusChip isVerified={false} size="small" />
          <Typography variant="body2" color="text.secondary">
            {challenge.reject_note}
          </Typography>
        </Stack>
      </DetailsRow>,
    );
  }

  return <TwoColumnDetailsGrid leftItems={leftItems} rightItems={rightItems} />;
}

export function TwoColumnDetailsGrid({ leftItems, rightItems }) {
  return (
    <Grid container columnSpacing={0} rowSpacing={0}>
      <Grid item xs={12} sm sx={{ pr: { sm: 1.5 } }}>
        <DetailsGrid>{leftItems}</DetailsGrid>
      </Grid>
      <Grid item xs={12} sx={{ display: { xs: "block", sm: "none" } }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 0.5 }} />
      </Grid>
      <Grid item sx={{ display: { xs: "none", sm: "flex" }, alignItems: "stretch" }}>
        <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
      </Grid>
      <Grid item xs={12} sm sx={{ pl: { sm: 1.5 } }}>
        <DetailsGrid>{rightItems}</DetailsGrid>
      </Grid>
    </Grid>
  );
}

function DetailsGrid({ children }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        columnGap: 1,
        rowGap: 0.5,
        alignItems: "baseline",
      }}
    >
      {children}
    </Box>
  );
}

export function DetailsRow({ label, icon, children }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "subgrid",
        gridColumn: "1 / -1",
        borderRadius: 1,
        "&:not(:last-child)": {
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          alignSelf: "center",
          gap: 0.75,
          pl: 0.75,
          pr: 1.25,
          minHeight: 32,
          whiteSpace: "nowrap",
        }}
      >
        {icon ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ width: 18, textAlign: "center", fontSize: "0.8rem" }}
          >
            {icon}
          </Typography>
        ) : (
          <Box sx={{ width: 18 }} />
        )}
        <Typography variant="body2" color="text.secondary" fontWeight="bold" sx={{ fontSize: "0.85rem" }}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ py: 0.75, minHeight: 32, display: "flex", alignItems: "center" }}>
        <Typography variant="body2" component="div" sx={{ wordBreak: "break-word" }}>
          {children}
        </Typography>
      </Box>
    </Box>
  );
}

export function ChallengeUrlValue({ campaign, map }) {
  const { t: t_cib } = useTranslation(undefined, { keyPrefix: "campaign.info_boxes" });

  const getMapUrls = (campaign, map) => {
    if (campaign === null) throw new Error("Campaign is null");
    if (map === null) {
      if (campaign.url !== null) return [[campaign.url, ""]];
      return null;
    } else {
      if (map.url !== null) return map.url;
      if (campaign.url !== null) return [[campaign.url, ""]];
      return null;
    }
  };
  const mapUrls = getMapUrls(campaign, map);

  if (mapUrls === null) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t_cib("no_download")}
      </Typography>
    );
  }

  return (
    <Stack direction="column" gap={0.5}>
      {mapUrls.map((item, index) => (
        <Stack key={index} direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <MapCampaignUrlInfoBoxUrl url={item[0]} />
          {item[1] && (
            <Typography variant="body2" color="text.secondary">
              {item[1]}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

export function AuthorValue({ author_gb_id, author_gb_name }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  if (author_gb_id === null && author_gb_name === null) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t_g("unknown_author")}
      </Typography>
    );
  }

  const parsedName = author_gb_name.replace(/ and /g, ", ");
  const authors = parsedName
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const authorElements = authors.map((author) => (
    <StyledLink key={author} to={"/author/" + encodeURIComponent(author)}>
      {author}
    </StyledLink>
  ));

  const result = [];
  authorElements.forEach((element, index) => {
    result.push(element);
    if (index < authorElements.length - 2) {
      result.push(", ");
    } else if (index === authorElements.length - 2) {
      result.push(" and ");
    }
  });

  return <>{result}</>;
}
//#endregion

export function ChallengeDetailsListWrapper({ id }) {
  const query = useGetMap(id);
  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }
  const map = getQueryData(query);
  return <ChallengeDetailsList map={map} />;
}
export function ChallengeDetailsList({ map, challenge = null, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "challenge" });
  const { t: t_cib } = useTranslation(undefined, { keyPrefix: "campaign.info_boxes" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const campaign = challenge === null ? map.campaign : getChallengeCampaign(challenge);

  const lobbyInfo = getMapLobbyInfo(map);
  const hasLobbyInfo = lobbyInfo !== null && (lobbyInfo.major !== undefined || lobbyInfo.minor !== undefined);

  const mapHasAuthor = map !== null && map.author_gb_name !== null;

  return (
    <Grid container columnSpacing={1} rowSpacing={1} {...props}>
      <Grid item xs={12} sm={6} display="flex" flexDirection="column" rowGap={1}>
        <InfoBox>
          <InfoBoxIconTextLine
            icon={<FontAwesomeIcon icon={faBook} />}
            text={t_g("campaign", { count: 1 })}
          />
          <InfoBoxIconTextLine text={campaign.name} isSecondary />
        </InfoBox>
        {map !== null ? (
          <>
            {getMapName(map, campaign) === campaign.name ? null : (
              <InfoBox>
                <InfoBoxIconTextLine text={t_g("map", { count: 1 })} />
                <InfoBoxIconTextLine
                  text={
                    <Stack direction="row" alignItems="center" gap={0.75}>
                      <span>{getMapName(map, campaign)}</span>
                      {!map.is_progress && <MapNoProgressTooltip />}
                    </Stack>
                  }
                  isSecondary
                />
              </InfoBox>
            )}
            {challenge === null && <CollectiblesInfoBox map={map} collectibles={map.collectibles} />}
          </>
        ) : (
          <InfoBox>
            <InfoBoxIconTextLine text={t("is_full_game")} />
            <InfoBoxIconTextLine text={<FontAwesomeIcon icon={faCheckCircle} color="green" />} isSecondary />
          </InfoBox>
        )}
        {challenge !== null && (
          <InfoBox>
            <InfoBoxIconTextLine
              icon={<FontAwesomeIcon icon={faFlagCheckered} />}
              text={t_g("challenge", { count: 1 })}
            />
            <InfoBoxIconTextLine
              text={
                <Stack direction="row" alignItems="center" gap={0.5}>
                  {challenge.objective.name}{" "}
                  <ObjectiveIcon objective={challenge.objective} challenge={challenge} />
                  <ChallengeFcIcon challenge={challenge} />
                </Stack>
              }
              isSecondary
            />
            {getChallengeSuffix(challenge, true) !== null && (
              <InfoBoxIconTextLine text={"[" + getChallengeSuffix(challenge, true) + "]"} isSecondary />
            )}
          </InfoBox>
        )}
      </Grid>
      <Grid item xs={12} sm={6} display="flex" flexDirection="column" rowGap={1}>
        {hasLobbyInfo && (
          <InfoBox>
            <InfoBoxIconTextLine text={t("lobby_info")} />
            <InfoBoxIconTextLine text={<LobbyInfoSpan lobbyInfo={lobbyInfo} />} isSecondary />
          </InfoBox>
        )}
        {challenge !== null && (
          <>
            <InfoBox>
              <InfoBoxIconTextLine text={t_g("difficulty", { count: 1 })} />
              <InfoBoxIconTextLine
                text={
                  <Stack direction="row" alignItems="center" gap={1}>
                    <DifficultyChip difficulty={challenge.difficulty} />
                    <CalculatedFractionalTierChip challenge={challenge} />
                    {challenge.reject_note && !challenge.is_rejected && (
                      <TooltipLineBreaks title={challenge.reject_note}>
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                      </TooltipLineBreaks>
                    )}
                  </Stack>
                }
                isSecondary
              />
            </InfoBox>
          </>
        )}
        {<MapCampaignUrlInfoBox campaign={campaign} map={map} />}
        {mapHasAuthor && (
          <InfoBox>
            <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faUser} />} text={t_cib("author")} />
            <AuthorInfoBoxLine author_gb_id={map.author_gb_id} author_gb_name={map.author_gb_name} />
          </InfoBox>
        )}
        {challenge !== null && challenge.is_rejected && (
          <InfoBox>
            <InfoBoxIconTextLine text={t("status")} />
            <InfoBoxIconTextLine
              text={
                <Stack direction="row" alignItems="center" gap={1}>
                  <VerificationStatusChip isVerified={false} size="small" />
                  {challenge.reject_note}
                </Stack>
              }
              isSecondary
            />
          </InfoBox>
        )}
        {map !== null && challenge === null && <MapGoldenChangesBox map={map} />}
      </Grid>
    </Grid>
  );
}

export function MapCampaignUrlInfoBox({ campaign, map = null }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_cib } = useTranslation(undefined, { keyPrefix: "campaign.info_boxes" });

  const isCampaign = map === null;

  const getMapUrls = (campaign, map) => {
    if (campaign === null) throw new Error("Campaign is null");
    if (map === null) {
      if (campaign.url !== null) return [[campaign.url, ""]];
      return null;
    } else {
      if (map.url !== null) return map.url;
      if (campaign.url !== null) return [[campaign.url, ""]];
      return null;
    }
  };
  const mapUrls = getMapUrls(campaign, map);

  return (
    <InfoBox>
      <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faExternalLink} />} text={t_g("url")} />
      {mapUrls === null ? (
        <>
          <InfoBoxIconTextLine key={0} text={t_cib("no_download")} isSecondary />
        </>
      ) : (
        mapUrls.map((item, index) => (
          <>
            <InfoBoxIconTextLine
              key={index + "-1"}
              text={<MapCampaignUrlInfoBoxUrl url={item[0]} />}
              isSecondary
            />
            <InfoBoxIconTextLine
              key={index + "-2"}
              text={
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {item[1]}
                </Typography>
              }
              isSecondary
            />
          </>
        ))
      )}
      {isCampaign && (
        <>
          <InfoBoxIconTextLine />
          <InfoBoxIconTextLine
            text={
              <StyledLink to={"/campaign/" + campaign.id + "/top-golden-list"}>
                {t_cib("campaign_tgl")}
              </StyledLink>
            }
            isSecondary
          />
        </>
      )}
    </InfoBox>
  );
}
function MapCampaignUrlInfoBoxUrl({ url }) {
  const isMdScreen = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const modalHook = useModal();
  const { mutate: getLink } = useGetModDirectDownloadLink((data) => {
    setLink(data.download_url);
  });
  const [link, setLink] = useState(null);
  const isGamebananaUrl = url.indexOf("gamebanana.com") !== -1;

  // Use effect to fetch the link when the modal is opened
  useEffect(() => {
    if (modalHook.isVisible && isGamebananaUrl && link === null) {
      getLink(url);
    }
  }, [modalHook.isVisible]);

  return (
    <Stack direction="row" gap={0.25} alignItems="center">
      <StyledExternalLink href={url}>{isGamebananaUrl ? "GameBanana" : url}</StyledExternalLink>
      {isGamebananaUrl && isMdScreen && (
        <IconButton onClick={modalHook.open} size="small" sx={{ p: 0.5 }}>
          <FontAwesomeIcon icon={faDownload} size="2xs" fixedWidth />
        </IconButton>
      )}
      <CustomModal maxWidth="xs" modalHook={modalHook} options={{ hideFooter: true }}>
        <Stack direction="row" justifyContent="space-around">
          {!link ? (
            <Stack direction="row" alignItems="center" gap={2}>
              <Typography variant="body1">Fetching link from GameBanana</Typography>
              <Typography variant="body1">-</Typography>
              <LoadingSpinner size="small" />
            </Stack>
          ) : (
            <StyledExternalLink href={link} style={{ fontWeight: "bold", fontSize: "120%" }}>
              Download via Olympus
            </StyledExternalLink>
          )}
        </Stack>
      </CustomModal>
    </Stack>
  );
}

export function LobbyInfoSpan({ lobbyInfo, variant = "body1" }) {
  const textShadow =
    "black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px";
  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      {lobbyInfo.major && (
        <Typography variant={variant} color={lobbyInfo.major.color} sx={{ textShadow: textShadow }}>
          {lobbyInfo.major.label}
        </Typography>
      )}
      {lobbyInfo.major && lobbyInfo.minor && <FontAwesomeIcon icon={faArrowRight} fixedWidth />}
      {lobbyInfo.minor && (
        <Typography variant={variant} color={lobbyInfo.minor.color} sx={{ textShadow: textShadow }}>
          {lobbyInfo.minor.label}
        </Typography>
      )}
    </Stack>
  );
}
export function CollectiblesInfoBox({ map, collectibles }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map.info_boxes" });
  const auth = useAuth();
  const { mutate: postMap } = usePostMap();

  const objectiveToCollectible = { 1: 0, 2: 1, 9: 5 };
  const objectiveId = map?.challenges.length > 0 ? map?.challenges[0].objective_id : null;
  const collectible = objectiveToCollectible[objectiveId];
  const addDefaultCollectible = () => {
    postMap({
      ...map,
      collectibles: [[collectible + "", "", "", "", ""]],
    });
  };

  return (
    <InfoBox>
      <InfoBoxIconTextLine text={t("collectibles")} icon={<FontAwesomeIcon icon={faBasketShopping} />} />
      {collectibles === null && <InfoBoxIconTextLine text={t("no_collectibles")} isSecondary />}
      {map && collectibles === null && auth.hasHelperPriv && (
        <InfoBoxIconTextLine
          text={
            <InfoBoxIconTextLine
              text={
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  onClick={addDefaultCollectible}
                  disabled={collectible === undefined}
                >
                  Add default collectible
                </Button>
              }
              isSecondary
              isMultiline
            />
          }
          isSecondary
        />
      )}
      {collectibles &&
        collectibles.map((item, index) => {
          const collectible = COLLECTIBLES.find((c) => c.value === item[0]);
          if (!collectible) return null;
          let collectibleNote = item[2] ? item[2] : null;
          if (item[4]) {
            const append = t("meaningful_collectibles", { count: item[4] });
            collectibleNote = collectibleNote ? collectibleNote + "\n" + append : append;
          }
          return (
            <InfoBoxIconTextLine
              key={collectibles.value}
              text={
                <Stack direction="row" gap={1} alignItems="center">
                  <Stack
                    direction="row"
                    gap={1}
                    alignItems="center"
                    justifyContent="space-around"
                    sx={{ minWidth: "30px" }}
                  >
                    <OtherIcon url={getCollectibleIcon(item[0], item[1])} />
                  </Stack>
                  <Typography variant="body1">
                    {getCollectibleName(item[0], item[1]) + " x" + (item[3] ? item[3] : "1")}
                  </Typography>
                  {collectibleNote && (
                    <TooltipLineBreaks title={collectibleNote}>
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </TooltipLineBreaks>
                  )}
                </Stack>
              }
              isSecondary
            />
          );
        })}
    </InfoBox>
  );
}
function MapGoldenChangesBox({ map }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map.info_boxes.golden_changes" });
  const { settings } = useAppSettings();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const { mutate: postMap } = usePostMap();

  const setNoChanges = () => {
    postMap({
      ...map,
      golden_changes: null,
    });
  };

  const showChanges = open || settings.general.alwaysShowGoldenChanges;

  return (
    <InfoBox>
      <InfoBoxIconTextLine text={t("label")} />
      {showChanges ? (
        <InfoBoxIconTextLine text={map.golden_changes ?? t("no_changes")} isSecondary isMultiline />
      ) : (
        <InfoBoxIconTextLine
          text={
            <Button variant="outlined" size="small" onClick={() => setOpen(true)}>
              {t("show")}
            </Button>
          }
          isSecondary
          isMultiline
        />
      )}
      {auth.hasHelperPriv && map.golden_changes === "Unknown" && (
        <InfoBoxIconTextLine
          text={
            <Button variant="outlined" color="warning" size="small" onClick={setNoChanges}>
              Set to "No changes"
            </Button>
          }
          isSecondary
          isMultiline
        />
      )}
    </InfoBox>
  );
}

export function ChallengeSubmissionTable({ challenge, compact = false, onlyShowFirstFew = false, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "challenge.submission_table" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_fs } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  const auth = useAuth();

  const [showAll, setShowAll] = useState(false);

  const allSubmissionsLength = challenge.submissions.length;
  const showsTooMany = allSubmissionsLength > 20;
  const submissions =
    showsTooMany && !showAll && onlyShowFirstFew ? challenge.submissions.slice(0, 15) : challenge.submissions;

  return (
    <TableContainer component={Paper} {...props}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={1} sx={displayNoneOnMobile}></TableCell>
            <TableCell width={compact ? 1 : undefined} sx={{ pl: 1.5, pr: 0.5 }}>
              {t_g("player", { count: 1 })}
            </TableCell>
            {!compact && auth.hasHelperPriv && (
              <TableCell width={1} sx={{ ...displayNoneOnMobile, px: 0 }}></TableCell>
            )}
            {!compact && (
              <TableCell width={1} align="center" sx={{ pl: 1.5, pr: 0.5 }}>
                <Tooltip arrow placement="top" title={t_fs("verifier_notes")}>
                  <FontAwesomeIcon icon={faCircleExclamation} />
                </Tooltip>
              </TableCell>
            )}
            {!compact && (
              <TableCell width={1} align="center" sx={{ pl: 1.5, pr: 0.5 }}>
                <Tooltip arrow placement="top" title={t_fs("player_notes")}>
                  <FontAwesomeIcon icon={faComment} />
                </Tooltip>
              </TableCell>
            )}
            {!compact && (
              <TableCell width={1} align="center" sx={{ pl: 1.5, pr: 0.5, ...displayNoneOnMobile }}>
                <FontAwesomeIcon icon={faClock} />
              </TableCell>
            )}
            <TableCell width={1} align="center" sx={{ pl: 0.75, pr: 0.25 }}>
              <FontAwesomeIcon icon={faYoutube} />
            </TableCell>
            {!compact && (
              <TableCell
                width={1}
                align="center"
                sx={{
                  whiteSpace: {
                    xs: "normal",
                    sm: "nowrap",
                  },
                  pl: 1.5,
                  pr: 1,
                }}
              >
                {t("suggestion")}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((submission, index) => (
            <MemoChallengeSubmissionRow
              key={submission.id}
              submission={submission}
              index={index}
              compact={compact}
            />
          ))}
          {showsTooMany && onlyShowFirstFew && (
            <TableRow>
              <TableCell colSpan={99}>
                <Button variant="outlined" fullWidth onClick={() => setShowAll(!showAll)}>
                  {showAll ? t("show_less") : t("show_all", { count: allSubmissionsLength })}
                </Button>
              </TableCell>
            </TableRow>
          )}
          {allSubmissionsLength.length === 0 && (
            <TableRow>
              <TableCell colSpan={99}>{t("empty")}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function ChallengeSubmissionRow({ submission, index, compact }) {
  const auth = useAuth();
  const { settings } = useAppSettings();
  const theme = useTheme();
  const nameStyle = getPlayerNameColorStyle(submission.player, settings);
  const linkStyle = {
    display: "block",
    textDecoration: "none",
    color: "inherit",
    padding: "5px 4px 5px 12px",
  };

  return (
    <TableRow
      sx={{
        "&:hover": { backgroundColor: theme.palette.background.lightShade, cursor: "pointer" },
        transition: "0.1s background",
      }}
    >
      <TableCell width={1} sx={{ pr: 0, ...displayNoneOnMobile, p: 0 }}>
        <Link to={"/submission/" + submission.id} style={linkStyle}>
          #{index + 1}
        </Link>
      </TableCell>
      <TableCell width={compact ? 1 : undefined} sx={{ p: 0 }}>
        <Link to={"/submission/" + submission.id} style={linkStyle}>
          <Stack direction="row" gap={1} alignItems="center">
            <StyledLink
              to={"/player/" + submission.player.id}
              style={{
                whiteSpace: "nowrap",
                maxWidth: "150px",
                overflow: "hidden",
                ...nameStyle,
              }}
            >
              {submission.player.name}
            </StyledLink>
            <SubmissionFcIcon submission={submission} height="1.3em" />
          </Stack>
        </Link>
      </TableCell>
      {!compact && auth.hasHelperPriv && (
        <TableCell width={1} align="center" sx={{ ...displayNoneOnMobile, p: 0 }}>
          <ToggleSubmissionFcButton submission={submission} />
        </TableCell>
      )}
      {!compact && (
        <TableCell width={1} align="center" sx={{ p: 0 }}>
          <Link
            to={"/submission/" + submission.id}
            style={{ ...linkStyle, height: "34px", display: "flex", alignItems: "center" }}
          >
            {submission.verifier_notes && <VerifierNotesIcon notes={submission.verifier_notes} />}
          </Link>
        </TableCell>
      )}
      {!compact && (
        <TableCell width={1} align="center" sx={{ p: 0 }}>
          <Link
            to={"/submission/" + submission.id}
            style={{ ...linkStyle, height: "34px", display: "flex", alignItems: "center" }}
          >
            {submission.player_notes && <PlayerNotesIcon notes={submission.player_notes} />}
          </Link>
        </TableCell>
      )}
      {!compact && (
        <TableCell width={1} align="center" sx={{ p: 0, ...displayNoneOnMobile }}>
          <Link to={"/submission/" + submission.id} style={linkStyle}>
            {submission.date_achieved &&
              jsonDateToJsDate(submission.date_achieved).toLocaleDateString(navigator.language, {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
              })}
          </Link>
        </TableCell>
      )}
      <TableCell width={1} align="center" sx={{ pl: 0.75, pr: 0.25 }}>
        <ProofExternalLinkButton url={submission.proof_url} />
      </TableCell>
      {compact ? null : (
        <TableCell width={1} align="center" sx={{ p: 0 }}>
          <Link to={"/submission/" + submission.id} style={linkStyle}>
            <DifficultyChip
              difficulty={submission.suggested_difficulty}
              isPersonal={submission.is_personal}
              frac={submission.frac ?? 50}
            />
          </Link>
        </TableCell>
      )}
    </TableRow>
  );
}
const MemoChallengeSubmissionRow = memo(ChallengeSubmissionRow);

export function NoteDisclaimer({ title, note, sx = {} }) {
  return (
    <Alert severity="info" variant="outlined" sx={sx}>
      <AlertTitle>{title}</AlertTitle>
      {note}
    </Alert>
  );
}

/**
 * Displays the calculated fractional tier for a challenge as a DifficultyChip
 * wrapped in parentheses with a tooltip explaining its meaning.
 * Only renders if the user has fractional tiers enabled in settings and
 * if valid fractional tier data can be calculated from submissions.
 */
export function CalculatedFractionalTierChip({ challenge }) {
  const { t } = useTranslation(undefined, { keyPrefix: "challenge" });
  const { settings } = useAppSettings();

  if (!settings.general.showFractionalTiers) return null;

  const fracData = getCalculatedFractionalTierData(challenge);
  if (!fracData) return null;

  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      <span style={{ opacity: "0.33" }}>(</span>
      <Tooltip title={t("calculated_tier_tooltip")} arrow placement="top">
        <span>
          <DifficultyChip
            difficulty={fracData.difficulty}
            frac={fracData.frac}
            sx={{ opacity: "0.33" }}
            noTier
          />
        </span>
      </Tooltip>
      <span style={{ opacity: "0.33" }}>)</span>
    </Stack>
  );
}

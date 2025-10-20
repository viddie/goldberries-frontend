import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { sortChallengesForTGL, TglModalContainer } from "../components/TopGoldenList";
import { Link, useParams } from "react-router-dom";
import {
  BasicBox,
  BorderedBox,
  CustomIconButton,
  ErrorDisplay,
  getErrorFromMultiple,
  HeadTitle,
  LoadingSpinner,
  parseYouTubeUrl,
} from "../components/BasicComponents";
import {
  CampaignIcon,
  ChallengeFcIcon,
  ObjectiveIcon,
  SubmissionFcIcon,
} from "../components/GoldberriesComponents";
import { useTranslation } from "react-i18next";
import { SubmissionFilter, getDefaultFilter } from "../components/SubmissionFilter";
import { useLocalStorage } from "@uidotdev/usehooks";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import { getQueryData, useGetTopGoldenList } from "../hooks/useApi";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faFileExport, faUsers } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@emotion/react";
import {
  getCampaignName,
  getChallengeFcShort,
  getChallengeName,
  getChallengeNameClean,
  getChallengeSuffix,
  getDifficultyName,
  getMapName,
  secondsToDuration,
} from "../util/data_util";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useCallback, useEffect, useRef } from "react";
import { API_BASE_URL, getNewDifficultyColors } from "../util/constants";
import { CampaignImageFull, MapImageFull } from "../components/MapImage";
import Color from "color";
import { TimelineSubmissionPreviewImage } from "./Player";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { useAuth } from "../hooks/AuthProvider";

const boxBorderWidth = "3px";

export function PageTopGoldenListAlt({ defaultType = null, defaultId = null }) {
  const { t } = useTranslation(undefined, { keyPrefix: "top_golden_list" });
  const theme = useTheme();

  const { type, id } = useParams();
  const actualType = type || defaultType;
  const actualId = id || defaultId;

  const defaultFilter = getDefaultFilter(true);
  const filterKeySuffix = actualType === "player" ? "_player" : actualType === "campaign" ? "_campaign" : "";
  const [filter, setFilter] = useLocalStorage("top_golden_list_filter" + filterKeySuffix, defaultFilter);

  // Set horizontal overflow only for this page
  useEffect(() => {
    document.body.parentElement.style.overflowX = "auto";
    return () => {
      document.body.parentElement.style.overflowX = "hidden";
    };
  }, []);

  // REFS
  const modalRefs = {
    map: {
      show: useRef(),
    },
    challenge: {
      edit: useRef(),
    },
    submission: {
      edit: useRef(),
    },
  };
  const showMap = useCallback((id, challengeId, isCampaign) => {
    const data = {
      id: isCampaign ? challengeId : id,
      challengeId: challengeId,
      isCampaign: isCampaign,
    };
    modalRefs.map.show.current.open(data);
  });
  const openEditChallenge = useCallback((id) => {
    modalRefs.challenge.edit.current.open({ id });
  });
  const openEditSubmission = useCallback((id) => {
    modalRefs.submission.edit.current.open({ id });
  });
  // =======================

  const title = t("title");

  return (
    <Box
      sx={{
        mx: {
          xs: 1,
          sm: 1,
        },
      }}
    >
      <HeadTitle title={title} />
      <Stack direction="column" gap={1} sx={{ mb: 1 }}>
        <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 0 }}>
          {/* <BorderedBox sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ mr: 1 }}>
              {title}
            </Typography>
          </BorderedBox> */}
          <SubmissionFilter
            type={actualType}
            id={actualId}
            filter={filter}
            setFilter={setFilter}
            defaultFilter={defaultFilter}
          />
        </Stack>
        <TopGoldenList
          type={actualType}
          id={actualId}
          filter={filter}
          isOverallList
          showMap={showMap}
          editSubmission={openEditSubmission}
        />
      </Stack>

      <TglModalContainer modalRefs={modalRefs} />
    </Box>
  );
}

function TopGoldenList({ type, id, filter, isOverallList, showMap, editSubmission }) {
  const { settings } = useAppSettings();
  const query = useGetTopGoldenList(type, id, filter);
  const data = getQueryData(query);

  if (query.isLoading) {
    return <LoadingSpinner sx={{ mt: 1 }} />;
  } else if (query.isError) {
    return <ErrorDisplay error={getErrorFromMultiple(query)} sx={{ mt: 1 }} />;
  }

  const { tiers, challenges, maps, campaigns } = data;

  const challengesByTier = {};
  for (const tier of tiers) {
    challengesByTier[tier.id] = [];
  }
  for (const challenge of challenges) {
    const diffId = challenge.difficulty_id;
    if (challengesByTier[diffId]) {
      challengesByTier[diffId].push(challenge);
    }
  }

  // Sort challenges through the function used in the original TGL
  for (const tierId in challengesByTier) {
    challengesByTier[tierId] = sortChallengesForTGL(
      challengesByTier[tierId],
      maps,
      campaigns,
      settings.visual.topGoldenList.sortByFractionalTiers,
      type === "player"
    );
  }

  const hideEmptyTiers = settings.visual.topGoldenList.hideEmptyTiers;
  const compactMode = settings.visual.topGoldenList.compactMode;

  return (
    <Stack direction={{ xs: "column", sm: "row" }} gap={{ xs: 1, sm: 2 }}>
      {tiers.map((tier) => {
        const tierChallenges = challengesByTier[tier.id] || [];
        const tierColors = getNewDifficultyColors(settings, tier.id);
        if (hideEmptyTiers && tierChallenges.length === 0) {
          return null;
        }

        return (
          <Stack direction="column" gap={1} key={tier.id} alignItems="flex-start">
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              alignSelf="stretch"
              // sx={{ position: "sticky", top: 50, zIndex: 9999 }}
            >
              <TierInfoBox tier={tier} />
              <Divider
                sx={{
                  flexGrow: 1,
                  height: boxBorderWidth,
                  backgroundColor: new Color(tierColors.color).alpha(0.5).string(),
                }}
              />
            </Stack>
            <Stack direction="column" gap={compactMode ? 0.25 : 1} width="100%">
              {tierChallenges.map((challenge) => {
                const map = maps[challenge.map_id];
                const campaign = campaigns[map ? map.campaign_id : challenge.campaign_id];
                return (
                  <ChallengeInfoBox
                    key={challenge.id}
                    type={type}
                    tier={tier}
                    challenge={challenge}
                    map={map}
                    campaign={campaign}
                    showMap={showMap}
                    editSubmission={editSubmission}
                  />
                );
              })}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}

function TierInfoBox({ tier }) {
  const { settings } = useAppSettings();
  const colors = getNewDifficultyColors(settings, tier.id);
  return (
    <Typography
      variant="h6"
      sx={{
        py: 0.5,
        px: 2,
        border: `${boxBorderWidth} solid ${colors.color}`,
        borderRadius: "4px",
        backgroundColor: new Color(colors.color).alpha(0.3).string(),
        fontWeight: "bold",
        cursor: "default",
        whiteSpace: "nowrap",
      }}
    >
      {tier.name}
    </Typography>
  );
}

function ChallengeInfoBox({ type, tier, challenge, map, campaign, showMap, editSubmission }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const auth = useAuth();
  const theme = useTheme();
  const { settings } = useAppSettings();
  const darkmode = theme.palette.mode === "dark";
  const colors = getNewDifficultyColors(settings, tier.id);
  const compactMode = settings.visual.topGoldenList.compactMode;

  const challengeLabel = getChallengeName(challenge, false);
  const challengeSuffix = getChallengeSuffix(challenge);
  const name = map ? getMapName(map, campaign) : getCampaignName(campaign, t_g, true);

  const firstSubmission = challenge.submissions[0];
  const isPlayer = type === "player";
  const isPersonal = isPlayer && firstSubmission.is_personal;

  let diff = challenge.difficulty;
  if (isPlayer && firstSubmission.suggested_difficulty) diff = firstSubmission.suggested_difficulty;
  const challengeFrac = challenge.data.frac ? challenge.data.frac : 0.5;
  const diffNumber = diff.sort + (isPlayer ? (firstSubmission.frac ?? 50) / 100 : challengeFrac);
  let diffNumberColor = theme.palette.text.secondary;
  if (isPersonal) diffNumberColor = new Color(diffNumberColor).mix(new Color("red"), 0.5).string();
  const isUnset = !isPlayer || firstSubmission.suggested_difficulty === null;

  const hasGrindTime = isPlayer && firstSubmission.time_taken !== null;
  const grindTime = isPlayer && hasGrindTime && secondsToDuration(firstSubmission.time_taken);
  const hideGrindTime = isPlayer && settings.visual.topGoldenList.hideTimeTaken;
  const columnWidth = hideGrindTime || !isPlayer ? 6 : 4;

  const hideImage = settings.visual.topGoldenList.hideImages;
  const handleClick = (e) => {
    if (!isPlayer) {
      showMap(map?.id, challenge.id, !map);
    } else {
      if (e.altKey && (auth.hasHelperPriv || auth.isPlayerWithId(firstSubmission.player_id))) {
        editSubmission(firstSubmission.id);
        e.preventDefault();
      }
    }
  };

  //#region Common style objects
  const boxBaseStyles = {
    borderWidth: boxBorderWidth,
    borderStyle: "solid",
    borderRadius: "4px",
    borderColor: new Color(colors.color).alpha(0.6).string(),
    backgroundColor: darkmode ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.3)",
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      borderColor: new Color(colors.color).alpha(1).string(),
      backgroundColor: darkmode ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.6)",
    },
  };

  const textEllipsisStyles = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const campaignIconProps = {
    campaign: campaign,
    height: "0.85rem",
  };

  const fcIconStyle = {
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
  };

  const difficultyNumberProps = { difficulty: diff, diffNumber, isPersonal, isUnset, isPlayer };
  //#endregion

  // Layout: single line with map name, challenge label (if exists), FC icon, difficulty
  let element = null;
  if (compactMode) {
    element = (
      <Box sx={{ ...boxBaseStyles, px: 1.5, py: 0.75 }} onClick={() => showMap(map?.id, challenge.id, !map)}>
        <Stack direction="row" gap={1} alignItems="center">
          <CampaignIcon {...campaignIconProps} />
          <Typography
            variant="body2"
            sx={{
              ...textEllipsisStyles,
              fontWeight: "bold",
              maxWidth: "180px",
              flexShrink: 1,
            }}
          >
            {name}
          </Typography>
          {challengeSuffix && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                ...textEllipsisStyles,
                maxWidth: "120px",
                flexShrink: 1,
              }}
            >
              [{challengeSuffix}]
            </Typography>
          )}
          <ChallengeFcIcon challenge={challenge} style={fcIconStyle} allowTextIcons showClear={false} />
          <Box sx={{ flexGrow: 1 }} />
          {isPlayer && !hideGrindTime && hasGrindTime && <GrindTimeLabel timeTaken={grindTime} isCompact />}
          <DifficultyNumber {...difficultyNumberProps} />
          {!isPlayer && <ClearCountLabel number={challenge.data.submission_count} isCompact />}
        </Stack>
      </Box>
    );
  } else {
    // Standard layout (original)
    element = (
      <Box sx={{ ...boxBaseStyles, p: 1.5 }} onClick={handleClick}>
        <Stack direction="row" gap={2}>
          {!hideImage && (
            <ChallengePreviewImageLink
              challenge={challenge}
              map={map}
              campaign={campaign}
              width="122px"
              style={{ flexShrink: "0" }}
            />
          )}
          <Stack direction="column" gap={0} sx={{ width: { xs: "100%", sm: "200px" }, minWidth: 0 }}>
            <Stack direction="row" gap={0.5} alignItems="center">
              <CampaignIcon {...campaignIconProps} style={{ marginRight: "2px" }} />
              <Typography
                variant="body1"
                sx={{
                  ...textEllipsisStyles,
                  fontWeight: "bold",
                  fontSize: "0.98rem",
                }}
              >
                {name}
              </Typography>
            </Stack>
            <Stack direction="row" gap={0.5} alignItems="center">
              <ObjectiveIcon
                objective={challenge.objective}
                challenge={challenge}
                style={{ fontSize: ".85rem" }}
              />
              <Typography variant="caption" color="text.secondary" sx={textEllipsisStyles}>
                {challengeLabel}
              </Typography>
              <ChallengeFcIcon
                challenge={challenge}
                style={{ ...fcIconStyle, marginLeft: "2px" }}
                allowTextIcons
                showClear
              />
            </Stack>
            <Grid container columnSpacing={1} sx={{ mt: "auto" }}>
              {isPlayer && (
                <Grid item xs={columnWidth} display="flex" alignItems="center" justifyContent="flex-start">
                  <SubmissionFcIcon
                    submission={firstSubmission}
                    allowTextIcons
                    style={{ fontSize: "1.0rem" }}
                  />
                </Grid>
              )}
              {(!isPlayer || !hideGrindTime) && (
                <Grid item xs={columnWidth} display="flex" alignItems="flex-end" justifyContent="center">
                  {!isPlayer && <ClearCountLabel number={challenge.data.submission_count} />}
                  {isPlayer && hasGrindTime && <GrindTimeLabel timeTaken={grindTime} isCompact />}
                </Grid>
              )}
              <Grid item xs={columnWidth} display="flex" alignItems="flex-end" justifyContent="flex-end">
                <DifficultyNumber {...difficultyNumberProps} />
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </Box>
    );
  }

  if (!isPlayer) {
    return element;
  }

  return (
    <a
      href={"/submission/" + firstSubmission.id}
      target="_blank"
      style={{ textDecoration: "none", color: "inherit", lineHeight: "0" }}
    >
      {element}
    </a>
  );
}

function GrindTimeLabel({ timeTaken, isCompact = false }) {
  const durationStr = secondsToDuration(timeTaken);

  if (isCompact) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
        {durationStr}
      </Typography>
    );
  }

  return (
    <Typography variant="caption" color="text.secondary" fontWeight="bold">
      {durationStr}
    </Typography>
  );
}

function ClearCountLabel({ number, isCompact = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.top_golden_list" });
  const theme = useTheme();

  if (isCompact) {
    return (
      <Stack direction="row" gap={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: "1.5em", textAlign: "right" }}>
          {number}
        </Typography>
        <FontAwesomeIcon
          icon={faUsers}
          style={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}
        />
      </Stack>
    );
  }

  return (
    <Stack direction="row" gap={0.5} sx={{ width: "100%", height: "100%" }}>
      <Typography
        variant="body1"
        color="text.primary"
        fontWeight="bold"
        fontSize="1.05em"
        alignSelf="baseline"
      >
        {number}
      </Typography>
      <Typography variant="caption" color="text.secondary" alignSelf="baseline">
        {t("clear", { count: number })}
      </Typography>
    </Stack>
  );
}

export function ChallengePreviewImageLink({
  challenge,
  map,
  campaign,
  width = "150px",
  scale = 1,
  style = {},
  imageStyle = {},
}) {
  const { settings } = useAppSettings();
  const url = challenge.submissions[0].proof_url; //Has to exist
  let embedUrl = null;

  // If it's a youtube video, use the thumbnail
  // Otherwise, use the map image
  // For campaign challenges, use the campaign image instead

  const youtubeData = parseYouTubeUrl(url);
  if (youtubeData !== null && !settings.visual.topGoldenList.preferMapImages) {
    embedUrl = "https://img.youtube.com/vi/" + youtubeData.videoId + "/mqdefault.jpg";
  } else if (map) {
    embedUrl = API_BASE_URL + "/img/map/" + map.id + "&scale=" + scale;
  } else if (campaign) {
    embedUrl = API_BASE_URL + "/embed/img/campaign_collage.php?id=" + campaign.id + "&scale=" + scale;
  }

  return (
    <a
      class="video-link"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{ lineHeight: "0", ...style }}
    >
      <PlaceholderImage
        src={embedUrl}
        className="image-wrapper"
        lazy
        style={{ width: width ?? undefined, borderRadius: "5px", aspectRatio: "16 / 9", ...imageStyle }}
      />
      <div class="overlay">
        <div class="play-button">▶</div>
      </div>
    </a>
  );
}

function DifficultyNumber({ difficulty, diffNumber, isPersonal = false, isUnset = false, isPlayer = false }) {
  const { settings } = useAppSettings();
  const theme = useTheme();
  const colors = getNewDifficultyColors(settings, difficulty.id);
  let diffNumberStr = difficulty.sort === -1 ? "-" : diffNumber.toFixed(2);
  let diffNumberColor = theme.palette.text.primary;
  if (isPersonal) diffNumberColor = new Color(diffNumberColor).mix(new Color("red"), 0.6).string();
  if (isUnset && isPlayer) diffNumberColor = "transparent";

  let beforeStyle = {};
  if (isPlayer) {
    beforeStyle = {
      content: '""',
      position: "absolute",
      top: "-1px",
      left: "-4px",
      right: "-4px",
      bottom: "-1px",
      border: "1px solid " + colors.color,
      borderRadius: "3px",
      background: new Color(colors.color).alpha(0.1).string(),
      pointerEvents: "none",
    };
  }

  return (
    // <Box>
    <Typography
      variant="caption"
      color={diffNumberColor}
      sx={{
        position: "relative",
        "&::before": beforeStyle,
      }}
    >
      {diffNumberStr}
    </Typography>
    // </Box>
  );
}

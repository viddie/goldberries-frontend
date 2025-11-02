import { Box, Divider, Grid, IconButton, Stack, Typography } from "@mui/material";
import { TglModalContainer } from "../components/TopGoldenList";
import { Link, useParams } from "react-router-dom";
import {
  BorderedBox,
  ErrorDisplay,
  getErrorFromMultiple,
  HeadTitle,
  LoadingSpinner,
  parseYouTubeUrl,
  TooltipLineBreaks,
} from "../components/BasicComponents";
import {
  CampaignIcon,
  ChallengeFcIcon,
  ObjectiveIcon,
  ObsoleteIcon,
  PlayerNotesTooltip,
  SubmissionFcIcon,
} from "../components/GoldberriesComponents";
import { useTranslation } from "react-i18next";
import { SubmissionFilter, getDefaultFilter } from "../components/SubmissionFilter";
import { useLocalStorage } from "@uidotdev/usehooks";
import { getQueryData, useGetTopGoldenList } from "../hooks/useApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBackward,
  faChartBar,
  faComment,
  faExclamationTriangle,
  faFileExport,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@emotion/react";
import {
  getCampaignName,
  getChallengeName,
  getChallengeSuffix,
  getMapName,
  secondsToDuration,
} from "../util/data_util";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL, DIFFICULTY_STACKS, getNewDifficultyColors } from "../util/constants";
import Color from "color";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { useAuth } from "../hooks/AuthProvider";
import { useOverflowX } from "../hooks/useOverflowX";
import { getDefaultOptions, TglMoreButton } from "../components/TglDisplayOptions";
import { useModal } from "../hooks/useModal";
import { TimeTakenTiersGraphModal } from "../components/TimeTakenTiersGraph";
import { ExportTopGoldenListModal } from "./TopGoldenList";

export function getTglOptionsKey(type) {
  if (type === "player") {
    return "top_golden_list_options_player";
  } else if (type === "campaign") {
    return "top_golden_list_options_campaign";
  }
  return "top_golden_list_options";
}

export function getTglFilterKey(type) {
  if (type === "player") {
    return "top_golden_list_filter_player";
  } else if (type === "campaign") {
    return "top_golden_list_filter_campaign";
  }
  return "top_golden_list_filter";
}

export function PageTopGoldenListAlt({ defaultType = null, defaultId = null }) {
  const { t } = useTranslation(undefined, { keyPrefix: "top_golden_list" });
  const theme = useTheme();

  const { type, id } = useParams();
  const actualType = type || defaultType;
  const actualId = id || defaultId;
  const isPlayer = actualType === "player";

  const defaultFilter = getDefaultFilter(true);
  const [filter, setFilter] = useLocalStorage(getTglFilterKey(actualType), defaultFilter);
  const [options, setOptions] = useLocalStorage(getTglOptionsKey(actualType), getDefaultOptions());

  const compactMode = options.compactMode;

  useOverflowX();

  //#region REFS
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
  const exportModal = useModal();
  const statsModal = useModal();
  //#endregion

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
      <Stack direction="column" gap={compactMode ? 0.5 : 1} sx={{ mb: 1 }}>
        <BorderedBox
          sx={{
            p: 1,
            minWidth: 0,
            flexShrink: 1,
            width: "fit-content",
            borderColor: "rgba(255,255,255,0.2)",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <Grid container alignItems="center" columnSpacing={1} rowSpacing={1}>
            <Grid item xs={12} sm="auto">
              <TopGoldenListHeader type={actualType} id={actualId} />
            </Grid>
            <Grid item xs={12} sm="auto">
              <SubmissionFilter
                type={actualType}
                id={actualId}
                filter={filter}
                setFilter={setFilter}
                defaultFilter={defaultFilter}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <TglMoreButton
                type={actualType}
                id={actualId}
                options={options}
                setOptions={setOptions}
                defaultOptions={getDefaultOptions()}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <IconButton onClick={exportModal.open}>
                <FontAwesomeIcon
                  color={theme.palette.text.secondary}
                  icon={faFileExport}
                  fixedWidth
                  size="2xs"
                />
              </IconButton>
              {isPlayer && (
                <IconButton onClick={statsModal.open}>
                  <FontAwesomeIcon
                    color={theme.palette.text.secondary}
                    icon={faChartBar}
                    fixedWidth
                    size="2xs"
                  />
                </IconButton>
              )}
            </Grid>
          </Grid>
        </BorderedBox>
        <MemoTopGoldenList
          type={actualType}
          id={actualId}
          filter={filter}
          options={options}
          isOverallList
          showMap={showMap}
          editSubmission={openEditSubmission}
        />
      </Stack>

      <TglModalContainer modalRefs={modalRefs} />
      <ExportTopGoldenListModal modalHook={exportModal} type={actualType} id={actualId} filter={filter} />
      <TimeTakenTiersGraphModal modalHook={statsModal} id={actualId} filter={filter} />
    </Box>
  );
}

function TopGoldenListHeader({ type, id }) {
  const { t } = useTranslation(undefined, { keyPrefix: "top_golden_list" });
  const theme = useTheme();

  const header = t("type." + (type ? type : "overall"));
  const returnUrl = type === "player" ? "/player/" + id : type === "campaign" ? "/campaign/" + id : null;

  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      {returnUrl && (
        <Link to={returnUrl} style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <IconButton size="small">
            <FontAwesomeIcon icon={faArrowLeft} color={theme.palette.text.secondary} fixedWidth size="xs" />
          </IconButton>
        </Link>
      )}
      <Typography variant="h6" sx={{ mr: 1 }}>
        {header}
      </Typography>
    </Stack>
  );
}

function TopGoldenList({ type, id, filter, options, showMap, editSubmission }) {
  const query = useGetTopGoldenList(type, id, filter);

  const key = getTglRenderKey(type, id, filter, options);
  const [renderUpTo, setRenderUpTo] = useState({ key: key, index: 0 });

  useEffect(() => {
    console.log("[TopGoldenList] ===== KEY CHANGED =====");
    if (key !== renderUpTo.key) {
      console.log("[TopGoldenList] Resetting render up to index to 0");
      setRenderUpTo({ key: key, index: 0 });
    }
  }, [key]);

  const onFinishRendering = useCallback((index) => {
    console.log(
      "[TopGoldenList] Got callback for finished rendering index ",
      index,
      ", current renderUpTo index is ",
      renderUpTo.index
    );
    if (index !== renderUpTo.index) return;
    console.log("[TopGoldenList] Scheduling render of next index");
    setTimeout(() => {
      setRenderUpTo((prev) => {
        return { key: prev.key, index: prev.index + 1 };
      });
    }, 50);
  });

  if (query.isLoading) {
    return <LoadingSpinner sx={{ mt: 1 }} />;
  } else if (query.isError) {
    return <ErrorDisplay error={getErrorFromMultiple(query)} sx={{ mt: 1 }} />;
  }

  const { tiers, challenges, maps, campaigns } = getQueryData(query);

  const stackTiers = options.stackTiers;
  const hideEmptyTiers = !options.showEmptyTiers;
  const compactMode = options.compactMode;

  // Stacked tiers: if enabled, use DIFFICULTY_STACKS (array of arrays of tier IDs) to determine the grouping.
  // If disabled, just put each tier in its own group. Then use TierStack to render each group.
  const tierGroups = [];
  if (stackTiers) {
    DIFFICULTY_STACKS.forEach((tierStack) => {
      const stackedTiers = tierStack.map((tierId) => tiers.find((t) => t.id === tierId));
      if (stackedTiers.some((t) => t !== undefined)) {
        tierGroups.push(stackedTiers.filter((t) => t !== undefined));
      }
    });
  } else {
    tiers.forEach((tier) => {
      tierGroups.push([tier]);
    });
  }

  //Filter out entirely empty tier groups if hideEmptyTiers is enabled
  const filteredTierGroups = tierGroups.filter((tierGroup) => {
    if (!hideEmptyTiers) return true;
    const hasChallenges = tierGroup.some((tier) => challenges.some((c) => c.difficulty_id === tier.id));
    return hasChallenges;
  });

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      gap={{ xs: compactMode ? 0.5 : 1, sm: compactMode ? 1 : 2 }}
    >
      {filteredTierGroups.map((tierGroup, index) => (
        <MemoTierStack
          key={renderUpTo.key + index}
          renderKey={renderUpTo.key}
          index={index}
          render={index <= renderUpTo.index}
          onFinishRendering={onFinishRendering}
          tiers={tierGroup}
          challenges={challenges}
          maps={maps}
          campaigns={campaigns}
          type={type}
          showMap={showMap}
          editSubmission={editSubmission}
          options={options}
        />
      ))}
    </Stack>
  );
}
const MemoTopGoldenList = memo(TopGoldenList, (prevProps, newProps) => {
  return (
    prevProps.type === newProps.type &&
    prevProps.id === newProps.id &&
    JSON.stringify(prevProps.filter) === JSON.stringify(newProps.filter) &&
    JSON.stringify(prevProps.options) === JSON.stringify(newProps.options)
  );
});

function TierStack({
  index,
  render,
  onFinishRendering,
  tiers,
  challenges,
  maps,
  campaigns,
  type,
  showMap,
  editSubmission,
  options,
}) {
  const isCompact = options.compactMode;

  const diffsString = tiers.map((t) => t.name).join(", ");
  console.log("Rendering tier stack with tiers: ", diffsString, " at index ", index, " and render=", render);
  useEffect(() => {
    console.log(
      "[TierStack] Finished rendering tier stack with tiers: ",
      diffsString,
      " at index ",
      index,
      " and render=",
      render
    );
    if (render) onFinishRendering(index);
  }, [render]);

  if (!render) return null;

  return (
    <Stack direction="column" gap={isCompact ? 0.5 : 1}>
      {tiers.map((tier) => (
        <TierDisplay
          key={tier.id}
          tier={tier}
          challenges={challenges}
          maps={maps}
          campaigns={campaigns}
          type={type}
          showMap={showMap}
          editSubmission={editSubmission}
          options={options}
        />
      ))}
    </Stack>
  );
}
const MemoTierStack = memo(TierStack, (prevProps, newProps) => {
  if (prevProps.index === 0) {
    console.log("[MemoTierStack] Comparing props: prevProps", prevProps, ", newProps", newProps);
  }
  return (
    prevProps.index === newProps.index &&
    prevProps.render === newProps.render &&
    prevProps.renderKey === newProps.renderKey
  );
});

function TierDisplay({ tier, challenges, maps, campaigns, type, showMap, editSubmission, options }) {
  const { settings } = useAppSettings();
  const [expanded, setExpanded] = useState(true);
  const [renderUpTo, setRenderUpTo] = useState(0);

  const onFinishRendering = useCallback(
    (index) => {
      if (index !== renderUpTo) return;
      setTimeout(() => {
        setRenderUpTo((prev) => prev + 5);
      }, 50);
    },
    [renderUpTo]
  );

  const challengesInTier = challenges.filter((c) => c.difficulty_id === tier.id);

  sortChallengesForTGLNew(
    challengesInTier,
    maps,
    campaigns,
    options.sort,
    options.sortOrder,
    type === "player"
  );

  const compactMode = options.compactMode;
  const hideEmptyTiers = !options.showEmptyTiers;

  const tierChallenges = challengesInTier || [];
  const countChallenges = tierChallenges.length;
  const countSubmissions = tierChallenges.reduce(
    (sum, challenge) => sum + challenge.data.submission_count,
    0
  );
  const tierColors = getNewDifficultyColors(settings, tier.id);
  if (hideEmptyTiers && countChallenges === 0) {
    return null;
  }

  return (
    <Stack
      direction="column"
      gap={compactMode ? 0.5 : 1}
      key={tier.id}
      alignItems="flex-start"
      sx={{ height: "fit-content" }}
    >
      <Stack direction="row" gap={1} alignItems="center" alignSelf="stretch">
        <TierInfoBox
          tier={tier}
          options={options}
          countChallenges={countChallenges}
          countSubmissions={countSubmissions}
          expanded={expanded}
          setExpanded={setExpanded}
        />
        <Divider
          sx={{
            flexGrow: 1,
            height: compactMode ? "1px" : "3px",
            backgroundColor: new Color(tierColors.color).alpha(0.5).string(),
          }}
        />
      </Stack>
      <Stack direction="column" gap={compactMode ? 0.25 : 1} width="100%">
        {expanded &&
          tierChallenges.map((challenge, index) => {
            const map = maps[challenge.map_id];
            const campaign = campaigns[map ? map.campaign_id : challenge.campaign_id];
            return (
              <MemoChallengeInfoBox
                key={challenge.id}
                index={index}
                render={index <= renderUpTo}
                onFinishRendering={onFinishRendering}
                type={type}
                tier={tier}
                challenge={challenge}
                map={map}
                campaign={campaign}
                showMap={showMap}
                editSubmission={editSubmission}
                options={options}
              />
            );
          })}
      </Stack>
    </Stack>
  );
}

function TierInfoBox({ tier, options, countChallenges, countSubmissions, expanded, setExpanded }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.top_golden_list" });
  const { settings } = useAppSettings();
  const compactMode = options.compactMode;
  const colors = getNewDifficultyColors(settings, tier.id);
  const borderWidth = compactMode ? "1px" : "3px";
  const tooltip = t("note_number_people", { challenges: countChallenges, submissions: countSubmissions });
  return (
    <TooltipLineBreaks title={tooltip}>
      <Typography
        variant="h6"
        sx={{
          py: 0.5,
          px: 2,
          border: `${borderWidth} solid ${colors.color}`,
          borderRadius: "4px",
          backgroundColor: new Color(colors.color)
            .darken(options.darkenTierColors / 100)
            .alpha(0.75)
            .string(),
          fontWeight: "bold",
          whiteSpace: "nowrap",
          userSelect: "none",
          "&:hover": {
            backgroundColor: new Color(colors.color)
              .darken(options.darkenTierColors / 100 + 0.05)
              .alpha(0.85)
              .string(),
          },
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? tier.name : "(" + tier.name + ")"}
      </Typography>
    </TooltipLineBreaks>
  );
}

function ChallengeInfoBox({
  index,
  render,
  onFinishRendering,
  type,
  tier,
  challenge,
  map,
  campaign,
  showMap,
  editSubmission,
  options,
}) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const auth = useAuth();
  const theme = useTheme();
  const { settings } = useAppSettings();

  useEffect(() => {
    if (!render) return;
    onFinishRendering(index);
  }, [render]);
  if (!render) return null;

  const compactMode = options.compactMode;
  const showFractionalTiers = options.showFractionalTiers;
  const colors = getNewDifficultyColors(settings, tier.id);

  const challengeLabel = getChallengeName(challenge, false);
  const challengeSuffix = getChallengeSuffix(challenge);
  const name = map ? getMapName(map, campaign) : getCampaignName(campaign, t_g, true);

  const firstSubmission = challenge.submissions[0];
  const isPlayer = type === "player";
  const isPersonal = isPlayer && firstSubmission.is_personal;

  let diff = challenge.difficulty;
  if (isPlayer && firstSubmission.suggested_difficulty) diff = firstSubmission.suggested_difficulty;
  const isUnset = !isPlayer || firstSubmission.suggested_difficulty === null;

  const hasGrindTime = isPlayer && firstSubmission.time_taken !== null;
  const timeTaken = isPlayer && hasGrindTime && firstSubmission.time_taken;
  const hideGrindTime = isPlayer && !options.showTimeTaken;
  let columnCount = 3;
  if (hideGrindTime || !isPlayer) columnCount--;
  if (!showFractionalTiers) columnCount--;
  const columnWidth = 12 / columnCount;

  const hideImage = !options.showImages;
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
    borderWidth: compactMode ? "1px" : "3px",
    borderStyle: "solid",
    borderRadius: "4px",
    borderColor: new Color(colors.color).alpha(0.6).string(),
    backgroundColor: new Color(colors.color)
      .darken(options.darkenTierColors / 100)
      .alpha(0.75)
      .string(),

    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      borderColor: new Color(colors.color).alpha(1).string(),
      backgroundColor: new Color(colors.color)
        .darken(options.darkenTierColors / 100 + 0.05)
        .alpha(0.85)
        .string(),
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

  const difficultyNumberProps = {
    difficulty: diff,
    challengeFrac: challenge.data.frac,
    firstSubFrac: firstSubmission.frac,
    isPersonal,
    isUnset,
    isPlayer,
  };
  //#endregion

  const obsoleteIcon = isPlayer && firstSubmission.is_obsolete ? <ObsoleteIcon /> : null;
  const playerNoteIcon =
    isPlayer && firstSubmission.player_notes ? (
      <PlayerNotesTooltip note={firstSubmission.player_notes} />
    ) : null;

  // Layout: single line with map name, challenge label (if exists), FC icon, difficulty
  let element = null;
  if (compactMode) {
    element = (
      <Box sx={{ ...boxBaseStyles, pl: 1, pr: 5 / 8, py: 0.25 }} onClick={handleClick}>
        <Stack direction="row" gap={1} alignItems="center">
          <CampaignIcon {...campaignIconProps} />
          <Stack
            direction="row"
            gap={0.5}
            sx={{ flexGrow: 1, minWidth: 0, maxWidth: { xs: "100%", sm: "220px" } }}
            alignItems="center"
          >
            <Typography
              variant="body2"
              sx={{ ...textEllipsisStyles, fontWeight: "bold", flexShrink: 30, minWidth: 0 }}
            >
              {name}
            </Typography>
            {challengeSuffix && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ...textEllipsisStyles, flexShrink: 70, minWidth: 0 }}
              >
                [{challengeSuffix}]
              </Typography>
            )}
            <ChallengeFcIcon challenge={challenge} style={fcIconStyle} allowTextIcons showClear={false} />
            {(playerNoteIcon !== null || obsoleteIcon !== null) && (
              <Stack direction="row" gap={0.5} alignItems="center" sx={{ ml: 0.25 }}>
                {playerNoteIcon}
                {obsoleteIcon}
              </Stack>
            )}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          {isPlayer && !hideGrindTime && hasGrindTime && <GrindTimeLabel timeTaken={timeTaken} isCompact />}
          {showFractionalTiers && <DifficultyNumber {...difficultyNumberProps} isCompact />}
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
              preferMapImages={options.preferMapImages}
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
                  <Stack direction="row" gap={1} alignItems="center">
                    <SubmissionFcIcon
                      submission={firstSubmission}
                      allowTextIcons
                      style={{ fontSize: "1.0rem" }}
                    />
                    {playerNoteIcon}
                    {obsoleteIcon}
                  </Stack>
                </Grid>
              )}
              {(!isPlayer || !hideGrindTime) && (
                <Grid
                  item
                  xs={columnWidth}
                  display="flex"
                  justifyContent={columnCount === 2 ? "flex-end" : "center"}
                  alignItems="center"
                >
                  {!isPlayer && <ClearCountLabel number={challenge.data.submission_count} />}
                  {isPlayer && hasGrindTime && <GrindTimeLabel timeTaken={timeTaken} isCompact />}
                </Grid>
              )}
              {showFractionalTiers && (
                <Grid item xs={columnWidth} display="flex" alignItems="flex-end" justifyContent="flex-end">
                  <DifficultyNumber {...difficultyNumberProps} />
                </Grid>
              )}
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
    <Link to={"/submission/" + firstSubmission.id} style={{ textDecoration: "none", color: "inherit" }}>
      {element}
    </Link>
  );
}
const MemoChallengeInfoBox = memo(ChallengeInfoBox, (prevProps, newProps) => {
  return (
    prevProps.index === newProps.index &&
    prevProps.render === newProps.render &&
    prevProps.type === newProps.type &&
    prevProps.tier.id === newProps.tier.id &&
    prevProps.challenge.id === newProps.challenge.id &&
    prevProps.options === newProps.options
  );
});

function GrindTimeLabel({ timeTaken, isCompact = false }) {
  const durationStr = secondsToDuration(timeTaken, true);

  if (isCompact) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, mr: 0.5 }}>
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
        <Typography variant="caption" color="text.primary" sx={{ minWidth: "1.5em", textAlign: "right" }}>
          {number}
        </Typography>
        <FontAwesomeIcon icon={faUsers} style={{ fontSize: "0.75rem", color: theme.palette.text.primary }} />
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
  preferMapImages = false,
}) {
  const url = challenge.submissions[0].proof_url; //Has to exist
  let embedUrl = null;

  // If it's a youtube video, use the thumbnail
  // Otherwise, use the map image
  // For campaign challenges, use the campaign image instead

  const youtubeData = parseYouTubeUrl(url);
  if (youtubeData !== null && !preferMapImages) {
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

function DifficultyNumber({
  difficulty,
  challengeFrac,
  firstSubFrac,
  isPersonal = false,
  isUnset = false,
  isPlayer = false,
  isCompact = false,
}) {
  const { settings } = useAppSettings();
  const theme = useTheme();
  const colors = getNewDifficultyColors(settings, difficulty.id);

  challengeFrac = challengeFrac === null || challengeFrac === false ? 0.5 : challengeFrac;
  const diffNumber =
    difficulty.sort + (isPlayer ? (firstSubFrac === null ? 50 : firstSubFrac) / 100 : challengeFrac);

  let diffNumberStr = difficulty.sort === -1 ? "-" : diffNumber.toFixed(2);
  let diffNumberColor = isCompact ? theme.palette.text.secondary : theme.palette.text.primary;
  if (isPersonal) diffNumberColor = new Color(diffNumberColor).mix(new Color("red"), 0.6).string();
  if (isUnset && isPlayer) diffNumberColor = "transparent";

  let beforeStyle = {};
  let bounds = isCompact
    ? {
        top: "0px",
        left: "-4px",
        right: "-4px",
        bottom: "-1px",
      }
    : {
        top: "-1px",
        left: "-4px",
        right: "-4px",
        bottom: "-1px",
      };
  if (isPlayer) {
    beforeStyle = {
      content: '""',
      position: "absolute",
      ...bounds,
      border: "1px solid " + colors.color,
      borderRadius: "3px",
      background: new Color(colors.color).alpha(0.1).string(),
      pointerEvents: "none",
    };
  }

  return (
    <Typography
      variant="caption"
      color={diffNumberColor}
      sx={{
        position: "relative",
        mr: isCompact ? "1px" : 0,
        "&::before": beforeStyle,
      }}
    >
      {diffNumberStr}
    </Typography>
  );
}

//#region Sorting functions
export function sortChallengesForTGLNew(challenges, maps, campaigns, sortBy, sortOrder, isPlayer = false) {
  const ascending = sortOrder === "asc";
  const sortChallenges = (a, b) => {
    switch (sortBy) {
      case "fractional-tiers":
        return sortByFractionalTier(a, b, isPlayer, ascending);
      case "clear-count":
        return sortByClearCount(a, b, ascending);
      case "first-clear-date":
        return sortByFirstClearDate(a, b, ascending);
      case "time-taken":
        return sortByTimeTaken(a, b, ascending);
      case "alphabetical":
      default:
        break;
    }
    return sortByAlphabetical(a, b, maps, campaigns, ascending);
  };
  challenges.sort(sortChallenges);
  return challenges;
}
function sortByFractionalTier(a, b, isPlayer, ascending) {
  //If fraction is available, use that for sorting first. if no frac is available, treat it as 0.5
  let fracA = 0.5;
  let fracB = 0.5;
  if (isPlayer) {
    //First sort for the suggested difficulty, if it exists
    const diffSortA = a.submissions[0].suggested_difficulty?.sort ?? a.difficulty.sort;
    const diffSortB = b.submissions[0].suggested_difficulty?.sort ?? b.difficulty.sort;
    if (diffSortA !== diffSortB) {
      return ascending ? diffSortA - diffSortB : diffSortB - diffSortA;
    }
    fracA = a.submissions[0].frac ?? 50;
    fracB = b.submissions[0].frac ?? 50;
  } else {
    fracA = a.data.frac !== false && a.data.frac !== undefined ? a.data.frac : 0.5;
    fracB = b.data.frac !== false && b.data.frac !== undefined ? b.data.frac : 0.5;
  }
  if (fracA !== fracB) {
    return ascending ? fracA - fracB : fracB - fracA;
  }
  return 0;
}
function sortByClearCount(a, b, ascending) {
  const countA = a.data.submission_count;
  const countB = b.data.submission_count;
  if (countA !== countB) {
    return ascending ? countA - countB : countB - countA;
  }
  return 0;
}
function sortByFirstClearDate(a, b, ascending) {
  const dateA = new Date(a.submissions[0].date_achieved);
  const dateB = new Date(b.submissions[0].date_achieved);
  if (dateA !== dateB) {
    return ascending ? dateA - dateB : dateB - dateA;
  }
  return 0;
}
function sortByAlphabetical(a, b, maps, campaigns, ascending) {
  const mapA = maps[a.map_id];
  const mapB = maps[b.map_id];
  const campaignA = mapA === undefined ? campaigns[a.campaign_id] : campaigns[mapA.campaign_id];
  const campaignB = mapB === undefined ? campaigns[b.campaign_id] : campaigns[mapB.campaign_id];
  const mapNameA = getMapName(mapA, campaignA, true, false);
  const mapNameB = getMapName(mapB, campaignB, true, false);
  return ascending ? mapNameA.localeCompare(mapNameB) : mapNameB.localeCompare(mapNameA);
}
function sortByTimeTaken(a, b, ascending) {
  const timeA = a.submissions[0].time_taken;
  const timeB = b.submissions[0].time_taken;
  //Always sort null values to the end
  if (timeA === null && timeB === null) {
    return 0;
  } else if (timeA === null) {
    return 1;
  } else if (timeB === null) {
    return -1;
  }
  if (timeA !== timeB) {
    return ascending ? timeA - timeB : timeB - timeA;
  }
  return 0;
}
//#endregion

function getTglRenderKey(type, id, filter, options) {
  let key = "";
  key += type;
  key += id;
  key += JSON.stringify(filter);
  key += JSON.stringify(options);
  return key;
}

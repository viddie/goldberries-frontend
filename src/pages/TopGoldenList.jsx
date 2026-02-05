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
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { CustomModal, ModalButtons } from "../hooks/useModal";
import {
  BorderedBox,
  ErrorDisplay,
  getErrorFromMultiple,
  HeadTitle,
  LanguageFlag,
  LoadingSpinner,
  parseYouTubeUrl,
  TooltipLineBreaks,
} from "../components/BasicComponents";
import {
  CampaignIcon,
  ChallengeFcIcon,
  InputMethodIcon,
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
  faClipboard,
  faComment,
  faExclamationTriangle,
  faEyeSlash,
  faFileExport,
  faFilter,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@emotion/react";
import {
  getCampaignName,
  getChallengeFcShort,
  getChallengeName,
  getChallengeSuffix,
  getDifficultyName,
  getMapName,
  secondsToDuration,
} from "../util/data_util";
import { COUNTRY_CODES } from "../util/country_codes";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  API_BASE_URL,
  DIFF_CONSTS,
  DIFFICULTIES,
  DIFFICULTY_STACKS,
  difficultyIdToSort,
  getNewDifficultyColors,
} from "../util/constants";
import Color from "color";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { useAuth } from "../hooks/AuthProvider";
import { useOverflowX } from "../hooks/useOverflowX";
import { getDefaultOptions, TglMoreButton } from "../components/TglDisplayOptions";
import { useModal } from "../hooks/useModal";
import { TimeTakenTiersGraphModal } from "../components/TimeTakenTiersGraph";
import { MapDisplay } from "./Map";
import { ChallengeDisplay } from "./Challenge";
import { FormChallengeWrapper } from "../components/forms/Challenge";
import { FormSubmissionWrapper } from "../components/forms/Submission";

const textEllipsisStyles = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export function PageTopGoldenList({ defaultType = null, defaultId = null }) {
  const { t } = useTranslation(undefined, { keyPrefix: "top_golden_list" });
  const theme = useTheme();
  const auth = useAuth();

  const { type, id } = useParams();
  const actualType = type || defaultType;
  const actualId = id || defaultId;
  const isPlayer = actualType === "player";
  const isOverall = actualType === null || actualType === undefined;

  const defaultFilter = getDefaultFilter(isOverall);
  const [filter, setFilter] = useLocalStorage(getTglFilterKey(actualType), defaultFilter);
  const [options, setOptions] = useLocalStorage(
    getTglOptionsKey(actualType),
    getDefaultOptions(isOverall, auth.user?.player_id),
  );

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
  const filterButtonRef = useRef(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const openSubmissionFilter = useCallback(() => {
    setFilterAnchorEl(filterButtonRef.current);
  }, []);
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
            <Grid item xs={12} sm="auto" ref={filterButtonRef}>
              <SubmissionFilter
                type={actualType}
                id={actualId}
                filter={filter}
                setFilter={setFilter}
                defaultFilter={defaultFilter}
                variant="outlined"
                anchorEl={filterAnchorEl}
                setAnchorEl={setFilterAnchorEl}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <TglMoreButton
                type={actualType}
                id={actualId}
                options={options}
                setOptions={setOptions}
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
          openSubmissionFilter={openSubmissionFilter}
        />
      </Stack>

      <TglModalContainer modalRefs={modalRefs} />
      <ExportTopGoldenListModal
        modalHook={exportModal}
        type={actualType}
        id={actualId}
        filter={filter}
        options={options}
      />
      <TimeTakenTiersGraphModal modalHook={statsModal} id={actualId} filter={filter} options={options} />
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

function TopGoldenList({ type, id, filter, options, showMap, editSubmission, openSubmissionFilter }) {
  const query = useGetTopGoldenList(type, id, filter, options.highlightPlayerId);

  const key = getTglRenderKey(type, id, filter, options);
  const [renderUpTo, setRenderUpTo] = useState({ key: key, index: 0 });

  useEffect(() => {
    if (key !== renderUpTo.key) {
      setRenderUpTo({ key: key, index: 0 });
    }
  }, [key]);

  const onFinishRendering = useCallback((index) => {
    if (index !== renderUpTo.index) return;
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
      sx={{
        // Regular padding/margin doesn't work on overflowing flex containers, so use a pseudo-element instead
        "&::after": {
          content: '""',
          display: { xs: "none", sm: "block" },
          minWidth: "1px",
          flexShrink: 0,
        },
      }}
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
      <HiddenTiersNotice filter={filter} compactMode={compactMode} onClick={openSubmissionFilter} />
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
  useEffect(() => {
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
    [renderUpTo],
  );

  const challengesInTier = challenges.filter((c) => c.difficulty_id === tier.id);

  sortChallengesForTGLNew(
    challengesInTier,
    maps,
    campaigns,
    options.sort,
    options.sortOrder,
    type === "player",
  );

  const compactMode = options.compactMode;
  const hideEmptyTiers = !options.showEmptyTiers;

  const tierChallenges = challengesInTier || [];
  const countChallenges = tierChallenges.length;
  const countSubmissions = tierChallenges.reduce(
    (sum, challenge) => sum + challenge.data.submission_count,
    0,
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

  let borderColor = new Color(colors.color).alpha(0.6).string();
  let borderColorHover = new Color(colors.color).alpha(1).string();
  let darken = options.darkenTierColors;
  let filter = "none";
  let backgroundAlpha = 0.75;
  let backgroundAlphaHover = 0.85;
  if (challenge.data.done) {
    borderColor = new Color("rgba(255, 255, 255, 1)").alpha(0.7).string();
    borderColorHover = new Color("rgba(255, 255, 255, 1)").alpha(1).string();
    darken = Math.max(darken - 20, 0);
    filter = "drop-shadow(0 0 3px rgba(255,255,255,0.75))";
    backgroundAlpha = 1;
    backgroundAlphaHover = 1;
  }

  //#region Common style objects
  const boxBaseStyles = {
    borderWidth: compactMode ? "1px" : "3px",
    borderStyle: "solid",
    borderRadius: "4px",
    borderColor: borderColor,
    filter: filter,
    backgroundColor: new Color(colors.color)
      .darken(darken / 100)
      .alpha(backgroundAlpha)
      .string(),

    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      borderColor: borderColorHover,
      backgroundColor: new Color(colors.color)
        .darken(darken / 100 + 0.05)
        .alpha(backgroundAlphaHover)
        .string(),
    },
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

  const handleNameClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isPlayer) {
      showMap(map?.id, challenge.id, !map);
    }
  };

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
            <NameLabel name={name} isPlayer={isPlayer} isCompact={compactMode} onClick={handleNameClick} />
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
              <NameLabel name={name} isPlayer={isPlayer} isCompact={compactMode} onClick={handleNameClick} />
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

function NameLabel({ name, isPlayer, isCompact, onClick = null }) {
  const compactStyles = isCompact ? { flexShrink: 30, minWidth: 0 } : {};
  const hoverStyles = isPlayer ? { textDecoration: "underline" } : {};
  return (
    <Typography
      variant="body2"
      sx={{
        ...textEllipsisStyles,
        fontWeight: "bold",
        fontSize: "0.98rem",
        ...compactStyles,
        "&:hover": hoverStyles,
      }}
      onClick={isPlayer ? onClick : null}
    >
      {name}
    </Typography>
  );
}

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
  if (isUnset && isPlayer && !isCompact) return;

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

function HiddenTiersNotice({ filter, compactMode, onClick }) {
  const { t } = useTranslation(undefined, { keyPrefix: "top_golden_list" });
  const { t: t_sf } = useTranslation(undefined, { keyPrefix: "components.submission_filter" });
  const { t: t_im } = useTranslation(undefined, { keyPrefix: "components.input_methods" });
  const theme = useTheme();

  const hiddenCount = countHiddenTiers(filter);

  //#region Build active filters list
  const activeFilters = [];

  // Hidden objectives count
  const hiddenObjectivesCount = filter.hide_objectives?.length ?? 0;
  if (hiddenObjectivesCount > 0) {
    activeFilters.push({
      label: t("hidden_tiers.filters.hidden_objectives", { count: hiddenObjectivesCount }),
    });
  }

  // Clear state
  if (filter.clear_state && filter.clear_state !== 0 && filter.clear_state !== "0") {
    const clearStateKey = {
      1: "only_c",
      2: "only_fc",
      3: "no_c",
      4: "no_fc",
    }[filter.clear_state];
    if (clearStateKey) {
      activeFilters.push({
        label: t("hidden_tiers.filters.clear_state", { state: t_sf(`clear_state.${clearStateKey}`) }),
      });
    }
  }

  // Submission count
  if (filter.sub_count !== null && filter.sub_count !== "" && filter.sub_count !== undefined) {
    const operator = filter.sub_count_is_min ? "≥" : "≤";
    activeFilters.push({
      label: t("hidden_tiers.filters.submission_count", { operator, count: filter.sub_count }),
    });
  }

  // Date range
  const hasStartDate =
    filter.start_date !== null && filter.start_date !== "" && filter.start_date !== undefined;
  const hasEndDate = filter.end_date !== null && filter.end_date !== "" && filter.end_date !== undefined;
  if (hasStartDate || hasEndDate) {
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString(navigator.language);
    let dateLabel;
    if (hasStartDate && hasEndDate) {
      dateLabel = t("hidden_tiers.filters.date_range.both", {
        start: formatDate(filter.start_date),
        end: formatDate(filter.end_date),
      });
    } else if (hasStartDate) {
      dateLabel = t("hidden_tiers.filters.date_range.from", { start: formatDate(filter.start_date) });
    } else {
      dateLabel = t("hidden_tiers.filters.date_range.until", { end: formatDate(filter.end_date) });
    }
    activeFilters.push({ label: dateLabel });
  }

  // Country
  if (filter.country !== null && filter.country !== "" && filter.country !== undefined) {
    const countryName = COUNTRY_CODES[filter.country] || filter.country;
    activeFilters.push({
      label: t("hidden_tiers.filters.country", { country: countryName }),
      icon: <LanguageFlag code={filter.country} height="16" />,
    });
  }

  // Input method
  if (filter.input_method !== null && filter.input_method !== "" && filter.input_method !== undefined) {
    activeFilters.push({
      label: t("hidden_tiers.filters.input_method", { method: t_im(filter.input_method) }),
      icon: <InputMethodIcon method={filter.input_method} />,
    });
  }
  //#endregion

  const hasActiveFilters = activeFilters.length > 0;
  const hasHiddenTiers = hiddenCount > 0;

  // Don't show the notice if there's nothing to show
  if (!hasHiddenTiers && !hasActiveFilters) return null;

  const hiddenMessage = hasHiddenTiers ? t("hidden_tiers.notice", { count: hiddenCount }) : null;

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      gap={1}
      onClick={onClick}
      sx={{
        p: 2,
        minWidth: { xs: "auto", sm: "300px" },
        maxWidth: { xs: "100%", sm: "350px" },
        height: "fit-content",
        border: `1px dashed ${theme.palette.text.secondary}`,
        borderRadius: "8px",
        backgroundColor: "rgba(0,0,0,0.2)",
        textAlign: "center",
        cursor: "pointer",
        transition: "background-color 0.2s, border-color 0.2s",
        "&:hover": {
          backgroundColor: "rgba(255,255,255,0.05)",
          borderColor: theme.palette.text.primary,
        },
        "&:active": {
          backgroundColor: "rgba(255,255,255,0.1)",
        },
      }}
    >
      {hasActiveFilters && (
        <Stack direction="column" gap={0.5} alignItems="center">
          <Stack direction="row" gap={1} alignItems="center">
            <FontAwesomeIcon icon={faFilter} color={theme.palette.text.secondary} />
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              {t("hidden_tiers.filter_settings")}
            </Typography>
          </Stack>
          {activeFilters.map((filterItem, index) => (
            <Stack key={index} direction="row" gap={0.5} alignItems="center">
              {filterItem.icon}
              <Typography variant="caption" color="text.secondary">
                {filterItem.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
      {hiddenMessage && (
        <>
          <Stack direction="row" gap={1} alignItems="center">
            <FontAwesomeIcon icon={faEyeSlash} color={theme.palette.text.secondary} />
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              {hiddenMessage}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t("hidden_tiers.change_filter")}
          </Typography>
        </>
      )}
    </Stack>
  );
}

//#region Export Modal
export function ExportTopGoldenListModal({ modalHook, type, id, filter, isPersonal = false, options = {} }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.top_golden_list.export" });
  const query = useGetTopGoldenList(type, id, filter, options.highlightPlayerId);
  const topGoldenList = getQueryData(query);
  const { settings } = useAppSettings();
  const [includeHeader, setIncludeHeader] = useLocalStorage("export_tgl_include_header", true);
  const [includeCount, setIncludeCount] = useLocalStorage("export_tgl_include_count", true);
  const [includeLink, setIncludeLink] = useLocalStorage("export_tgl_include_link", false);
  const [includeTimeTaken, setIncludeTimeTaken] = useLocalStorage("export_tgl_include_time_taken", false);

  const sortBy = options.sort;
  const sortOrder = options.sortOrder;
  const isPlayer = type === "player";

  const copyToClipboard = () => {
    let text = "";

    const { tiers, challenges, maps, campaigns } = topGoldenList;

    let hadContent = false;

    for (let index = 0; index < tiers.length; index++) {
      const difficulty = tiers[index];
      //Looping through subtiers
      const diff_id = difficulty.id;
      const filteredChallenges = challenges.filter((c) => c.difficulty_id === diff_id);

      if (filteredChallenges.length === 0) continue;

      sortChallengesForTGLNew(filteredChallenges, maps, campaigns, sortBy, sortOrder, isPlayer);

      if (includeHeader) {
        if (index > 0 && hadContent) {
          text += "\n";
        }

        text += `${getDifficultyName(difficulty)}\n`;
        text += t("challenge_name");
        if (includeCount) {
          text += `\t${t("submission_count")}`;
        }
        if (includeLink) {
          text += `\t${t("first_clear_url")}`;
        }
        if (includeTimeTaken && isPersonal) {
          text += `\t${t("time_taken")}`;
        }
        text += "\n";
      }

      hadContent = true;

      for (const challenge of filteredChallenges) {
        const map = maps[challenge.map_id];
        const campaign = map ? campaigns[map.campaign_id] : campaigns[challenge.campaign_id];

        let nameSuffix = getChallengeSuffix(challenge) === null ? "" : `${getChallengeSuffix(challenge)}`;
        let name = getMapName(map, campaign);
        let combinedName = "";
        if (nameSuffix !== "") {
          combinedName = `${name} [${nameSuffix}]`;
        } else {
          combinedName = `${name}`;
        }

        if (challenge.requires_fc || challenge.has_fc) {
          combinedName += " " + getChallengeFcShort(challenge, true);
        }

        text += `${combinedName}`;
        if (includeCount) {
          text += `\t${challenge.data.submission_count}`;
        }
        if (includeLink) {
          text += `\t${challenge.submissions[0].proof_url}`;
        }
        if (includeTimeTaken && isPersonal) {
          text += `\t${challenge.submissions[0].time_taken ?? ""}`;
        }
        text += "\n";
      }
    }

    if (hadContent) {
      text += "\n";
    }

    //Remove last newline
    text = text.slice(0, -1);

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(t("feedback.copied"));
      })
      .catch(() => {
        toast.error(t("feedback.error"));
      });
  };

  return (
    <CustomModal modalHook={modalHook} actions={[ModalButtons.close]} options={{ title: t("header") }}>
      {query.isLoading && <LoadingSpinner />}
      {query.isError && <ErrorDisplay error={query.error} />}
      {query.isSuccess && (
        <>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t("text")}
          </Typography>
          <Stack direction="column" gap={0} sx={{ mb: 2 }}>
            <FormControlLabel
              label={t("include_header")}
              checked={includeHeader}
              onChange={(e) => setIncludeHeader(e.target.checked)}
              control={<Checkbox />}
            />
            <FormControlLabel
              label={t("include_submission_count")}
              checked={includeCount}
              onChange={(e) => setIncludeCount(e.target.checked)}
              control={<Checkbox />}
            />
            <FormControlLabel
              label={t("include_first_clear_url")}
              checked={includeLink}
              onChange={(e) => setIncludeLink(e.target.checked)}
              control={<Checkbox />}
            />
            {isPersonal && (
              <FormControlLabel
                label={t("include_time_taken")}
                checked={includeTimeTaken}
                onChange={(e) => setIncludeTimeTaken(e.target.checked)}
                control={<Checkbox />}
              />
            )}
          </Stack>
          <Button
            variant="contained"
            fullWidth
            startIcon={<FontAwesomeIcon icon={faClipboard} />}
            onClick={copyToClipboard}
          >
            {t("button")}
          </Button>
        </>
      )}
    </CustomModal>
  );
}

function TglModalContainer({ modalRefs }) {
  const showMapModal = useModal();
  const editChallengeModal = useModal();
  const editSubmissionModal = useModal();

  // Setting the refs
  modalRefs.map.show.current = showMapModal;
  modalRefs.challenge.edit.current = editChallengeModal;
  modalRefs.submission.edit.current = editSubmissionModal;

  return (
    <>
      <CustomModal
        modalHook={showMapModal}
        maxWidth={false}
        sx={{ maxWidth: "720px", margin: "auto" }}
        options={{ hideFooter: true }}
      >
        {showMapModal.data?.id == null ? (
          <LoadingSpinner />
        ) : showMapModal.data?.isCampaign ? (
          <ChallengeDisplay id={showMapModal.data.id} />
        ) : (
          <MapDisplay id={showMapModal.data.id} challengeId={showMapModal.data.challengeId} isModal />
        )}
      </CustomModal>

      <CustomModal modalHook={editChallengeModal} options={{ hideFooter: true }}>
        {editChallengeModal.data?.id == null ? (
          <LoadingSpinner />
        ) : (
          <FormChallengeWrapper id={editChallengeModal.data.id} onSave={editChallengeModal.close} />
        )}
      </CustomModal>

      <CustomModal modalHook={editSubmissionModal} options={{ hideFooter: true }}>
        {editSubmissionModal.data?.id == null ? (
          <LoadingSpinner />
        ) : (
          <FormSubmissionWrapper id={editSubmissionModal.data.id} onSave={editSubmissionModal.close} />
        )}
      </CustomModal>
    </>
  );
}
//#endregion

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
      case "campaign":
        return sortByCampaignName(a, b, maps, campaigns, ascending);
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
function sortByCampaignName(a, b, maps, campaigns, ascending) {
  const mapA = maps[a.map_id];
  const mapB = maps[b.map_id];
  const campaignA = mapA === undefined ? campaigns[a.campaign_id] : campaigns[mapA.campaign_id];
  const campaignB = mapB === undefined ? campaigns[b.campaign_id] : campaigns[mapB.campaign_id];
  const campaignNameA = campaignA?.name ?? "";
  const campaignNameB = campaignB?.name ?? "";
  const campaignCompare = ascending
    ? campaignNameA.localeCompare(campaignNameB)
    : campaignNameB.localeCompare(campaignNameA);
  if (campaignCompare !== 0) return campaignCompare;
  const mapNameA = mapA?.name ?? "";
  const mapNameB = mapB?.name ?? "";
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

//#region Keys
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

function getTglRenderKey(type, id, filter, options) {
  let key = "";
  key += type;
  key += id;
  key += JSON.stringify(filter);
  key += JSON.stringify(options);
  return key;
}
//#endregion

//#region Utilities

// Helper function to calculate amount of hidden tiers based on filter
function countHiddenTiers(filter) {
  const defaultMaxSort = DIFF_CONSTS.MAX_SORT; // Tier 21+ (sort 21)
  const defaultMinSort = DIFF_CONSTS.UNTIERED_SORT; // Untiered (sort 0)

  const maxDiffSort = difficultyIdToSort(filter.max_diff_id);
  const minDiffSort = difficultyIdToSort(filter.min_diff_id);

  let countHiddenTiers = 0;

  // Check if higher tiers are hidden (above max filter)
  if (maxDiffSort < defaultMaxSort) {
    countHiddenTiers += defaultMaxSort - maxDiffSort;
  }

  // Check if lower tiers are hidden (below min filter)
  if (minDiffSort > defaultMinSort) {
    countHiddenTiers += minDiffSort - defaultMinSort;
  }

  return countHiddenTiers;
}

//#endregion

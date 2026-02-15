import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Slider,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useDebounce, useLocalStorage } from "@uidotdev/usehooks";
import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell } from "recharts";
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import TimelineOppositeContent, { timelineOppositeContentClasses } from "@mui/lab/TimelineOppositeContent";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineConnector from "@mui/lab/TimelineConnector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faFlag,
  faGamepad,
  faGaugeSimpleHigh,
  faLink,
} from "@fortawesome/free-solid-svg-icons";

import { SubmissionFilterUncontrolled, getDefaultFilter } from "../components/SubmissionFilter";
import { ROLES, useAuth } from "../hooks/AuthProvider";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { Changelog } from "../components/Changelog";
import {
  getCampaignName,
  getChallengeCampaign,
  getDifficultyNameShort,
  getPlayerNameColorStyle,
  secondsToDuration,
} from "../util/data_util";
import { API_BASE_URL, DIFF_CONSTS, getNewDifficultyColors } from "../util/constants";
import { RecentSubmissionsHeadless } from "../components/recent_submissions";
import {
  InputMethodIcon,
  LinkIcon,
  SubmissionEmbed,
  SuspendedIcon,
  AccountRoleIcon,
  DifficultyChip,
  ObjectiveIcon,
  ChallengeInline,
} from "../components/goldberries";
import {
  getQueryData,
  useGetAllDifficulties,
  useGetPlayer,
  useGetPlayerLikes,
  useGetPlayerStats,
  useGetShowcaseSubmissions,
  useGetTopGoldenList,
} from "../hooks/useApi";
import {
  BasicContainerBox,
  CollapsibleText,
  ErrorDisplay,
  HeadTitle,
  LanguageFlag,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
  getErrorFromMultiple,
  parseYouTubeUrl,
} from "../components/basic";
import { BadgeDisplay } from "../components/badge";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { COUNTRY_CODES_SHORT } from "../util/country_codes";
import { WishlistCard, WishlistTable, FormWishlistLike } from "../components/likes";
import { useModal, CustomModal } from "../hooks/useModal";

import { DetailsRow } from "./Challenge";
import { PageTopGoldenList } from "./TopGoldenList";
import { TimeDiffWithTooltip } from "./Submission";

//#region PagePlayer
export function PagePlayer() {
  const { id, tab } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab || "info");

  useEffect(() => {
    if (tab && tab !== selectedTab) {
      setSelectedTab(tab);
    } else if (tab === undefined) {
      setSelectedTab("info");
    }
  }, [tab]);

  if (selectedTab === "top-golden-list") {
    return <PageTopGoldenList defaultType="player" defaultId={id} />;
  }

  return (
    <BasicContainerBox
      maxWidth="md"
      sx={{
        // backgroundColor: "rgba(40, 40, 40, 0.5)",
        backgroundColor: "#262626",
        // border: "none",
        p: 0,
        pt: 0,
        pb: 0,
        overflow: "hidden",
      }}
    >
      <PlayerDisplay id={parseInt(id)} tab={selectedTab} setTab={setSelectedTab} />
    </BasicContainerBox>
  );
}
//#endregion

//#region PlayerDisplay
export function PlayerDisplay({ id, tab, setTab }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player" });
  const { settings } = useAppSettings();
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const query = useGetPlayer(id);
  const statsQuery = useGetPlayerStats(id);
  const navigate = useNavigate();

  if (query.isLoading || statsQuery.isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <LoadingSpinner />
      </Box>
    );
  } else if (query.isError || statsQuery.isError) {
    const error = getErrorFromMultiple(query, statsQuery);
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <ErrorDisplay error={error} />
      </Box>
    );
  }

  const navigateToTab = (newTab) => {
    setTab(newTab);
    if (newTab === "info") {
      navigate(`/player/${id}`, { replace: true });
    } else {
      navigate(`/player/${id}/${newTab}`, { replace: true });
    }
  };

  const player = getQueryData(query);
  const suspended = player.account.is_suspended;
  const stats = getQueryData(statsQuery);

  const nameStyle = getPlayerNameColorStyle(player, settings);

  const title = `${player.name} - ` + t("title");

  const contentPadding = { px: { xs: 2, sm: 3 } };

  return (
    <Box sx={{ pb: { xs: 2, sm: 3 } }}>
      <HeadTitle title={title} />

      {/* Section 1: Player Header */}
      <Box
        sx={{
          ...contentPadding,
          pt: { xs: 2, sm: 3 },
          pb: 2,
          backgroundColor: "#333333",
        }}
      >
        {/* Name + badges row */}
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Typography
            variant="h4"
            sx={{
              textDecoration: suspended ? "line-through" : "inherit",
              color: suspended ? "grey" : "inherit",
              fontWeight: "bold",
              ...nameStyle,
            }}
          >
            {player.name}
          </Typography>
          {player.account.is_suspended && <SuspendedIcon reason={player.account.suspension_reason} />}
          <AccountRoleIcon account={player.account} />
          <ExRoleLabel account={player.account} />
          <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }} />
          <BadgeDisplay player={player} />
        </Stack>

        {/* Main content: About Me + Details Table side by side on desktop */}
        <Grid container spacing={2} sx={{ mt: 0.0 }}>
          {/* Left side: About Me */}
          <Grid xs={12} md>
            <PlayerAboutMe aboutMe={player.account.about_me} />
          </Grid>

          {/* Right side: Details Table */}
          <Grid xs={12} md="auto">
            <PlayerDetailsTable player={player} stats={stats} isMdScreen={isMdScreen} />
          </Grid>
        </Grid>
      </Box>

      {/* Wishlist section */}
      <PlayerWishlist id={id} sx={contentPadding} />

      {/* Section 2: Tabs */}
      <Box
        sx={{
          mt: 0,
          backgroundColor: "#464646",
          boxShadow: "0 4px 4px rgba(0,0,0,0.3)",
        }}
      >
        <Tabs
          variant="fullWidth"
          value={tab}
          onChange={(event, newTab) => navigateToTab(newTab)}
          sx={{
            "& .MuiTabs-indicator": {
              top: 0,
              bottom: "auto",
            },
          }}
        >
          <Tab label={t("tabs.info.label")} value="info" />
          <Tab label={t("tabs.timeline.label")} value="timeline" />
          <Tab label={t("tabs.wishlist.label")} value="wishlist" />
        </Tabs>
      </Box>

      {/* Section 3: Tab Content */}
      <Box sx={{ ...contentPadding, mt: 2 }}>
        {tab === "info" && <PlayerInfo id={id} stats={stats} />}
        {tab === "timeline" && <PlayerTimeline id={id} />}
        {tab === "wishlist" && <PlayerWishlistTab id={id} />}
      </Box>
    </Box>
  );
}
//#endregion

//#region Player Header Components
const ABOUT_ME_MAX_HEIGHT = 120;

function PlayerAboutMe({ aboutMe }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.about_me" });
  const { t: t_ap } = useTranslation(undefined, { keyPrefix: "account.tabs.profile" });

  const hasContent = aboutMe && aboutMe.trim().length > 0;

  return (
    <Box
      sx={{
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 2,
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {hasContent ? (
        <CollapsibleText text={aboutMe} label={t_ap("about_me.label")} maxHeight={ABOUT_ME_MAX_HEIGHT} />
      ) : (
        <>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
            {t_ap("about_me.label")}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
            {t("no_about_me")}
          </Typography>
        </>
      )}
    </Box>
  );
}

function PlayerDetailsTable({ player, stats, isMdScreen }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.details" });
  const { t: t_a } = useTranslation();

  const items = [];

  if (player.account.country) {
    items.push(
      <DetailsRow key="country" label={t("country")} icon={<FontAwesomeIcon icon={faFlag} fixedWidth />}>
        <Stack direction="row" alignItems="center" gap={0.75}>
          {COUNTRY_CODES_SHORT[player.account.country] || player.account.country}
          <LanguageFlag code={player.account.country} showTooltip height="16px" />
        </Stack>
      </DetailsRow>,
    );
  }

  if (player.account.input_method) {
    items.push(
      <DetailsRow
        key="input-method"
        label={t("input_method")}
        icon={<FontAwesomeIcon icon={faGamepad} fixedWidth />}
      >
        <Stack direction="row" alignItems="center" gap={0.75}>
          <span>{t_a("components.input_methods." + player.account.input_method)}</span>
          <InputMethodIcon method={player.account.input_method} />
        </Stack>
      </DetailsRow>,
    );
  }

  if (stats?.first_submission_date) {
    items.push(
      <DetailsRow
        key="first-golden"
        label={t("first_golden")}
        icon={<FontAwesomeIcon icon={faCalendar} fixedWidth />}
      >
        {new Date(stats.first_submission_date).toLocaleDateString(navigator.language, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </DetailsRow>,
    );
  }

  // Stats
  items.push(
    <DetailsRow key="total-time" label={t("total_time")} icon={<FontAwesomeIcon icon={faClock} fixedWidth />}>
      {secondsToDuration(stats.total_time)}
    </DetailsRow>,
  );

  if (stats.account.date_created) {
    items.push(
      <DetailsRow
        key="date-created"
        label={t("date_created")}
        icon={<FontAwesomeIcon icon={faCalendar} fixedWidth />}
      >
        <TimeDiffWithTooltip date={stats.account.date_created} />
      </DetailsRow>,
    );
  }

  // Links
  if (player.account?.links && player.account.links.length > 0) {
    items.push(
      <DetailsRow key="links" label={t("links")} icon={<FontAwesomeIcon icon={faLink} fixedWidth />}>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          {player.account.links.map((link) => (
            <LinkIcon url={link} />
          ))}
        </Stack>
      </DetailsRow>,
    );
  }
  items.push(
    <DetailsRow
      key="personal-tgl"
      label={t("personal_tgl")}
      icon={
        <ObjectiveIcon
          objective={{
            name: "Personal Top Golden List",
            description: "Personal Top Golden List",
            icon_url: "/icons/goldenberry-8x.png",
          }}
          height="14px"
          style={{ marginBottom: "-2px" }}
        />
      }
    >
      <StyledLink to={`/player/${player.id}/top-golden-list`}>
        <FontAwesomeIcon icon={faGaugeSimpleHigh} fixedWidth /> View
      </StyledLink>
    </DetailsRow>,
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        columnGap: 1,
        rowGap: 0.5,
        alignItems: "baseline",
        minWidth: isMdScreen ? 270 : undefined,
      }}
    >
      {items}
    </Box>
  );
}
//#endregion

//#region Wishlist
const WISHLIST_STATE_SORT_ORDER = { current: 0, soon: 1, on_hold: 2, backlog: 3 };
const WISHLIST_PROMINENT_MAX = 4;

function sortWishlistLikes(likes) {
  return [...likes].sort((a, b) => {
    const stateA = WISHLIST_STATE_SORT_ORDER[a.state] ?? 99;
    const stateB = WISHLIST_STATE_SORT_ORDER[b.state] ?? 99;
    if (stateA !== stateB) return stateA - stateB;
    return new Date(b.date_updated) - new Date(a.date_updated);
  });
}

function getProminentWishlistLikes(likes) {
  const sorted = sortWishlistLikes(likes);
  const nonBacklog = sorted.filter((l) => l.state !== "backlog");
  return nonBacklog.slice(0, WISHLIST_PROMINENT_MAX);
}

function getWishlistTabLikes(likes) {
  const sorted = sortWishlistLikes(likes);
  const prominentIds = new Set(getProminentWishlistLikes(likes).map((l) => l.id));
  return sorted.filter((l) => !prominentIds.has(l.id));
}

function PlayerWishlist({ id, sx }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player" });
  const wishlistQuery = useGetPlayerLikes(id, true);
  const wishlistData = getQueryData(wishlistQuery);
  const editWishlistModal = useModal();

  if (wishlistQuery.isLoading) return null;
  if (wishlistQuery.isError) return null;

  const likes = wishlistData ?? [];
  const prominentLikes = getProminentWishlistLikes(likes);
  if (prominentLikes.length === 0) return null;

  return (
    <Box sx={{ ...sx, pb: 2, backgroundColor: "#333333" }}>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        {t("wishlist")}
      </Typography>
      <Grid container spacing={2}>
        {prominentLikes.map((like) => (
          <Grid key={like.id} xs={12} sm={6}>
            <WishlistCard like={like} onEdit={() => editWishlistModal.open(like)} />
          </Grid>
        ))}
      </Grid>

      <CustomModal modalHook={editWishlistModal} options={{ hideFooter: true }}>
        {editWishlistModal.data && (
          <FormWishlistLike like={editWishlistModal.data} onSave={() => editWishlistModal.close()} />
        )}
      </CustomModal>
    </Box>
  );
}

function PlayerWishlistTab({ id }) {
  const wishlistQuery = useGetPlayerLikes(id, true);
  const wishlistData = getQueryData(wishlistQuery);

  if (wishlistQuery.isLoading) return <LoadingSpinner />;
  if (wishlistQuery.isError) return <ErrorDisplay error={wishlistQuery.error} />;

  const likes = wishlistData ?? [];
  const tabLikes = getWishlistTabLikes(likes);

  if (tabLikes.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
        No additional wishlist entries.
      </Typography>
    );
  }

  return <WishlistTable likes={tabLikes} />;
}
//#endregion

//#region Player Info Tab
function PlayerInfo({ id, stats }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info" });
  return (
    <>
      <SubmissionShowcase id={id} />
      <Divider sx={{ my: 2 }} />
      <PlayerRecentSubmissions id={id} />
      <Divider sx={{ my: 2 }} />
      <Typography variant="h5">{t("stats")}</Typography>
      <DifficultyCountChart difficulty_counts={stats.count_by_difficulty} />
      <Divider sx={{ my: 2 }} />
      <Changelog type="player" id={id} />
    </>
  );
}

function SubmissionShowcase({ id }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info" });
  const { t: t_as } = useTranslation(undefined, { keyPrefix: "account.tabs.showcase" });
  const query = useGetShowcaseSubmissions(id);
  const data = getQueryData(query);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const { type, submissions } = data;
  const typeStr = type === "custom" ? t_as("title") : t("showcase_hardest");

  const widths = [12, 6, 6, 4, 4, 4, 4, 4, 4, 4];
  const offsets = [null, [1, 3], null, [3, 4], [3, 2], null, [6, 4], [6, 2], null];
  const getOffset = (index, length) => {
    const offset = offsets[length - 1];
    if (!offset || offset === null) {
      return undefined;
    }
    if (offset[0] === index) {
      return offset[1];
    }
    return undefined;
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {typeStr}
      </Typography>
      <Grid container spacing={2}>
        {submissions.map((submission, index) => (
          <Grid
            xs={12}
            md={widths[index]}
            display="flex"
            justifyContent="space-around"
            mdOffset={getOffset(index, submissions.length)}
          >
            <StyledLink to={`/submission/${submission.id}`}>
              <SubmissionEmbed
                submission={submission}
                style={{
                  width: "100%",
                  maxWidth: "540px",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
            </StyledLink>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

function PlayerRecentSubmissions({ id }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.recent_submissions" });
  const auth = useAuth();
  const { settings } = useAppSettings();
  const canSeeRejected = auth.hasHelperPriv || auth.isPlayerWithId(id);
  const showRejected = canSeeRejected && settings.general.showRejectedSubmissions;
  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t("title")}
      </Typography>
      <RecentSubmissionsHeadless verified={null} playerId={id} showChip hideIfEmpty paginationOptional />
      <RecentSubmissionsHeadless
        verified={true}
        playerId={id}
        showChip
        chipSx={{ mt: 2 }}
        paginationOptional
      />

      {showRejected && (
        <>
          <RecentSubmissionsHeadless
            verified={false}
            playerId={id}
            showChip
            hideIfEmpty
            chipSx={{ mt: 2 }}
            paginationOptional
          />
        </>
      )}
    </>
  );
}

function DifficultyCountChart({ difficulty_counts }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info.chart" });
  const { settings } = useAppSettings();
  const theme = useTheme();
  const query = useGetAllDifficulties();
  const [showUntiered, setShowUntiered] = useLocalStorage("player_chart_show_untiered", true);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const rawDiffs = getQueryData(query);
  let difficulties = [...rawDiffs];
  if (!showUntiered) {
    difficulties = difficulties.filter(
      (d) => d.id !== DIFF_CONSTS.TRIVIAL_ID && d.id !== DIFF_CONSTS.UNTIERED_ID,
    );
  }

  //Loop through all difficulties and do the following:
  // 1. ~~Get the difficulties group id by getGroupId(id)~~ -> Rework: just use the id
  // 2. If the group id is different from the id of the difficulty, add the difficulty_counts of the difficulty to the difficulty_counts of the group
  // 3. Then, remove the difficulty from the list of difficulties
  const difficulty_counts_grouped = {};
  difficulties.forEach((difficulty) => {
    const group_id = difficulty.id;
    const count = difficulty_counts[difficulty.id] || 0;
    if (!(group_id in difficulty_counts_grouped)) {
      difficulty_counts_grouped[group_id] = 0;
    }
    difficulty_counts_grouped[group_id] += count;
  });

  //Filter out the difficulties that are not in the difficulty_counts_grouped object
  difficulties = difficulties.filter((d) => d.id in difficulty_counts_grouped);

  const getDifficultyName = (id) => {
    const difficulty = difficulties.find((d) => d.id === id);
    return difficulty ? getDifficultyNameShort(difficulty) : "";
  };
  const getChartDifficultyColor = (id) => {
    // return DIFFICULTIES[id].color;
    return getNewDifficultyColors(settings, id).color;
  };

  const data = [];
  difficulties.forEach((difficulty) => {
    data.push({
      id: difficulty.id,
      name: getDifficultyName(difficulty.id),
      count: difficulty_counts_grouped[difficulty.id] || 0,
    });
  });

  return (
    <Stack direction="column" gap={1}>
      <FormControlLabel
        checked={showUntiered}
        onChange={() => setShowUntiered(!showUntiered)}
        control={<Checkbox />}
        label={t("show_standard")}
      />
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          barCategoryGap="8%"
          barGap={50}
          margin={{
            top: 20,
            right: 30,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: theme.palette.text.primary }} />
          <YAxis tick={{ fill: theme.palette.text.primary }} />
          <Legend iconSize={0} payload={[{ value: t("x_axis"), type: "bar", id: "tier-bar" }]} />
          <Bar id="tier-bar" dataKey="count" fill={theme.palette.text.primary} label={{ position: "top" }}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getChartDifficultyColor(entry.id)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Stack>
  );
}
//#endregion

//#region ExRoleLabel
function ExRoleLabel({ account }) {
  //A small, fancy label for ex-roles
  const { t } = useTranslation(undefined, { keyPrefix: "components.roles" });

  if (![ROLES.EX_HELPER, ROLES.EX_VERIFIER, ROLES.EX_ADMIN].includes(account.role)) {
    return null;
  }

  const style = {
    borderRadius: "15px",
    padding: "2px 10px",
    fontSize: "1em",
    fontWeight: "bold",
    color: "white",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "white",
  };

  let text = null;
  if (account.role === ROLES.EX_HELPER) {
    text = t("ex_helper");
  } else if (account.role === ROLES.EX_VERIFIER) {
    text = t("ex_verifier");
  } else if (account.role === ROLES.EX_ADMIN) {
    text = t("ex_admin");
  }

  return (
    <Stack direction="row" gap={1} alignItems="center">
      {/* {icon} */}
      <Typography variant="body1" sx={style}>
        {text}
      </Typography>
    </Stack>
  );
}
//#endregion

//#region Timeline
function PlayerTimeline({ id }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.timeline" });
  const [filter, setFilter] = useLocalStorage("player_timeline_filter", getDefaultFilter(false));
  const query = useGetTopGoldenList("player", id, filter);
  const groupCampaigns = false; //I thought this might be cool, but it kinda sucked so w/e
  const [ratio, setRatio] = useLocalStorage("player_timeline_show_difficulty_ratio", 0.05);

  const defaultFilter = getDefaultFilter(false);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const data = JSON.parse(JSON.stringify(getQueryData(query))); //Don't modify the original data
  //Invert data structure
  const submissions = [];
  data.challenges.forEach((challenge) => {
    const submission = challenge.submissions[0];
    submission.challenge = challenge;
    if (challenge.map_id !== null) {
      challenge.map = data.maps[challenge.map_id];
      challenge.map.campaign = data.campaigns[challenge.map.campaign_id];
    }
    if (challenge.campaign_id !== null) challenge.campaign = data.campaigns[challenge.campaign_id];
    challenge.submissions = null; //Unset to remove cyclic references
    submissions.push(submission);
  });
  const showDifficulty = calculateShowPreviewImageDifficulty(submissions, ratio);

  //Sort submissions by submission.date_achieved DESC. Date is in ISO format
  submissions.sort((a, b) => {
    return new Date(b.date_achieved) - new Date(a.date_achieved);
  });

  //Group submissions by day
  const groupedByDay = [];
  submissions.forEach((submission) => {
    const date = submission.date_achieved.split("T")[0];
    const group = groupedByDay.find((g) => g.date === date);
    if (group) {
      group.submissions.push(submission);
    } else {
      groupedByDay.push({
        date: date,
        submissions: [submission],
      });
    }
  });

  //Group again by year, so that we can have clean year separators
  const groupedByYear = [];
  groupedByDay.forEach((group) => {
    const year = group.date.split("-")[0];
    const yearGroup = groupedByYear.find((g) => g.year === year);
    if (yearGroup) {
      yearGroup.days.push(group);
    } else {
      groupedByYear.push({
        year: year,
        days: [group],
      });
    }
  });

  //Currently the groupedByYear array looks like: [{year: "2024", days: []}, {year: "2022", days: []}]
  //Insert all missing years between the first year (the very end of the array) and the current year (possibly present in the array, possibly absent)
  if (groupedByYear.length > 0) {
    const currentYear = new Date().getFullYear();
    const firstYear = parseInt(groupedByYear[groupedByYear.length - 1].year);

    for (let year = firstYear; year <= currentYear; year++) {
      if (!groupedByYear.some((g) => g.year === year.toString())) {
        groupedByYear.push({ year: year.toString(), days: [] });
      }
    }

    // Sort the years in descending order to maintain order consistency
    groupedByYear.sort((a, b) => parseInt(b.year) - parseInt(a.year));
  }

  return (
    <Stack direction="column" gap={1}>
      <Grid container spacing={2}>
        <Grid item xs>
          <Typography variant="h5">{t("label")}</Typography>
        </Grid>
        <Grid item xs="auto">
          <SubmissionFilterUncontrolled
            type="player"
            id={id}
            filter={filter}
            defaultFilter={defaultFilter}
            setFilter={setFilter}
            variant="outlined"
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            {t("show_difficulty_ratio")}: {(ratio * 100).toFixed(0) + "%"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TimelineRatioSlider ratio={ratio} setRatio={setRatio} />
        </Grid>
      </Grid>

      <Timeline
        sx={{
          px: 0,
          [`& .${timelineOppositeContentClasses.root}`]: {
            flex: 0.12,
            minWidth: "100px",
          },
        }}
      >
        <BigTimelineLabel label={"Now"} isNow />
        {groupedByYear.length === 0 && <BigTimelineLabel label={new Date().getFullYear()} isLast />}
        {groupedByYear.map((yearGroup, yearIndex) => (
          <>
            {yearGroup.days.map((dayGroup, dayIndex) => (
              <TimelineDay
                key={dayGroup.date}
                date={dayGroup.date}
                submissions={dayGroup.submissions}
                isLast={dayIndex >= dayGroup.length - 1}
                groupCampaigns={groupCampaigns}
                showDifficulty={showDifficulty}
              />
            ))}
            <BigTimelineLabel
              key={yearGroup.year}
              label={yearGroup.year}
              isLast={yearIndex >= groupedByYear.length - 1}
            />
          </>
        ))}
      </Timeline>
    </Stack>
  );
}

function TimelineRatioSlider({ ratio, setRatio }) {
  const [localRatio, setLocalRatio] = useState(ratio);
  const ratioDebounced = useDebounce(localRatio, 500);
  useEffect(() => {
    setRatio(ratioDebounced);
  }, [ratioDebounced]);

  return (
    <Slider
      value={localRatio}
      onChange={(_, value) => setLocalRatio(value)}
      valueLabelFormat={(value) => (value * 100).toFixed(0) + "%"}
      valueLabelDisplay="auto"
      step={0.01}
      min={0}
      max={1}
    />
  );
}

function BigTimelineLabel({ label, isLast = false, isNow = false }) {
  const lineColor = "#bdbdbd";
  return (
    <TimelineItem>
      <TimelineOppositeContent>
        <Typography variant="h4">{label}</Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot />
        {!isLast && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        {!isNow && <Divider sx={{ borderColor: lineColor, borderWidth: 2, borderRadius: 10, mt: 1.125 }} />}
      </TimelineContent>
    </TimelineItem>
  );
}

function TimelineDay({ date, submissions, isLast, groupCampaigns, showDifficulty }) {
  const dateStr = new Date(date).toLocaleDateString(navigator.language, { month: "short", day: "numeric" });

  const groupedByCampaign = [];
  submissions.forEach((submission) => {
    const campaign = getChallengeCampaign(submission.challenge);
    const group = groupedByCampaign.find((g) => g.campaign.id === campaign.id);
    if (group) {
      group.submissions.push(submission);
    } else {
      groupedByCampaign.push({
        campaign: campaign,
        submissions: [submission],
      });
    }
  });

  return (
    <TimelineItem>
      <TimelineOppositeContent>
        <Typography variant="body1">{dateStr}</Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot />
        {!isLast && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        <Stack direction="column" gap={0.5}>
          {groupedByCampaign.map((group) => {
            if (groupCampaigns && group.submissions.length > 1) {
              return (
                <TimelineCampaignMultiSubmissions
                  key={group.campaign.id}
                  campaign={group.campaign}
                  submissions={group.submissions}
                />
              );
            }
            return (
              <>
                {group.submissions.map((submission, index) => (
                  <TimelineSubmissionSingle submission={submission} showDifficulty={showDifficulty} />
                ))}
              </>
            );
          })}
        </Stack>
      </TimelineContent>
    </TimelineItem>
  );
}

function TimelineSubmissionSingle({ submission, showDifficulty }) {
  const challenge = submission.challenge;
  const showCampaignImage = showDifficulty ? challenge.difficulty.sort >= showDifficulty.sort : false;

  return (
    <Stack direction="column" gap={1} alignItems="flex-start" justifyContent="space-between">
      <Stack
        direction="row"
        columnGap={1}
        alignItems="center"
        sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}
      >
        <DifficultyChip difficulty={challenge.difficulty} sx={{ mt: "1px" }} />
        <ChallengeInline challenge={challenge} submission={submission} />
      </Stack>
      {showCampaignImage && <TimelineSubmissionPreviewImage submission={submission} />}
    </Stack>
  );
}

function TimelineCampaignMultiSubmissions({ campaign, submissions }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const minDifficultySort = Math.min(...submissions.map((s) => s.challenge.difficulty.sort));
  const maxDifficultySort = Math.max(...submissions.map((s) => s.challenge.difficulty.sort));
  //Find the first difficulty object matching the given min/max sorts
  const minDifficulty = submissions.find((s) => s.challenge.difficulty.sort === minDifficultySort).challenge
    .difficulty;
  const maxDifficulty = submissions.find((s) => s.challenge.difficulty.sort === maxDifficultySort).challenge
    .difficulty;
  const isDifferent = minDifficultySort !== maxDifficultySort;
  const count = submissions.length;

  return (
    <Stack direction="row" columnGap={1} alignItems="center" sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}>
      <Stack direction="row" alignItems="center" columnGap={1} flexWrap="wrap">
        <StyledLink to={"/campaign/" + campaign.id}>{getCampaignName(campaign, t_g, true)}</StyledLink>
        <Typography variant="body2" color="textSecondary">
          {count}x submissions
        </Typography>
      </Stack>
      <DifficultyChip difficulty={minDifficulty} sx={{ mt: "1px" }} />
      {isDifferent && (
        <>
          {" ~ "}
          <DifficultyChip difficulty={maxDifficulty} sx={{ mt: "1px" }} />
        </>
      )}
    </Stack>
  );
}

function TimelineSubmissionPreviewImage({
  submission,
  challenge = null,
  campaign = null,
  maxWidth = "200px",
  width = null,
  dontLink = false,
  style = {},
  linkStyle = {},
}) {
  const _campaign = campaign ?? getChallengeCampaign(challenge ?? submission.challenge);

  let url = null;

  const youtubeData = parseYouTubeUrl(submission.proof_url);
  if (youtubeData !== null) {
    url = "https://img.youtube.com/vi/" + youtubeData.videoId + "/mqdefault.jpg";
  }

  if (url === null) {
    url = API_BASE_URL + "/embed/img/campaign_image.php?id=" + _campaign.id;
  }

  const image = (
    <PlaceholderImage
      src={url}
      alt={_campaign.name}
      style={{ maxWidth, width: width ?? undefined, borderRadius: "5px", aspectRatio: "16 / 9", ...style }}
    />
  );

  if (dontLink) {
    return image;
  }

  return (
    <StyledExternalLink href={submission.proof_url} style={linkStyle}>
      {image}
    </StyledExternalLink>
  );
}

function calculateShowPreviewImageDifficulty(submissions, ratio) {
  if (ratio === 0) return null;
  if (submissions.length === 0) return null;
  const sortedSubmissions = submissions.sort(
    (a, b) => b.challenge.difficulty.sort - a.challenge.difficulty.sort,
  );
  const index = Math.floor(Math.min(submissions.length * ratio, submissions.length - 1));
  return sortedSubmissions[index].challenge.difficulty;
}
//#endregion

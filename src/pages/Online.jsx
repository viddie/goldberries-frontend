import { useLayoutEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Box, Button, ButtonGroup, Collapse, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useTheme } from "@emotion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBug,
  faArrowRight,
  faCircle,
  faClockRotateLeft,
  faDoorOpen,
  faFlag,
  faLink,
  faMapLocationDot,
  faPowerOff,
  faReply,
  faRightFromBracket,
  faSkull,
  faStopwatch,
  faTableList,
  faTag,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getQueryData,
  ONLINE_PLAYERS_REFRESH_SECONDS,
  useGetOnlinePlayers,
  useGetTwitchLiveStatus,
} from "../hooks/useApi";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import {
  BasicContainerBox,
  CustomIconButton,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  ModalLink,
  NoticeBox,
  StyledExternalLink,
  StyledLink,
} from "../components/basic";
import { ChallengeFcIcon, DifficultyChip, getLinkPlatform, PlayerLink } from "../components/goldberries";
import {
  getCampaignName,
  getChallengeCampaign,
  getChallengeNameShort,
  getGamebananaEmbedUrl,
  getMapName,
  isMapSameNameAsCampaign,
  secondsToDuration,
} from "../util/data_util";
import { API_BASE_URL } from "../util/constants";
import { jsonDateToJsDate } from "../util/util";

import { DateRelativeTooltip } from "./Post";

const CCT_URL = "https://gamebanana.com/mods/358978";
const SETUP_STEP_COUNT = 5;
const GRID_COLUMNS = "minmax(140px, 1.2fr) 2fr 2fr minmax(180px, 1.3fr)";
// The status column is wider in the compact layout, since the progress bar and its labels are in a single line
const GRID_COLUMNS_COMPACT = "minmax(140px, 1.2fr) 2fr 2fr minmax(260px, 1.8fr)";
// The player rows without the status column. The challenge column only takes the space it needs and the player
// column has a fixed width, so the map column still lines up across the cards
const RECENT_WIN_GRID_COLUMNS = "180px 1fr auto";
const RECENT_WINS_DIALOG_WIDTH = 900;
const GOLDEN_COLOR = "#ffb300";
const PROGRESS_COLOR = "#2f6fa7";
const PB_COLOR = "#4caf50";
const ROW_BACKGROUND = "#303030";
const ROW_HOVER_BACKGROUND = "#383838";
const WIN_BACKGROUND = "#3d3420";
const WIN_HOVER_BACKGROUND = "#4a3f25";
const BANNER_WIDTH = "45%";
const BANNER_MOBILE_HEIGHT = 120;
const BANNER_BRIGHTNESS = 0.725;
const BANNER_CHIP_BACKGROUND = "rgba(20,20,20,0.75)";
// Slightly smaller than the theme defaults (1rem / 0.875rem) to keep the rows compact
const ROW_FONT_SIZES = { body1: "0.94rem", body2: "0.82rem" };
const PROGRESS_BAR_RADIUS = 5;
// Gap (in px) between the player name and the label next to it
const PLAYER_LABEL_GAP = 8;
// Markers closer than this (in % of the bar) get their labels pushed apart to avoid overlapping
const MARKER_LABEL_MIN_DISTANCE = 15;
const DEATH_COLOR = "#e53935";
const RESET_COLOR = "#90caf9";
const EXIT_COLOR = "#bdbdbd";
const NOT_ON_PATH_COLOR = "rgba(255,255,255,0.45)";
const EVENT_ICON_SIZE = 14;
// Amount of status updates fetched per player. The history graph always reserves space for this many updates
const HISTORY_SIZE = 100;
const HISTORY_SIZE_LONG = 300;
const HISTORY_TICK_COUNT = 4;
// Players with a win event within this many of their latest status updates count as recent winners
const RECENT_WINS_SIZE = 100;
const GOLDEN_GIF_SIZE = 20;
// Events that end the current run. They are rendered as markers on the last point instead of creating a new point
const RUN_ENDING_EVENTS = ["death", "reset", "exit", "close"];
const STREAM_LIVE_DOT_SIZE = 7;
const STREAM_LIVE_COLORS = { live: "#4caf50", offline: "#e53935", unknown: "#9e9e9e" };
const TWITCH_LOGIN_REGEX = /twitch\.tv\/([a-z0-9_]{1,25})\/?(?:[?#]|$)/i;
const EVENT_MARKERS = {
  death: { icon: faSkull, color: DEATH_COLOR },
  reset: { icon: faReply, color: RESET_COLOR },
  win: { image: "/icons/goldenberry.gif", color: GOLDEN_COLOR },
  exit: { icon: faRightFromBracket, color: EXIT_COLOR },
  close: { icon: faPowerOff, color: EXIT_COLOR },
};

export function PageOnline() {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  const [layout, setLayout] = useLocalStorage("online_layout", "normal");
  const [longHistory, setLongHistory] = useLocalStorage("online_long_history", false);
  const [debugRoomNames, setDebugRoomNames] = useLocalStorage("online_debug_room_names", false);
  const historySize = longHistory ? HISTORY_SIZE_LONG : HISTORY_SIZE;
  const query = useGetOnlinePlayers(null, historySize);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const compact = layout === "compact";

  const entries = sortEntries(
    (getQueryData(query) ?? []).map((entry) => ({ ...entry, view: getRowView(entry) })),
  );
  const twitchQuery = useGetTwitchLiveStatus(getTwitchLogins(entries));

  return (
    <BasicContainerBox maxWidth="lg" modern>
      <HeadTitle title={t("title")} />
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mb: 1 }}>
        <Stack direction="column" alignItems="flex-start">
          <Typography variant="h4">{t("title")}</Typography>
          <ModalLink label={t("setup.link")} title={t("setup.title")}>
            <SetupInstructions />
          </ModalLink>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <RecentWinnersButton entries={entries} historySize={historySize} debugRoomNames={debugRoomNames} />
          <ButtonGroup>
            <LayoutButton
              icon={faTableList}
              label={t("layout.normal")}
              active={!compact}
              onClick={() => setLayout("normal")}
            />
            <LayoutButton
              icon={faBars}
              label={t("layout.compact")}
              active={compact}
              onClick={() => setLayout("compact")}
            />
          </ButtonGroup>
          <LayoutButton
            icon={faClockRotateLeft}
            label={t("long_history", { count: HISTORY_SIZE_LONG })}
            active={longHistory}
            onClick={() => setLongHistory((prev) => !prev)}
          />
          <LayoutButton
            icon={faBug}
            label={t("debug_room_names")}
            active={debugRoomNames}
            onClick={() => setDebugRoomNames((prev) => !prev)}
          />
        </Stack>
      </Stack>

      {query.isLoading ? (
        <LoadingSpinner />
      ) : query.isError ? (
        <ErrorDisplay error={query.error} />
      ) : entries.length === 0 ? (
        <OnlineSummary count={0} />
      ) : (
        <Stack direction="column" gap={compact ? 0.5 : 1}>
          <OnlineSummary count={entries.length} />
          {isMdUp && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: compact ? GRID_COLUMNS_COMPACT : GRID_COLUMNS,
                gap: 2,
                px: 2,
              }}
            >
              <Typography variant="subtitle2">{t("columns.player")}</Typography>
              <Typography variant="subtitle2">{t("columns.map")}</Typography>
              <Typography variant="subtitle2">{t("columns.challenge")}</Typography>
              <Typography variant="subtitle2" textAlign="center">
                {t("columns.status")}
              </Typography>
            </Box>
          )}
          {entries.map((entry) => (
            <OnlinePlayerRow
              key={entry.player.id}
              entry={entry}
              isMdUp={isMdUp}
              compact={compact}
              historySize={historySize}
              debugRoomNames={debugRoomNames}
              streamLive={getStreamLive(entry.stream_url, twitchQuery.data)}
            />
          ))}
        </Stack>
      )}
    </BasicContainerBox>
  );
}

function SetupInstructions() {
  const { t } = useTranslation(undefined, { keyPrefix: "online.setup" });
  const steps = Array.from({ length: SETUP_STEP_COUNT }, (_, i) => i + 1);

  return (
    <Stack direction="column" gap={2}>
      <Typography variant="body1">{t("intro")}</Typography>

      <Box component="ol" sx={{ m: 0, pl: 3, "& li": { py: 0.25 } }}>
        {steps.map((step) => (
          <Typography key={step} component="li" variant="body1">
            <Trans
              t={t}
              i18nKey={"steps." + step}
              components={{
                CctLink: <StyledExternalLink href={CCT_URL} isSafe />,
                b: <b />,
                Arrow: <FontAwesomeIcon icon={faArrowRight} fontSize="0.8em" style={{ margin: "0 4px" }} />,
              }}
            />
          </Typography>
        ))}
      </Box>

      <NoticeBox severity="success">{t("done")}</NoticeBox>

      <Stack direction="column" gap={0.5}>
        <Typography variant="h6">{t("details_header")}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t("when_sent")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("disable")}
        </Typography>
      </Stack>
    </Stack>
  );
}

// Amount of players online and a hint about the automatic refresh
function OnlineSummary({ count }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
      <Typography variant="body2" color="text.secondary">
        {t("players_online", { count })}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: PB_COLOR,
            boxShadow: "0 0 6px " + PB_COLOR,
          }}
        />
        {t("auto_update", { count: ONLINE_PLAYERS_REFRESH_SECONDS })}
      </Typography>
    </Stack>
  );
}

// Amount of recent winners, golden if there are any. Opens a dialog listing the recent wins
function RecentWinnersButton({ entries, historySize, debugRoomNames }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online.recent_winners" });
  const modal = useModal(null, undefined, { actions: [ModalButtons.close] });
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const wins = getRecentWins(entries);
  const count = new Set(wins.map((win) => win.player.id)).size;

  return (
    <>
      <Tooltip title={t("tooltip")} arrow>
        <Button
          variant={count > 0 ? "contained" : "outlined"}
          color={count > 0 ? "warning" : "primary"}
          onClick={() => modal.open()}
          // Less padding on the right, since the berry images have some transparent space on their right side
          sx={{ minWidth: "unset", gap: 0.75, lineHeight: 1, pl: 1.25, pr: "7px" }}
        >
          {count}
          {/* The berry only spins when someone won. Negative margins keep it from making the button taller */}
          <img
            src={count > 0 ? EVENT_MARKERS.win.image : "/icons/goldenberry-8x.png"}
            alt=""
            style={{ height: "1.4em", margin: "-0.2em 0" }}
          />
        </Button>
      </Tooltip>
      <CustomModal
        modalHook={modal}
        maxWidth="md"
        options={{ title: t("title") }}
        PaperProps={{ sx: { maxWidth: RECENT_WINS_DIALOG_WIDTH } }}
      >
        {wins.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            {t("none")}
          </Typography>
        ) : (
          <Stack direction="column" gap={1}>
            {wins.map((win) => (
              <RecentWinRow
                key={win.player.id + "-" + win.status.id}
                win={win}
                isMdUp={isMdUp}
                historySize={historySize}
                debugRoomNames={debugRoomNames}
              />
            ))}
          </Stack>
        )}
      </CustomModal>
    </>
  );
}

// Styled like a player row in the win state, but without the status column. The time of the win replaces the
// "Winner!" label next to the player name. Expands to a snapshot of the winning run, i.e. the same info as an
// expanded player row, but with the status updates ending at the win
function RecentWinRow({ win, isMdUp, historySize, debugRoomNames }) {
  const [expanded, setExpanded] = useState(false);
  const { player, status, statuses } = win;

  return (
    <Box
      sx={{
        border: "1px solid " + GOLDEN_COLOR,
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: WIN_BACKGROUND,
        boxShadow: "0 0 10px " + GOLDEN_COLOR + "66",
      }}
    >
      <Box
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          position: "relative",
          cursor: "pointer",
          "&:hover": { background: WIN_HOVER_BACKGROUND },
        }}
      >
        <RowBanner status={status} mode="win" isMdUp={isMdUp} />
        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: isMdUp ? RECENT_WIN_GRID_COLUMNS : "1fr",
            gap: isMdUp ? 2 : 0.75,
            alignItems: "center",
            px: 2,
            py: 1,
            fontSize: ROW_FONT_SIZES.body1,
            "& .MuiTypography-body1": { fontSize: ROW_FONT_SIZES.body1 },
            "& .MuiTypography-body2": { fontSize: ROW_FONT_SIZES.body2 },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="column" alignItems="flex-start" sx={getBannerChipSx(status, "win")}>
              <span onClick={stopPropagation}>
                <PlayerLink player={player} />
              </span>
              <DateRelativeTooltip date={status.date} sx={{ color: GOLDEN_COLOR }} />
            </Stack>
          </Box>
          <MapCell status={status} mode="win" />
          <ChallengeCell status={status} mode="win" alignRight={isMdUp} />
        </Box>
      </Box>
      <Collapse in={expanded} unmountOnExit>
        <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Stack direction="column" gap={2}>
            <CurrentRunInfo statuses={statuses} status={status} />
            <SessionHistoryGraph statuses={statuses} historySize={historySize} debugRoomNames={debugRoomNames} />
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

// All win events within the latest RECENT_WINS_SIZE status updates of each player, newest first. Each win also
// carries the player's status updates trimmed to end with the win (newest first), as a snapshot of the winning run
function getRecentWins(entries) {
  const wins = entries.flatMap((entry) =>
    entry.statuses
      .slice(0, RECENT_WINS_SIZE)
      .map((status, index) => ({ player: entry.player, status, statuses: entry.statuses.slice(index) }))
      .filter((win) => win.status.event === "win"),
  );
  const getTime = (win) => jsonDateToJsDate(win.status.date).getTime();
  return wins.sort((a, b) => getTime(b) - getTime(a));
}

// Icon-only toggle button. A regular Button (instead of an IconButton), so it can be used in a ButtonGroup
function LayoutButton({ icon, label, active, onClick, ...props }) {
  return (
    <Tooltip title={label} arrow>
      <CustomIconButton variant={active ? "contained" : "outlined"} onClick={onClick} {...props}>
        <FontAwesomeIcon icon={icon} />
      </CustomIconButton>
    </Tooltip>
  );
}

// Players that just won first, then players in a golden run, then by tier of the current challenge (hardest first)
function sortEntries(entries) {
  const winSort = (entry) => Number(entry.view.mode === "win");
  const goldenSort = (entry) => Number(entry.view.mode === "normal" && entry.view.status.in_golden_run);
  const tierSort = (entry) =>
    entry.view.mode === "overworld" ? -Infinity : (entry.view.status.challenge?.difficulty.sort ?? -Infinity);
  return [...entries].sort((a, b) => {
    const winDiff = winSort(b) - winSort(a);
    if (winDiff !== 0) return winDiff;
    const goldenDiff = goldenSort(b) - goldenSort(a);
    if (goldenDiff !== 0) return goldenDiff;
    return tierSort(b) - tierSort(a);
  });
}

function OnlinePlayerRow({ entry, isMdUp, compact, historySize, debugRoomNames, streamLive }) {
  const [expanded, setExpanded] = useState(false);
  const { status, mode } = entry.view;
  const isWin = mode === "win";

  return (
    <Box
      sx={{
        border: "1px solid " + (isWin ? GOLDEN_COLOR : "rgba(255,255,255,0.08)"),
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: isWin ? WIN_BACKGROUND : ROW_BACKGROUND,
        boxShadow: isWin ? "0 0 10px " + GOLDEN_COLOR + "66" : "none",
      }}
    >
      <Box
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          position: "relative",
          cursor: "pointer",
          "&:hover": { background: isWin ? WIN_HOVER_BACKGROUND : ROW_HOVER_BACKGROUND },
        }}
      >
        <RowBanner status={status} mode={mode} isMdUp={isMdUp} />
        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: isMdUp ? (compact ? GRID_COLUMNS_COMPACT : GRID_COLUMNS) : "1fr",
            gap: isMdUp ? 2 : 0.75,
            alignItems: "center",
            px: 2,
            py: compact ? 0.75 : 1,
            fontSize: ROW_FONT_SIZES.body1,
            "& .MuiTypography-body1": { fontSize: ROW_FONT_SIZES.body1 },
            "& .MuiTypography-body2": { fontSize: ROW_FONT_SIZES.body2 },
          }}
        >
          <PlayerCell entry={entry} status={status} mode={mode} streamLive={streamLive} />
          <MapCell status={status} mode={mode} />
          <ChallengeCell status={status} mode={mode} />
          <StatusCell status={status} mode={mode} compact={compact} debugRoomNames={debugRoomNames} />
        </Box>
      </Box>
      <Collapse in={expanded} unmountOnExit>
        <Box
          sx={{
            px: 2,
            pb: 2,
            pt: mode !== "overworld" ? 2 : 1,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Stack direction="column" gap={2}>
            {mode !== "overworld" && <CurrentRunInfo statuses={entry.statuses} status={status} />}
            <SessionHistoryGraph
              statuses={entry.statuses}
              historySize={historySize}
              debugRoomNames={debugRoomNames}
            />
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

// Darkened map (or campaign for full game challenges) image in the background of the player and map cells,
// fading out to the right (to the bottom on mobile)
function RowBanner({ status, mode, isMdUp }) {
  const challenge = mode === "overworld" ? null : status.challenge;
  const src = getBannerSrc(challenge);
  if (src === null) return null;
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: isMdUp ? BANNER_WIDTH : "100%",
        height: isMdUp ? "100%" : BANNER_MOBILE_HEIGHT,
        objectFit: "cover",
        pointerEvents: "none",
        filter: "brightness(" + BANNER_BRIGHTNESS + ")",
        maskImage: isMdUp
          ? "linear-gradient(to right, black 50%, transparent 100%)"
          : "linear-gradient(to bottom, black 40%, transparent 100%)",
      }}
    />
  );
}

// Prevents clicks on links from toggling the row
function stopPropagation(e) {
  e.stopPropagation();
}

function PlayerCell({ entry, status, mode, streamLive }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  const containerRef = useRef(null);
  const chipRef = useRef(null);
  const nameRef = useRef(null);
  const labelRef = useRef(null);
  const hasLabel = mode === "win" || (mode === "normal" && status.in_golden_run);
  const stacked = useIsLabelStacked(containerRef, chipRef, nameRef, labelRef, [hasLabel, entry.player.name]);

  return (
    <Box ref={containerRef} sx={{ minWidth: 0 }}>
      <Stack ref={chipRef} direction="column" alignItems="flex-start" sx={getBannerChipSx(status, mode)}>
        <Stack
          direction={stacked ? "column" : "row"}
          alignItems={stacked ? "flex-start" : "center"}
          columnGap={PLAYER_LABEL_GAP / 8}
        >
          <span ref={nameRef} onClick={stopPropagation}>
            <PlayerLink player={entry.player} />
          </span>
          {mode === "win" && (
            <Typography
              ref={labelRef}
              variant="body2"
              sx={{
                color: GOLDEN_COLOR,
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <img src={EVENT_MARKERS.win.image} alt="" style={{ height: "1.2em" }} />
              {t("events.win")}
            </Typography>
          )}
          {mode === "normal" && status.in_golden_run && (
            <Typography
              ref={labelRef}
              variant="body2"
              sx={{
                color: GOLDEN_COLOR,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <FontAwesomeIcon icon={faCircle} fontSize="0.6em" />
              {t("in_golden_run")}
            </Typography>
          )}
        </Stack>
        {entry.stream_url && <StreamLink url={entry.stream_url} live={streamLive} />}
      </Stack>
    </Box>
  );
}

// Whether the label next to the player name has to go into its own line. Done manually instead of with flex-wrap,
// since a wrapped flex container keeps its full width, making the banner chip behind it way too wide
function useIsLabelStacked(containerRef, chipRef, nameRef, labelRef, deps) {
  const [stacked, setStacked] = useState(false);
  useLayoutEffect(() => {
    const container = containerRef.current;
    const update = () => {
      const [chip, name, label] = [chipRef.current, nameRef.current, labelRef.current];
      if (!chip || !name || !label) {
        setStacked(false);
        return;
      }
      const style = getComputedStyle(chip);
      const available =
        container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      setStacked(name.offsetWidth + PLAYER_LABEL_GAP + label.offsetWidth > available);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return stacked;
}

function StreamLink({ url, live }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  const theme = useTheme();
  const platform = getLinkPlatform(url);
  return (
    <Stack direction="row" alignItems="center" gap={0.75} onClick={stopPropagation}>
      <StreamLiveDot live={live} />
      {/* Flex removes the baseline gap below the inline link, which would otherwise push the dot down */}
      <Typography variant="body2" sx={{ display: "flex" }}>
        <StyledExternalLink href={url} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <FontAwesomeIcon
            icon={platform?.icon ?? faLink}
            color={platform?.color ?? theme.palette.links.main}
          />
          {platform?.name ?? t("stream")}
        </StyledExternalLink>
      </Typography>
    </Stack>
  );
}

function StreamLiveDot({ live }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online.stream_status" });
  const state = live === true ? "live" : live === false ? "offline" : "unknown";
  return (
    <Tooltip title={t(state)} arrow placement="top">
      <Box
        sx={{
          width: STREAM_LIVE_DOT_SIZE,
          height: STREAM_LIVE_DOT_SIZE,
          flexShrink: 0,
          borderRadius: "50%",
          backgroundColor: STREAM_LIVE_COLORS[state],
          boxShadow: "0 0 6px " + STREAM_LIVE_COLORS[state] + "aa",
        }}
      />
    </Tooltip>
  );
}

function MapCell({ status, mode }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const challenge = status.challenge;

  if (mode === "overworld") {
    return <Typography variant="body1">{t("in_overworld")}</Typography>;
  }
  if (challenge === null) {
    return (
      <Stack direction="column">
        <Typography variant="body1">{t("unknown_map")}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>
          {status.map_name}
        </Typography>
      </Stack>
    );
  }

  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);
  const showMap = map && !isMapSameNameAsCampaign(map, campaign);
  return (
    <Stack direction="column" alignItems="flex-start" sx={getBannerChipSx(status, mode)}>
      {showMap && (
        <StyledLink to={"/map/" + map.id} onClick={stopPropagation}>
          <Typography variant="body1">{getMapName(map, campaign)}</Typography>
        </StyledLink>
      )}
      <StyledLink to={"/campaign/" + campaign.id} onClick={stopPropagation}>
        <Typography variant={showMap ? "body2" : "body1"} sx={{ fontSize: showMap ? "0.75rem" : "0.88rem" }}>
          {getCampaignName(campaign, t_g, true)}
        </Typography>
      </StyledLink>
    </Stack>
  );
}

function ChallengeCell({ status, mode, alignRight = false }) {
  const challenge = status.challenge;
  if (mode === "overworld" || challenge === null) {
    return (
      <Typography variant="body1" textAlign={alignRight ? "right" : "left"}>
        -
      </Typography>
    );
  }
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent={alignRight ? "flex-end" : "flex-start"}
      gap={1}
      flexWrap="wrap"
    >
      <StyledLink to={"/challenge/" + challenge.id} onClick={stopPropagation}>
        {getChallengeNameShort(challenge, true, false)}
      </StyledLink>
      <ChallengeFcIcon showClear allowTextIcons challenge={challenge} height="1.1em" />
      <DifficultyChip difficulty={challenge.difficulty} />
    </Stack>
  );
}

// Rooms are on the path if they have a room name. Rooms off the path show their debug name (if known).
// The compact label omits the custom room name and only shows the muted debug name for rooms off the path.
// With debugRoomNames, rooms on the path show only their debug name (if known) instead of the custom/room name
function RoomLabel({ status, compact = false, debugRoomNames = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  const { custom_room_name: customName, room_name: roomName, debug_room_name: debugName } = status;
  if (roomName !== null) {
    if (debugRoomNames && debugName !== null) return debugName;
    if (!compact && customName !== null && customName !== roomName) return customName + " (" + roomName + ")";
    return roomName;
  }
  if (compact) return <span style={{ color: NOT_ON_PATH_COLOR }}>{debugName ?? "-"}</span>;
  return (
    <>
      <span style={{ color: NOT_ON_PATH_COLOR }}>{t("not_on_path")}</span>
      {debugName !== null && " (" + debugName + ")"}
    </>
  );
}

function StatusCell({ status, mode, compact, debugRoomNames }) {
  if (mode === "overworld") {
    return (
      <Typography variant="body1" textAlign="center">
        -
      </Typography>
    );
  }
  // Map without a path: only the debug room name (if known) can be shown
  if (status.max_room_number === null) {
    const roomName = status.debug_room_name ?? status.room_name;
    if (compact) {
      return (
        <Typography variant="body2" textAlign="center" color="text.secondary" noWrap>
          {roomName ?? "-"}
        </Typography>
      );
    }
    return (
      <Stack direction="column" alignItems="center">
        <Typography variant="body1">-</Typography>
        {roomName !== null && (
          <Typography variant="body2" color="text.secondary">
            {roomName}
          </Typography>
        )}
      </Stack>
    );
  }

  // Compact: room numbers, progress bar and room name in a single line
  if (compact) {
    return (
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
          {status.room_number ?? "-"} / {status.max_room_number}
        </Typography>
        <Box sx={{ flex: "1 1 60px", minWidth: 40 }}>
          <RoomProgressBar status={status} compact />
        </Box>
        <Typography variant="body2" noWrap sx={{ flex: "0 1 auto", minWidth: 0 }}>
          <RoomLabel status={status} compact debugRoomNames={debugRoomNames} />
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack direction="column" alignItems="center" gap={0.25}>
      <Typography variant="body1">
        {status.room_number ?? "-"} / {status.max_room_number}
      </Typography>
      <RoomProgressBar status={status} />
      <Typography variant="body2" textAlign="center">
        <RoomLabel status={status} debugRoomNames={debugRoomNames} />
      </Typography>
    </Stack>
  );
}

// The compact bar doesn't label its PB markers
function RoomProgressBar({ status, compact = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  const theme = useTheme();
  const max = status.max_room_number;
  const toPercent = (room) => Math.min(100, Math.max(0, (room / max) * 100)) + "%";
  // Keep markers out of the rounded ends, otherwise a marker at the very start/end sits outside the visible bar
  const toMarkerPosition = (room) =>
    `clamp(${PROGRESS_BAR_RADIUS + 1}px, ${toPercent(room)}, calc(100% - ${PROGRESS_BAR_RADIUS + 1}px))`;

  const markers = [];
  const sessionPb = status.session_pb_room_number;
  const overallPb = status.overall_pb_room_number;
  if (overallPb !== null) markers.push({ room: overallPb, label: t("pb"), align: "center" });
  if (sessionPb !== null && sessionPb !== overallPb) {
    markers.push({ room: sessionPb, label: t("session_pb"), align: "center" });
    // When both markers are close together, the labels grow away from each other instead of being centered
    if (overallPb !== null && (Math.abs(sessionPb - overallPb) / max) * 100 < MARKER_LABEL_MIN_DISTANCE) {
      const sessionIsLeft = sessionPb < overallPb;
      markers[0].align = sessionIsLeft ? "right" : "left";
      markers[1].align = sessionIsLeft ? "left" : "right";
    }
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: compact ? "none" : 200,
        pb: markers.length > 0 && !compact ? 1.5 : 0,
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 10,
          borderRadius: PROGRESS_BAR_RADIUS + "px",
          border: "1px solid " + theme.palette.box.border,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: toPercent(status.room_number ?? 0),
            background: status.in_golden_run ? GOLDEN_COLOR : PROGRESS_COLOR,
            transition: "width 0.3s",
          }}
        />
      </Box>
      {markers.map((marker) => (
        <Tooltip
          key={marker.label}
          title={marker.label + ": " + marker.room + " / " + max}
          arrow
          placement="top"
        >
          <Box
            sx={{
              position: "absolute",
              top: -2,
              left: toMarkerPosition(marker.room),
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 2,
                height: 14,
                background: PB_COLOR,
                borderRadius: 1,
              }}
            />
            {!compact && (
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: 14,
                  left: "50%",
                  transform: MARKER_LABEL_TRANSFORMS[marker.align],
                  color: PB_COLOR,
                  fontSize: "0.6rem",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {marker.label}
              </Typography>
            )}
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
}

// "right" means the label sits right of the marker (growing to the right), "left" the opposite
const MARKER_LABEL_TRANSFORMS = {
  center: "translateX(-50%)",
  right: "translateX(-1px)",
  left: "translateX(calc(-100% + 1px))",
};

// Info about the current room and run, shown above the session history graph
function CurrentRunInfo({ statuses, status }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  const { room_name: roomName, custom_room_name: customName, debug_room_name: debugName } = status;
  const map = status.challenge?.map ?? null;
  const runDuration = getRunDuration(statuses, status);
  const formatPb = (room) => {
    if (room === null) return "-";
    return status.max_room_number === null ? room : room + " / " + status.max_room_number;
  };

  return (
    <Stack direction="column" gap={1}>
      <InfoTileRow>
        <InfoTile icon={faDoorOpen} label={t("info.room")}>
          {roomName ?? <span style={{ color: NOT_ON_PATH_COLOR }}>{t("not_on_path")}</span>}
        </InfoTile>
        {customName !== null && (
          <InfoTile icon={faTag} label={t("info.custom_room_name")}>
            {customName}
          </InfoTile>
        )}
        <InfoTile icon={faBug} label={t("info.debug_room_name")}>
          <Stack direction="row" alignItems="center" gap={1}>
            <span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{debugName ?? "-"}</span>
            {map !== null && debugName !== null && (
              <Tooltip title={t("info.open_map_viewer")} arrow placement="top">
                <span>
                  <StyledLink to={"/map/" + map.id + "/view/" + encodeURIComponent(debugName)}>
                    <FontAwesomeIcon icon={faMapLocationDot} />
                  </StyledLink>
                </span>
              </Tooltip>
            )}
          </Stack>
        </InfoTile>
      </InfoTileRow>
      <InfoTileRow>
        <InfoTile icon={faStopwatch} label={t("info.run_duration")}>
          {runDuration === null ? "-" : secondsToDuration(runDuration, true)}
        </InfoTile>
        <InfoTile icon={faFlag} label={t("info.session_pb")}>
          {formatPb(status.session_pb_room_number)}
        </InfoTile>
        <InfoTile icon={faTrophy} label={t("info.overall_pb")}>
          {formatPb(status.overall_pb_room_number)}
        </InfoTile>
      </InfoTileRow>
    </Stack>
  );
}

function InfoTileRow({ children }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 1,
      }}
    >
      {children}
    </Box>
  );
}

function InfoTile({ icon, label, children }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        minWidth: 0,
        background: theme.palette.stats.chartBackdrop,
        borderRadius: 2,
        px: 1.5,
        py: 1,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        <FontAwesomeIcon icon={icon} />
        {label}
      </Typography>
      <Typography variant="body1" component="div" sx={{ wordBreak: "break-word" }}>
        {children}
      </Typography>
    </Box>
  );
}

// Returns the most recent run of statuses (newest first) that are on the same challenge (or unknown map) as the
// latest one. Main menu statuses at the start are skipped, so the last played challenge is shown instead
function getCurrentChallengeStatuses(statuses) {
  const isInMenu = (status) => status.challenge_id === null && status.map_name === null;
  const start = statuses.findIndex((status) => !isInMenu(status));
  if (start === -1) return statuses;

  const anchor = statuses[start];
  const isSame = (status) =>
    anchor.challenge_id !== null
      ? status.challenge_id === anchor.challenge_id
      : status.challenge_id === null && status.map_name === anchor.map_name;
  const rest = statuses.slice(start);
  const end = rest.findIndex((status) => !isSame(status));
  return end === -1 ? rest : rest.slice(0, end);
}

// Builds the chart data oldest first. Run-ending events (death, reset, win, exit, close) don't create a new point, but are
// attached as markers to the previous point. The line is split after such a point by inserting a gap point.
// Segments between two points that are both in a golden run are drawn golden (via goldenRoom).
// The x position of a point is the number of its status update (oldest = 1)
// Every point also carries the session/overall PB at that time, so the PB lines visibly get pushed up by a run.
// The PB lines are continued through gap points and extended to maxIndex with a trailing point.
// Picking up the golden sends a status update in the same room, so the point right before it is dropped,
// otherwise every run would start with a flat line segment.
function buildHistoryData(statuses, maxIndex) {
  const data = [];
  let previous = null;
  for (const [i, status] of [...statuses].reverse().entries()) {
    const index = i + 1;
    const time = jsonDateToJsDate(status.date).getTime();
    const isMarkerEvent = EVENT_MARKERS[status.event] !== undefined;

    if (isMarkerEvent && previous !== null) {
      // The exit marker would only clutter the golden berry
      if (!(status.event === "exit" && previous.events.includes("win"))) {
        previous.events.push(status.event);
      }
      continue;
    }

    const isRunStart =
      previous !== null &&
      previous.events.length === 0 &&
      !previous.status.in_golden_run &&
      status.in_golden_run &&
      previous.room === status.room_number;
    if (isRunStart) data.pop();

    if (previous !== null && previous.events.length > 0) {
      data.push({
        index: (previous.index + index) / 2,
        time: (previous.time + time) / 2,
        room: null,
        status: null,
        events: [],
        sessionPb: previous.sessionPb,
        overallPb: previous.overallPb,
      });
    }
    const point = {
      index,
      time,
      room: status.room_number,
      status,
      events: isMarkerEvent ? [status.event] : [],
      sessionPb: status.session_pb_room_number,
      overallPb: status.overall_pb_room_number,
    };
    data.push(point);
    previous = point;
  }

  const isGolden = (point) => point?.status?.in_golden_run === true && point.room !== null;
  data.forEach((point, index) => {
    const connected = isGolden(data[index - 1]) || isGolden(data[index + 1]);
    point.goldenRoom = isGolden(point) && connected ? point.room : null;
  });

  const last = data.at(-1);
  if (last !== undefined && last.index < maxIndex) {
    data.push({
      index: maxIndex,
      time: last.time,
      room: null,
      goldenRoom: null,
      status: null,
      events: [],
      sessionPb: last.sessionPb,
      overallPb: last.overallPb,
    });
  }
  return data;
}

function SessionHistoryGraph({ statuses, historySize, debugRoomNames }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  const theme = useTheme();
  const latest = statuses[0];

  const challengeStatuses = getCurrentChallengeStatuses(statuses);
  const maxRoom = Math.max(...challengeStatuses.map((s) => s.max_room_number ?? s.room_number ?? 1), 2);
  // Always reserve the space of a full history, so a handful of updates isn't stretched over the full width
  const maxIndex = Math.max(challengeStatuses.length, historySize);
  const data = buildHistoryData(challengeStatuses, maxIndex);
  const tickStep = historySize / HISTORY_TICK_COUNT;
  const xTicks = [1];
  for (let tick = tickStep; tick <= maxIndex; tick += tickStep) xTicks.push(tick);
  // Quarters of the room range (the first room is 1), rounded to the nearest room
  const yTicks = [
    ...new Set([0, 0.25, 0.5, 0.75, 1].map((fraction) => 1 + Math.round((maxRoom - 1) * fraction))),
  ];
  const sessionPb = latest.session_pb_room_number;
  const overallPb = latest.overall_pb_room_number;

  const formatTime = (time) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h6">{t("session_history")}</Typography>
      <Box
        sx={{
          width: "100%",
          background: theme.palette.stats.chartBackdrop,
          borderRadius: 2,
        }}
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 20, right: 80, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 8" vertical={false} />
            <XAxis
              dataKey="index"
              type="number"
              domain={[1, maxIndex]}
              ticks={xTicks}
              tick={{ fill: theme.palette.text.secondary }}
              height={45}
              label={{
                value: t("graph.x_axis"),
                position: "insideBottom",
                fill: theme.palette.text.secondary,
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              domain={[1, maxRoom]}
              ticks={yTicks}
              tick={{ fill: theme.palette.text.secondary }}
              label={{
                value: t("graph.y_axis"),
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
                fill: theme.palette.text.secondary,
                fontSize: 12,
              }}
            />
            <ChartTooltip
              content={<HistoryTooltip formatTime={formatTime} debugRoomNames={debugRoomNames} />}
            />
            {/* The session PB line is drawn below the overall PB line, so it's hidden where both are equal */}
            <Line
              type="linear"
              dataKey="sessionPb"
              stroke={PB_COLOR}
              strokeOpacity={0.6}
              strokeWidth={1}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              label={
                <PbLineLabel
                  lastIndex={data.length - 1}
                  text={sessionPb !== null && sessionPb !== overallPb ? t("session_pb") : null}
                />
              }
            />
            <Line
              type="linear"
              dataKey="overallPb"
              stroke={PB_COLOR}
              strokeWidth={1}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              label={<PbLineLabel lastIndex={data.length - 1} text={t("pb")} />}
            />
            <Line
              type="linear"
              dataKey="room"
              stroke={theme.palette.text.primary}
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="goldenRoom"
              stroke={GOLDEN_COLOR}
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            {/* Invisible line that renders the event markers on top of both lines */}
            <Line
              type="linear"
              dataKey="room"
              stroke="transparent"
              dot={<EventDot />}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  );
}

// Labels a PB line at its right end, in the chart's right margin
function PbLineLabel({ x, y, index, value, lastIndex, text }) {
  if (index !== lastIndex || text === null || value === null || value === undefined) return null;
  return (
    <text x={x + 6} y={y} dy={4} fill={PB_COLOR} fontSize={12}>
      {text}
    </text>
  );
}

function HistoryTooltip({ active, payload, formatTime, debugRoomNames }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  if (!active || !payload || payload.length === 0) return null;
  const { time, status, events } = payload[0].payload;
  if (status === null) return null;
  return (
    <Box
      sx={{
        background: "rgba(30,30,30,0.95)",
        border: "1px solid #555",
        borderRadius: 1,
        px: 1,
        py: 0.5,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {formatTime(time)}
      </Typography>
      <Typography variant="body2">
        {t("room")}: {status.room_number ?? "-"}
        {status.max_room_number !== null && " / " + status.max_room_number}
      </Typography>
      <Typography variant="body2">
        <RoomLabel status={status} debugRoomNames={debugRoomNames} />
      </Typography>
      {status.in_golden_run && (
        <Typography variant="body2" sx={{ color: GOLDEN_COLOR }}>
          <FontAwesomeIcon icon={faCircle} fontSize="0.6em" style={{ verticalAlign: "middle" }} />{" "}
          {t("in_golden_run")}
        </Typography>
      )}
      {events.map((event, index) => (
        <Typography key={index} variant="body2" sx={{ color: EVENT_MARKERS[event].color }}>
          <EventIcon event={event} /> {t("events." + event)}
        </Typography>
      ))}
    </Box>
  );
}

function EventIcon({ event }) {
  const marker = EVENT_MARKERS[event];
  if (marker.image) {
    return <img src={marker.image} alt={event} style={{ height: "1em", verticalAlign: "middle" }} />;
  }
  return <FontAwesomeIcon icon={marker.icon} />;
}

// Renders the markers of all events attached to a point, side by side if there are multiple
function EventDot({ cx, cy, payload }) {
  if (!payload?.events?.length || cx == null || cy == null) return null;
  const spacing = EVENT_ICON_SIZE + 4;
  const firstX = cx - ((payload.events.length - 1) * spacing) / 2;
  return (
    <g>
      {payload.events.map((event, index) => {
        const marker = EVENT_MARKERS[event];
        const size = marker.image ? GOLDEN_GIF_SIZE : EVENT_ICON_SIZE;
        const x = firstX + index * spacing - size / 2;
        const y = cy - size / 2;
        if (marker.image) {
          return <image key={index} href={marker.image} x={x} y={y} width={size} height={size} />;
        }
        const [width, height, , , path] = marker.icon.icon;
        return (
          <svg key={index} x={x} y={y} width={size} height={size} viewBox={`0 0 ${width} ${height}`}>
            <path d={path} fill={marker.color} />
          </svg>
        );
      })}
    </g>
  );
}

//#region Utility Functions
// Determines what the row of a player should show:
// - "win": the last run contained a win and nothing but an exit came after it. Shows the last real status
// - "overworld": the player exited the map (or sent a status without a location)
// - "normal": the latest status
function getRowView(entry) {
  const statuses = entry.statuses;
  const latest = statuses[0];
  if (latest.event === "win") {
    return { status: latest, mode: "win" };
  }
  if (latest.event === "exit") {
    for (let i = 1; i < statuses.length; i++) {
      const status = statuses[i];
      if (status.event === "win") return { status: statuses[1], mode: "win" };
      if (RUN_ENDING_EVENTS.includes(status.event) || !isSameLocation(status, latest)) break;
    }
    return { status: latest, mode: "overworld" };
  }
  if (latest.challenge_id === null && latest.map_name === null) {
    return { status: latest, mode: "overworld" };
  }
  return { status: latest, mode: "normal" };
}

// Dark chip behind cells that lie on top of the banner image, to keep the text readable
function getBannerChipSx(status, mode) {
  if (mode === "overworld" || getBannerSrc(status.challenge) === null) return {};
  return {
    width: "fit-content",
    maxWidth: "100%",
    background: BANNER_CHIP_BACKGROUND,
    borderRadius: 1,
    px: 1,
    py: 0.25,
    // Keep the text aligned with rows without a banner
    mx: -1,
    my: -0.25,
  };
}

// Seconds between the first status of the current run and the latest status. A run starts after a run-ending event
// (or a win) or after changing the location. During a golden run, the run starts with its first golden status, so
// practice before the golden run isn't counted. Returns null if the latest status ended the run
function getRunDuration(statuses, status) {
  const index = statuses.indexOf(status);
  if (index !== 0 || EVENT_MARKERS[status.event] !== undefined) return null;
  let start = status;
  for (let i = index + 1; i < statuses.length; i++) {
    const previous = statuses[i];
    if (EVENT_MARKERS[previous.event] !== undefined || !isSameLocation(previous, status)) break;
    if (status.in_golden_run && !previous.in_golden_run) break;
    start = previous;
  }
  const diff = jsonDateToJsDate(status.date).getTime() - jsonDateToJsDate(start.date).getTime();
  return Math.max(0, Math.round(diff / 1000));
}

function isSameLocation(a, b) {
  return a.challenge_id === b.challenge_id && a.map_name === b.map_name;
}

function getBannerSrc(challenge) {
  if (!challenge) return null;
  if (challenge.map) return API_BASE_URL + "/img/map/" + challenge.map.id + "&scale=2";
  return getGamebananaEmbedUrl(getChallengeCampaign(challenge)?.url ?? null, "large");
}
//#endregion

function getTwitchLogin(url) {
  return url?.match(TWITCH_LOGIN_REGEX)?.[1].toLowerCase() ?? null;
}

// Sorted to keep the query key stable when the order of the entries changes
function getTwitchLogins(entries) {
  const logins = entries.map((entry) => getTwitchLogin(entry.stream_url)).filter((login) => login !== null);
  return [...new Set(logins)].sort();
}

// true = live, false = offline, null = unknown (unsupported platform, unparseable URL or failed request)
function getStreamLive(url, twitchLiveStatus) {
  const login = getTwitchLogin(url);
  if (login === null || !twitchLiveStatus) return null;
  return twitchLiveStatus[login] ?? null;
}

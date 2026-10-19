import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Collapse, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@emotion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBug,
  faCircle,
  faDoorOpen,
  faLink,
  faMapLocationDot,
  faReply,
  faRightFromBracket,
  faSkull,
  faStopwatch,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getQueryData, useGetOnlinePlayers } from "../hooks/useApi";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
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

const GRID_COLUMNS = "minmax(140px, 1.2fr) 2fr 2fr minmax(180px, 1.3fr)";
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
const PROGRESS_BAR_RADIUS = 5;
// Markers closer than this (in % of the bar) get their labels pushed apart to avoid overlapping
const MARKER_LABEL_MIN_DISTANCE = 15;
const DEATH_COLOR = "#e53935";
const RESET_COLOR = "#90caf9";
const EXIT_COLOR = "#bdbdbd";
const NOT_ON_PATH_COLOR = "rgba(255,255,255,0.45)";
const EVENT_ICON_SIZE = 14;
const GOLDEN_GIF_SIZE = 20;
// Events that end the current run. They are rendered as markers on the last point instead of creating a new point
const RUN_ENDING_EVENTS = ["death", "reset", "exit"];
const EVENT_MARKERS = {
  death: { icon: faSkull, color: DEATH_COLOR },
  reset: { icon: faReply, color: RESET_COLOR },
  win: { image: "/icons/goldenberry.gif", color: GOLDEN_COLOR },
  exit: { icon: faRightFromBracket, color: EXIT_COLOR },
};

export function PageOnline() {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  const query = useGetOnlinePlayers();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const entries = sortEntries(
    (getQueryData(query) ?? []).map((entry) => ({ ...entry, view: getRowView(entry) })),
  );

  return (
    <BasicContainerBox maxWidth="lg" modern>
      <HeadTitle title={t("title")} />
      <Typography variant="h4" gutterBottom>
        {t("title")}
      </Typography>

      {query.isLoading ? (
        <LoadingSpinner />
      ) : query.isError ? (
        <ErrorDisplay error={query.error} />
      ) : entries.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          {t("no_players")}
        </Typography>
      ) : (
        <Stack direction="column" gap={1}>
          {isMdUp && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: GRID_COLUMNS,
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
            <OnlinePlayerRow key={entry.player.id} entry={entry} isMdUp={isMdUp} />
          ))}
        </Stack>
      )}
    </BasicContainerBox>
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

function OnlinePlayerRow({ entry, isMdUp }) {
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
            gridTemplateColumns: isMdUp ? GRID_COLUMNS : "1fr",
            gap: isMdUp ? 2 : 1,
            alignItems: "center",
            px: 2,
            py: 1.5,
          }}
        >
          <PlayerCell entry={entry} status={status} mode={mode} />
          <MapCell status={status} mode={mode} />
          <ChallengeCell status={status} mode={mode} />
          <StatusCell status={status} mode={mode} />
        </Box>
      </Box>
      <Collapse in={expanded} unmountOnExit>
        <Box
          sx={{
            px: 2,
            pb: 2,
            pt: 1,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Stack direction="column" gap={2}>
            {mode !== "overworld" && <CurrentRunInfo statuses={entry.statuses} status={status} />}
            <SessionHistoryGraph statuses={entry.statuses} />
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

function PlayerCell({ entry, status, mode }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  return (
    <Stack direction="column" alignItems="flex-start" sx={getBannerChipSx(status, mode)}>
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <span onClick={stopPropagation}>
          <PlayerLink player={entry.player} />
        </span>
        {mode === "win" && (
          <Typography
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
      {entry.stream_url && <StreamLink url={entry.stream_url} />}
    </Stack>
  );
}

function StreamLink({ url }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  const theme = useTheme();
  const platform = getLinkPlatform(url);
  return (
    <Typography variant="body2" onClick={stopPropagation}>
      <StyledExternalLink href={url} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <FontAwesomeIcon
          icon={platform?.icon ?? faLink}
          color={platform?.color ?? theme.palette.links.main}
        />
        {platform?.name ?? t("stream")}
      </StyledExternalLink>
    </Typography>
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
        <Typography variant={showMap ? "body2" : "body1"}>{getCampaignName(campaign, t_g, true)}</Typography>
      </StyledLink>
    </Stack>
  );
}

function ChallengeCell({ status, mode }) {
  const challenge = status.challenge;
  if (mode === "overworld" || challenge === null) {
    return <Typography variant="body1">-</Typography>;
  }
  return (
    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
      <StyledLink to={"/challenge/" + challenge.id} onClick={stopPropagation}>
        {getChallengeNameShort(challenge, true, false)}
      </StyledLink>
      <ChallengeFcIcon showClear allowTextIcons challenge={challenge} height="1.1em" />
      <DifficultyChip difficulty={challenge.difficulty} />
    </Stack>
  );
}

// Rooms are on the path if they have a room name. Rooms off the path show their debug name (if known)
function RoomLabel({ status }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  const { custom_room_name: customName, room_name: roomName, debug_room_name: debugName } = status;
  if (roomName !== null) {
    if (customName !== null && customName !== roomName) return customName + " (" + roomName + ")";
    return roomName;
  }
  return (
    <>
      <span style={{ color: NOT_ON_PATH_COLOR }}>{t("not_on_path")}</span>
      {debugName !== null && " (" + debugName + ")"}
    </>
  );
}

function StatusCell({ status, mode }) {
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

  return (
    <Stack direction="column" alignItems="center" gap={0.25}>
      <Typography variant="body1">
        {status.room_number ?? "-"} / {status.max_room_number}
      </Typography>
      <RoomProgressBar status={status} />
      <Typography variant="body2" textAlign="center" sx={{ mt: 0.5 }}>
        <RoomLabel status={status} />
      </Typography>
    </Stack>
  );
}

function RoomProgressBar({ status }) {
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
        maxWidth: 200,
        pb: markers.length > 0 ? 1.5 : 0,
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

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 1,
      }}
    >
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
      <InfoTile icon={faStopwatch} label={t("info.run_duration")}>
        {runDuration === null ? "-" : secondsToDuration(runDuration, true)}
      </InfoTile>
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

// Builds the chart data oldest first. Run-ending events (death, reset, win, exit) don't create a new point, but are
// attached as markers to the previous point. The line is split after such a point by inserting a gap point.
// Segments between two points that are both in a golden run are drawn golden (via goldenRoom)
function buildHistoryData(statuses) {
  const data = [];
  let previous = null;
  for (const status of [...statuses].reverse()) {
    const time = jsonDateToJsDate(status.date).getTime();
    const isMarkerEvent = EVENT_MARKERS[status.event] !== undefined;

    if (isMarkerEvent && previous !== null) {
      // The exit marker would only clutter the golden berry
      if (!(status.event === "exit" && previous.events.includes("win"))) {
        previous.events.push(status.event);
      }
      continue;
    }

    if (previous !== null && previous.events.length > 0) {
      data.push({
        time: (previous.time + time) / 2,
        room: null,
        status: null,
        events: [],
      });
    }
    const point = {
      time,
      room: status.room_number,
      status,
      events: isMarkerEvent ? [status.event] : [],
    };
    data.push(point);
    previous = point;
  }

  const isGolden = (point) => point?.status?.in_golden_run === true && point.room !== null;
  data.forEach((point, index) => {
    const connected = isGolden(data[index - 1]) || isGolden(data[index + 1]);
    point.goldenRoom = isGolden(point) && connected ? point.room : null;
  });
  return data;
}

function SessionHistoryGraph({ statuses }) {
  const { t } = useTranslation(undefined, { keyPrefix: "online" });
  const theme = useTheme();
  const latest = statuses[0];

  const challengeStatuses = getCurrentChallengeStatuses(statuses);
  const data = buildHistoryData(challengeStatuses);
  const maxRoom = Math.max(...challengeStatuses.map((s) => s.max_room_number ?? s.room_number ?? 0), 1);
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
          <LineChart data={data} margin={{ top: 20, right: 80, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 8" vertical={false} />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={formatTime}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis
              type="number"
              domain={[0, maxRoom]}
              allowDecimals={false}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <ChartTooltip content={<HistoryTooltip formatTime={formatTime} />} />
            {sessionPb !== null && sessionPb !== overallPb && (
              <ReferenceLine
                y={sessionPb}
                stroke={PB_COLOR}
                strokeOpacity={0.6}
                label={{
                  value: t("session_pb"),
                  position: "right",
                  fill: PB_COLOR,
                  fontSize: 12,
                }}
              />
            )}
            {overallPb !== null && (
              <ReferenceLine
                y={overallPb}
                stroke={PB_COLOR}
                label={{
                  value: t("pb"),
                  position: "right",
                  fill: PB_COLOR,
                  fontSize: 12,
                }}
              />
            )}
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

function HistoryTooltip({ active, payload, formatTime }) {
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
        <RoomLabel status={status} />
      </Typography>
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
    py: 0.5,
    // Keep the text aligned with rows without a banner
    mx: -1,
    my: -0.5,
  };
}

// Seconds between the first status of the current run and the latest status. A run starts after a run-ending event
// (or a win) or after changing the location. Returns null if the latest status ended the run
function getRunDuration(statuses, status) {
  const index = statuses.indexOf(status);
  if (index !== 0 || EVENT_MARKERS[status.event] !== undefined) return null;
  let start = status;
  for (let i = index + 1; i < statuses.length; i++) {
    const previous = statuses[i];
    if (EVENT_MARKERS[previous.event] !== undefined || !isSameLocation(previous, status)) break;
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

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useAuth } from "../hooks/AuthProvider";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledLink,
  TooltipInfoButton,
} from "../components/basic";
import { BadgeAsync } from "../components/badge";
import { EmoteImage, PlayerSubmissionSelect, SubmissionEmbed } from "../components/goldberries";
import {
  getQueryData,
  useDeleteStampSubmission,
  useGetPlayer,
  useGetStampSubmissionsForPlayer,
  usePostStampSubmission,
} from "../hooks/useApi";
import { STAMPS } from "../util/constants";
import { getPlayerNameColorStyle } from "../util/data_util";

const STAMP_COUNT = 10;
const STAMP_IMAGE_SIZE = 128;

export function PageSummerStampRalley() {
  const { playerId } = useParams();

  return (
    <BasicContainerBox maxWidth="lg" sx={{ background: "#333333" }}>
      <HeadTitle title="Summer Stamp Rally" />
      <SummerStampRalleyPlayer playerId={playerId} />
    </BasicContainerBox>
  );
}

function SummerStampRalleyPlayer({ playerId }) {
  const { settings } = useAppSettings();
  const playerQuery = useGetPlayer(playerId);
  const stampsQuery = useGetStampSubmissionsForPlayer(playerId);
  const stamps = getQueryData(stampsQuery) ?? [];
  const stampData = useMemo(
    () => calculateStampData(stamps.map((s) => s.submission).filter(Boolean)),
    [stamps],
  );

  if (playerQuery.isLoading || stampsQuery.isLoading) return <LoadingSpinner />;
  if (playerQuery.isError) return <ErrorDisplay error={playerQuery.error} />;
  if (stampsQuery.isError) return <ErrorDisplay error={stampsQuery.error} />;

  const player = getQueryData(playerQuery);
  const nameStyle = getPlayerNameColorStyle(player, settings);

  return (
    <Stack direction="column" gap={3}>
      <EventDetailsHeader />
      <Stack direction="row" justifyContent="center">
        <Typography
          component={Link}
          to={`/player/${player.id}`}
          variant="h4"
          sx={{
            fontWeight: "bold",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
            ...nameStyle,
          }}
        >
          {player.name}
        </Typography>
      </Stack>
      <TotalTierProgress
        totalTier={stampData.totalTier}
        averageTier={stampData.averageTier}
        stampCount={stampData.count}
      />
      <Divider sx={{ borderColor: "#c3c3c3" }} />
      <StampGrid playerId={player.id} stamps={stamps} />
    </Stack>
  );
}

function EventDetailsHeader() {
  const { t } = useTranslation(undefined, { keyPrefix: "event.sss26" });

  return (
    <Box>
      <Box
        component="img"
        src="/img/stamp/banner.png"
        alt="Summer Stamp Rally"
        sx={{ display: "block", width: "100%", maxWidth: 300, height: "auto", mb: 2, mx: "auto" }}
      />
      <Typography variant="body2" color="text.secondary" paragraph>
        <Trans t={t} i18nKey="description" components={{ announcementsLink: <StyledLink to="/news/57" /> }} />
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t("runtime")}
      </Typography>
    </Box>
  );
}

function StampGrid({ playerId, stamps }) {
  const stampsById = useMemo(() => {
    const map = {};
    for (const stamp of stamps) {
      map[stamp.stamp_id] = stamp;
    }
    return map;
  }, [stamps]);

  return (
    <Grid container spacing={3}>
      {Array.from({ length: STAMP_COUNT }, (_, i) => (
        <Grid item xs={12} md={6} key={i}>
          <StampEntry playerId={playerId} stampId={i} stampSubmission={stampsById[i]} />
        </Grid>
      ))}
    </Grid>
  );
}

function StampEntry({ playerId, stampId, stampSubmission }) {
  const { t } = useTranslation(undefined, { keyPrefix: "event.sss26" });
  const auth = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const info = { ...STAMPS[stampId], ...(t(`stamps.${stampId}`, { returnObjects: true }) ?? {}) };
  const hasSubmission = !!stampSubmission;
  const submission = stampSubmission?.submission ?? null;
  const accentColor = info?.accent;
  const accentGlowFilter = getAccentGlowFilter(hasSubmission, accentColor);
  const border = stampId > 1 ? { borderTop: "3px solid", borderColor: "#c3c3c3", pt: 1.5 } : {};

  return (
    <Box sx={border}>
      <Stack direction="column" gap={1}>
        <Stack direction="row" alignItems="flex-start" gap={1}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {info?.name}
            </Typography>
            <Stack direction="row" gap={0.75} color="text.secondary" alignItems="center">
              <Typography variant="caption">{info?.description}</Typography>
              {info.extraInfo && <TooltipInfoButton title={info.extraInfo} fontSize="0.85rem" />}
            </Stack>
          </Box>
          {auth.hasHelperPriv && (
            <Tooltip title={t("edit_stamp_tooltip")}>
              <IconButton size="small" onClick={() => setEditOpen(true)}>
                <FontAwesomeIcon icon={faPen} fontSize="1rem" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={4} sm={3}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <StampImage stampId={stampId} hasSubmission={hasSubmission} info={info} />
            </Box>
          </Grid>
          <Grid item xs={8} sm={9}>
            <Box
              sx={{
                minHeight: STAMP_IMAGE_SIZE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {submission ? (
                <StyledLink to={`/submission/${submission.id}`} sx={{ width: "100%" }}>
                  <SubmissionEmbed
                    submission={submission}
                    style={{
                      width: "100%",
                      border: `4px solid ${accentColor ?? "#c3c3c3"}`,
                    }}
                  />
                </StyledLink>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t("empty_submission")}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Stack>
      {auth.hasHelperPriv && (
        <EditStampSubmissionDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          playerId={playerId}
          stampId={stampId}
          stampSubmission={stampSubmission}
        />
      )}
    </Box>
  );
}

function EditStampSubmissionDialog({ open, onClose, playerId, stampId, stampSubmission }) {
  const { t } = useTranslation(undefined, { keyPrefix: "event.sss26" });
  const info = { ...STAMPS[stampId], ...(t(`stamps.${stampId}`, { returnObjects: true }) ?? {}) };
  const currentSubmission = stampSubmission?.submission ?? null;
  const [selectedSubmission, setSelectedSubmission] = useState(currentSubmission);

  const { mutate: postStamp, isLoading: isAssigning } = usePostStampSubmission(() => onClose());
  const { mutate: deleteStamp, isLoading: isDeleting } = useDeleteStampSubmission(() => onClose());

  const onAssign = () => {
    if (!selectedSubmission) return;
    postStamp({
      id: stampSubmission?.id,
      stamp_id: stampId,
      submission_id: selectedSubmission.id,
      player_id: playerId,
    });
  };
  const onRemove = () => {
    if (!stampSubmission) return;
    deleteStamp(stampSubmission.id);
  };

  const busy = isAssigning || isDeleting;

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      disableScrollLock
      TransitionProps={{ onEnter: () => setSelectedSubmission(currentSubmission) }}
    >
      <DialogTitle>{t("edit_stamp_title", { name: info?.name })}</DialogTitle>
      <DialogContent dividers>
        <Stack direction="column" gap={2}>
          <Typography variant="body2" color="text.secondary">
            {info?.description}
          </Typography>
          <PlayerSubmissionSelect
            playerId={playerId}
            submission={selectedSubmission}
            setSubmission={setSelectedSubmission}
          />
          {selectedSubmission && (
            <SubmissionEmbed submission={selectedSubmission} style={{ width: "100%" }} />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          {t("buttons.cancel")}
        </Button>
        <Button color="error" variant="outlined" onClick={onRemove} disabled={!stampSubmission || busy}>
          {t("buttons.remove")}
        </Button>
        <Button color="primary" variant="contained" onClick={onAssign} disabled={!selectedSubmission || busy}>
          {t("buttons.assign")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function StampImage({ stampId, hasSubmission, info }) {
  const { t } = useTranslation(undefined, { keyPrefix: "event.sss26" });
  const stampPath = hasSubmission ? `/img/stamp/stamp${stampId}.png` : `/img/stamp/no_stamp.png`;
  const alt = hasSubmission ? (info?.name ?? t("stamp_alt", { number: stampId + 1 })) : t("no_stamp_alt");
  const accentGlowFilter = getAccentGlowFilter(hasSubmission, info?.accent);
  return (
    <Box
      component="img"
      src={stampPath}
      alt={alt}
      sx={{
        width: STAMP_IMAGE_SIZE,
        height: STAMP_IMAGE_SIZE,
        objectFit: "contain",
        imageRendering: "pixelated",
        filter: accentGlowFilter,
      }}
    />
  );
}

function getAccentGlowFilter(hasSubmission, accent) {
  if (!hasSubmission || !accent) return "none";
  const glow = `0 0 0.75rem ${accent}`;
  return `drop-shadow(${glow}) drop-shadow(${glow})`;
}

export function calculateStampData(submissions) {
  const data = {
    count: 0,
    totalTier: 0,
    averageTier: 0,
  };

  for (const submission of submissions) {
    data.count++;
    const diff = submission.challenge.difficulty;
    data.totalTier += Math.max(0, diff.sort);
  }

  data.averageTier = data.count > 0 ? data.totalTier / data.count : 0;
  return data;
}

const TIER_BADGES = {
  10: 42,
  20: 41,
  40: 40,
};
const STAMPS_REQUIRED = 8;

// Overachiever milestones for total tier above 40. Each 20-increment shows an emote instead of a badge,
// plus an info icon with a (placeholder) funny message. Emotes are random existing ones for now.
const OVERACHIEVER_MILESTONES = [
  {
    threshold: 60,
    emote: "chart_with_awesome_trend.png",
    info: "Can't give you a badge for this, but know you're the goat.",
  },
  { threshold: 80, emote: "3dgospel.png", info: "A real overachiever, are we?" },
  { threshold: 100, emote: "catpog.png", info: "Triple digits!!! What the heeeell" },
  {
    threshold: 120,
    emote: "corn3dcorncorn3dcorncorn.png",
    info: "Absolutely insane commitment, GG!",
  },
  {
    threshold: 140,
    emote: "catwashingmachine.gif",
    info: "A t14 every 9 days, alright buddy what the fuck?????",
  },
  {
    threshold: 160,
    emote: "entity.png",
    info: "?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????",
  },
  {
    threshold: 180,
    emote: "clowneline.png",
    info: "Almost certainly cheater.",
  },
  { threshold: 200, emote: "gluckyou.png", info: "Guaranteed cheater." },
];

function TotalTierProgress({ totalTier, averageTier, stampCount }) {
  const { t } = useTranslation(undefined, { keyPrefix: "event.sss26" });
  const max = Math.max(40, totalTier);
  // Overachiever milestones only appear once the bar extends far enough to reach them.
  const overachieverMilestones = OVERACHIEVER_MILESTONES.filter((m) => m.threshold <= max);
  const lineThresholds = [
    20,
    ...(totalTier > 40 ? [40] : []),
    ...overachieverMilestones.map((m) => m.threshold),
  ];
  const fillPercent = max > 0 ? (totalTier / max) * 100 : 0;
  const barHeight = 28;
  const hasEnoughStamps = stampCount >= STAMPS_REQUIRED;

  const badgeItems = [
    // The first badge is awarded for collecting enough stamps, regardless of tier, so it floats at 0.
    { threshold: 10, pct: 0, type: "count" },
    { threshold: 20, pct: (20 / max) * 100, type: "boundary" },
    { threshold: 40, pct: (40 / max) * 100, type: "boundary" },
    ...overachieverMilestones.map((m) => ({
      threshold: m.threshold,
      pct: (m.threshold / max) * 100,
      type: "emote",
      emote: m.emote,
      info: m.info,
    })),
  ];

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "stretch", sm: "center" }}
      gap={{ xs: 1, sm: 2 }}
      sx={{ width: "100%", px: { xs: 0, sm: 1 }, mb: 5 }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={{ xs: "center", sm: "flex-start" }}
        gap={0.5}
        sx={{ flexShrink: 0 }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", whiteSpace: "nowrap", textAlign: "center", lineHeight: "1.2rem" }}
        >
          {t("total_tier")}
          <br />
          {t("total_tier_progress", { current: totalTier, max: 40 })}
        </Typography>
        <TooltipInfoButton title={t("total_tier_info")} fontSize="0.85rem" />
      </Stack>
      <Box sx={{ position: "relative", flexGrow: 1, minWidth: 0, height: barHeight }}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: barHeight,
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: `${fillPercent}%`,
              background: "linear-gradient(to right, #4caf50, #8bc34a)",
              transition: "width 0.3s ease",
            }}
          />
          {lineThresholds.map((threshold) => {
            const pct = (threshold / max) * 100;
            return (
              <Box
                key={threshold}
                sx={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${pct}%`,
                  width: "2px",
                  backgroundColor: "rgba(255,255,255,0.85)",
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </Box>
        {badgeItems.map((item) => {
          const { threshold, pct, type } = item;
          const translateX = pct >= 100 ? "-100%" : pct <= 0 ? "0%" : "-50%";

          let unlocked, greyscale, glowColor, infoText, infoWarning, label;
          if (type === "count") {
            unlocked = hasEnoughStamps;
            greyscale = !unlocked;
            glowColor = unlocked ? "rgba(255, 255, 255," : null;
            infoText = t("stamp_count_badge_info");
            infoWarning = false;
            label = t("stamp_count_badge_label");
          } else if (type === "emote") {
            // Overachiever milestones: unlock purely based on total tier, always show the funny info text.
            unlocked = totalTier >= threshold;
            greyscale = !unlocked;
            glowColor = unlocked ? "rgba(255, 255, 255," : null;
            infoText = item.info;
            infoWarning = false;
            label = threshold;
          } else {
            const boundaryPassed = totalTier >= threshold;
            unlocked = boundaryPassed && hasEnoughStamps;
            if (unlocked) {
              greyscale = false;
              glowColor = "rgba(255, 255, 255,";
              infoText = null;
              infoWarning = false;
            } else if (boundaryPassed) {
              // Boundary passed but not enough stamps: same unlocked highlight, but a yellow warning info icon.
              greyscale = false;
              glowColor = "rgba(255, 255, 255,";
              infoText = t("boundary_passed_info");
              infoWarning = true;
            } else {
              greyscale = true;
              glowColor = null;
              infoText = null;
              infoWarning = false;
            }
            label = threshold;
          }

          return (
            <Box
              key={`label-${threshold}`}
              sx={{
                position: "absolute",
                top: `${barHeight + 4}px`,
                left: `${pct}%`,
                transform: `translateX(${translateX})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.25,
                whiteSpace: "nowrap",
                pointerEvents: "auto",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...(glowColor && {
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: -6,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${glowColor} 0.85) 0%, ${glowColor} 0.4) 45%, ${glowColor} 0) 75%)`,
                      filter: "blur(2px)",
                      zIndex: 0,
                      animation: "stampShine 2.4s ease-in-out infinite",
                    },
                    "@keyframes stampShine": {
                      "0%, 100%": { opacity: 0.55, transform: "scale(0.95)" },
                      "50%": { opacity: 1, transform: "scale(1.1)" },
                    },
                  }),
                  "& > *": {
                    position: "relative",
                    zIndex: 1,
                    ...(greyscale && { filter: "grayscale(100%)", opacity: 0.7 }),
                  },
                }}
              >
                {type === "emote" ? (
                  <EmoteImage emote={item.emote} alt={String(label)} height="32px" />
                ) : (
                  <BadgeAsync id={TIER_BADGES[threshold]} inline={false} />
                )}
              </Box>
              <Stack direction="row" alignItems="center" gap={0.25}>
                <Typography variant="caption" sx={{ fontWeight: "bold", lineHeight: 1 }}>
                  {label}
                </Typography>
                {infoText &&
                  (infoWarning ? (
                    <TooltipInfoButton
                      title={infoText}
                      icon={faTriangleExclamation}
                      color="#ffcc00"
                      fontSize="0.75rem"
                    />
                  ) : (
                    <TooltipInfoButton title={infoText} fontSize="0.75rem" />
                  ))}
              </Stack>
            </Box>
          );
        })}
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          flexShrink: 0,
          whiteSpace: "nowrap",
          textAlign: { xs: "center", sm: "right" },
          mt: { xs: 6, sm: 0 },
        }}
      >
        {t("average_tier", { value: averageTier.toFixed(2) })}
      </Typography>
    </Stack>
  );
}

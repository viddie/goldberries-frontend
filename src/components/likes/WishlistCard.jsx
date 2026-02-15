import { faClock, faEdit, faFlagCheckered } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Chip, IconButton, LinearProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getChallengeCampaign, getGamebananaEmbedUrl, secondsToDuration } from "../../util/data_util";
import { API_BASE_URL } from "../../util/constants";
import { PlaceholderImage } from "../PlaceholderImage";
import { CollapsibleText } from "../basic";
import { DifficultyChip, ObjectiveIcon, SkullIcon } from "../goldberries";
import { ChallengeInline } from "../../pages/Player";
import { useAuth } from "../../hooks/AuthProvider";

//#region Constants
export const WISHLIST_STATE_COLORS = {
  current: "#42a5f5",
  on_hold: "#ef5350",
  soon: "#d4a000",
  backlog: "#484848",
};
//#endregion

//#region WishlistCard
export function WishlistCard({ like, onEdit }) {
  const auth = useAuth();
  const { t } = useTranslation(undefined, { keyPrefix: "likes" });
  const challenge = like.challenge;
  const map = challenge?.map ?? null;
  const campaign = getChallengeCampaign(challenge);
  const stateColor = WISHLIST_STATE_COLORS[like.state] ?? "grey";

  // Determine banner image source
  // Full-game challenges have no map, so use gamebanana embed
  const bannerSrc = map
    ? API_BASE_URL + "/img/map/" + map.id + "&scale=2"
    : getGamebananaEmbedUrl(campaign?.url, "large");

  return (
    <Box
      sx={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "#2d2d2d",
      }}
    >
      {/* Section 1: Banner with floating chips */}
      <WishlistBanner
        bannerSrc={bannerSrc}
        alt={campaign?.name ?? ""}
        challengeId={challenge?.id}
        difficulty={challenge?.difficulty}
        timeTaken={like.time_taken}
        stateColor={stateColor}
        stateLabel={like.state ? t("state." + like.state) : null}
        canEdit={auth.hasVerifierPriv || auth.isPlayerWithId(like.player_id)}
        onEdit={onEdit}
      />

      {/* Section 2: Challenge inline */}
      <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <ChallengeInline challenge={challenge} showChallenge />
      </Box>

      {/* Section 3: Progress + Comment */}
      {(like.progress !== null || like.comment) && (
        <Box sx={{ px: 1.5, py: 1 }}>
          {like.progress !== null && (
            <WishlistProgressBar progress={like.progress} stateColor={stateColor} lowDeath={like.low_death} />
          )}
          {like.comment && (
            <Box
              sx={{
                mt: like.progress !== null ? 1.0 : 0,
                px: 0.5,
              }}
            >
              <CollapsibleText text={like.comment} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
//#endregion

//#region WishlistBanner
function WishlistBanner({
  bannerSrc,
  alt,
  challengeId,
  difficulty,
  timeTaken,
  stateColor,
  stateLabel,
  canEdit,
  onEdit,
}) {
  const showTimeTaken = timeTaken !== null && timeTaken !== undefined && timeTaken > 0;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Link to={challengeId ? `/challenge/${challengeId}` : "#"} style={{ display: "block" }}>
        <Box
          sx={{
            width: "100%",
            aspectRatio: "6 / 1",
            overflow: "hidden",
          }}
        >
          <PlaceholderImage
            src={bannerSrc}
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
              background: "linear-gradient(to bottom, transparent 0%, #2d2d2d 100%)",
              pointerEvents: "none",
            }}
          />
        </Box>
      </Link>

      {/* Floating chips - top left */}
      <Stack direction="column" gap={0.5} sx={{ position: "absolute", top: 8, left: 8 }}>
        <Stack direction="row" gap={0.5} alignItems="center">
          {difficulty && <DifficultyChip difficulty={difficulty} size="small" />}
          {stateLabel && (
            <Chip
              label={stateLabel}
              size="small"
              sx={{
                backgroundColor: stateColor,
                color: "#fff",
                fontWeight: "bold",
                fontSize: "0.75rem",
                textShadow: "0 1px 2px rgba(0,0,0,0.4)",
              }}
            />
          )}
        </Stack>
        {showTimeTaken && (
          <Chip
            icon={
              <FontAwesomeIcon
                icon={faClock}
                style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.65rem" }}
              />
            }
            label={secondsToDuration(timeTaken)}
            size="small"
            sx={{
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.7rem",
              height: "20px",
              alignSelf: "flex-start",
            }}
          />
        )}
      </Stack>

      {/* Floating edit button - top right */}
      {canEdit && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit?.();
          }}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            backgroundColor: "rgba(0,0,0,0.5)",
            color: "#fff",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
            width: 28,
            height: 28,
          }}
        >
          <FontAwesomeIcon icon={faEdit} size="xs" />
        </IconButton>
      )}
    </Box>
  );
}
//#endregion

//#region WishlistProgressBar
function WishlistProgressBar({ progress, stateColor, lowDeath }) {
  const { t } = useTranslation(undefined, { keyPrefix: "likes" });
  const isComplete = progress >= 100;
  const showLowDeath = lowDeath !== null && lowDeath !== undefined && !isComplete;

  return (
    <Stack direction="row" alignItems="center" gap={2}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: "bold", minWidth: "32px", textAlign: "right" }}>
          {progress}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            flex: 1,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#3d3d3d",
            "& .MuiLinearProgress-bar": {
              backgroundColor: stateColor,
              borderRadius: 4,
            },
          }}
        />
        {isComplete ? (
          <ObjectiveIcon
            objective={{
              name: "Golden Berry",
              description: "Golden Berry",
              icon_url: "/icons/goldenberry-8x.png",
            }}
            height="16px"
          />
        ) : (
          <FontAwesomeIcon icon={faFlagCheckered} style={{ fontSize: "14px", opacity: 0.6 }} />
        )}
      </Stack>
      {showLowDeath && (
        <Stack direction="row" alignItems="center" gap={0.5}>
          <SkullIcon height="16px" />
          <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.8rem" }}>
            {t("low_death", { count: lowDeath })}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
//#endregion

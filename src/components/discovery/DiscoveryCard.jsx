import { faFlagCheckered, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Stack, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { API_BASE_URL } from "../../util/constants";
import { getCampaignName, getChallengeCampaign, getGamebananaEmbedUrl } from "../../util/data_util";
import { PlaceholderImage } from "../PlaceholderImage";
import { SegmentedChip, StyledLink } from "../basic";
import { ChallengeInline, DifficultyChip } from "../goldberries";
import { ChallengeTagChips } from "../tags";

const CARD_BACKGROUND = "#303030";
const OVERLAY_ICON_COLOR = "rgba(0,0,0,0.8)";
const OVERLAY_COUNT_COLOR = "rgba(0,0,0,0.6)";
const OVERLAY_TEXT_COLOR = "rgba(255,255,255,0.9)";

//#region DiscoveryCard
export function DiscoveryCard({ challenge, highlightedValueIds = null }) {
  const campaign = getChallengeCampaign(challenge);
  const map = challenge.map ?? null;
  const hasTags = (challenge.data?.tags?.length ?? 0) > 0;

  // Full-game challenges have no map, so use the gamebanana image of the campaign
  const bannerSrc = map
    ? API_BASE_URL + "/img/map/" + map.id + "&scale=2"
    : getGamebananaEmbedUrl(campaign?.url, "large");

  return (
    <Box
      sx={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: CARD_BACKGROUND,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DiscoveryCardBanner
        challenge={challenge}
        campaign={campaign}
        bannerSrc={bannerSrc}
        alt={map?.name ?? campaign?.name ?? ""}
      />
      <Box sx={{ px: 1.5, py: 1, borderBottom: hasTags ? "1px solid rgba(255,255,255,0.06)" : undefined }}>
        <ChallengeInline challenge={challenge} showChallenge hideCampaign />
      </Box>
      {hasTags && (
        <Box sx={{ px: 1.5, py: 1 }}>
          <ChallengeTagChips
            challengeId={challenge.id}
            counts={challenge.data.tags}
            maxVisible={4}
            highlightedValueIds={highlightedValueIds}
          />
        </Box>
      )}
    </Box>
  );
}
//#endregion

//#region DiscoveryCardBanner
function DiscoveryCardBanner({ challenge, campaign, bannerSrc, alt }) {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery.card" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const submissionCount = challenge.data?.count_submissions ?? 0;
  const likeCount = challenge.likes ?? 0;

  return (
    <Box sx={{ position: "relative", width: "100%", overflow: "hidden" }}>
      <Link to={"/challenge/" + challenge.id} style={{ display: "block" }}>
        <Box sx={{ width: "100%", aspectRatio: "3 / 1", overflow: "hidden" }}>
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
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60%",
              background: `linear-gradient(to bottom, transparent 0%, ${CARD_BACKGROUND} 100%)`,
              pointerEvents: "none",
            }}
          />
        </Box>
      </Link>

      <Stack direction="row" gap={0.5} sx={{ position: "absolute", top: 8, left: 8 }}>
        {challenge.difficulty && <DifficultyChip difficulty={challenge.difficulty} size="small" />}
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={{ position: "absolute", bottom: 6, left: 8, right: 8, pointerEvents: "none" }}
      >
        {campaign && (
          <Stack
            direction="row"
            alignItems="center"
            gap={0.5}
            sx={{ minWidth: 0, flex: 1, pointerEvents: "auto" }}
          >
            {campaign.icon_url && (
              <img
                src={campaign.icon_url}
                alt=""
                className="outlined"
                loading="lazy"
                style={{ height: "1.1em", flexShrink: 0 }}
              />
            )}
            <StyledLink
              to={"/campaign/" + campaign.id}
              style={{
                display: "block",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 0,
                textShadow: "0 0 4px rgba(0,0,0,0.9)",
              }}
            >
              {getCampaignName(campaign, t_g, true)}
            </StyledLink>
          </Stack>
        )}
        <Stack direction="row" gap={0.5} sx={{ ml: "auto", flexShrink: 0, pointerEvents: "auto" }}>
          <OverlayCountChip
            icon={faFlagCheckered}
            count={submissionCount}
            tooltip={t("submissions", { count: submissionCount })}
          />
          <OverlayCountChip icon={faHeart} count={likeCount} tooltip={t("likes", { count: likeCount })} />
        </Stack>
      </Stack>
    </Box>
  );
}
//#endregion

//#region OverlayCountChip
function OverlayCountChip({ icon, count, tooltip }) {
  return (
    <Tooltip title={tooltip} arrow>
      <SegmentedChip
        segments={[
          {
            key: "icon",
            label: <FontAwesomeIcon icon={icon} style={{ fontSize: "0.7rem" }} />,
            color: OVERLAY_ICON_COLOR,
            textColor: "rgba(255,255,255,0.7)",
            sx: { pl: 1, pr: 0.75 },
          },
          {
            key: "count",
            label: count,
            color: OVERLAY_COUNT_COLOR,
            textColor: OVERLAY_TEXT_COLOR,
            sx: { pl: 0.75, pr: 1 },
          },
        ]}
      />
    </Tooltip>
  );
}
//#endregion

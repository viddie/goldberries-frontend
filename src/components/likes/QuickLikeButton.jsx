import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";

import { useAuth } from "../../hooks/AuthProvider";
import {
  getQueryData,
  useDeleteChallengeLike,
  useGetPlayerLikes,
  usePostChallengeLike,
} from "../../hooks/useApi";

const LIKE_COLOR = "#5c9eff";

export function QuickLikeButton({
  challengeId,
  likeCount,
  readonly = false,
  adjustLikeCount = false,
  compact = false,
  sx,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "likes" });
  const auth = useAuth();

  const playerId = auth.user?.player_id;
  const playerLikesQuery = useGetPlayerLikes(playerId, false);
  const playerLikes = getQueryData(playerLikesQuery) ?? [];

  const ownLike = playerLikes.find((like) => like.challenge_id === challengeId);
  const hasLiked = !!ownLike;

  const [likeAdjustment, setLikeAdjustment] = useState(0);

  const postLikeMutation = usePostChallengeLike(() => {
    if (adjustLikeCount) setLikeAdjustment((prev) => prev + 1);
  });
  const deleteLikeMutation = useDeleteChallengeLike(() => {
    if (adjustLikeCount) setLikeAdjustment((prev) => prev - 1);
  });

  const isMutating = postLikeMutation.isLoading || deleteLikeMutation.isLoading;

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (readonly) return;

    if (!auth.hasPlayerClaimed) {
      toast.info(t("sign_in_to_like"));
      return;
    }

    if (hasLiked) {
      deleteLikeMutation.mutate({ id: ownLike.id, challengeId });
    } else {
      postLikeMutation.mutate({ challenge_id: challengeId });
    }
  };

  const icon = hasLiked ? faHeart : faHeartOutline;
  const heartColor = LIKE_COLOR;
  const textColor = hasLiked ? "#fff" : LIKE_COLOR;
  const disabled = readonly ? false : isMutating || playerLikesQuery.isLoading;

  const displayCount = (likeCount ?? 0) + likeAdjustment;

  const size = compact ? "22px" : "26px";
  const iconSize = compact ? "1.0rem" : "1.25rem";
  const fontSize = compact ? "0.45rem" : "0.50rem";

  return (
    <IconButton
      size="small"
      onClick={readonly ? undefined : handleClick}
      disabled={disabled}
      sx={{
        position: "relative",
        width: size,
        height: size,
        p: 0,
        cursor: readonly ? "default" : "pointer",
        color: heartColor,
        "&:hover": readonly ? { backgroundColor: "transparent" } : undefined,
        ...sx,
      }}
    >
      <FontAwesomeIcon icon={icon} style={{ fontSize: iconSize }} />
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: fontSize,
          fontWeight: "bold",
          lineHeight: 1,
          color: textColor,
          pointerEvents: "none",
          // marginTop: "-1px",
        }}
      >
        {displayCount}
      </span>
    </IconButton>
  );
}

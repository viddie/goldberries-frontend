import { faHeart, faInfoCircle, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  ClickAwayListener,
  Divider,
  FormControlLabel,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/AuthProvider";
import {
  getQueryData,
  useDeleteChallengeLike,
  useGetChallenge,
  useGetChallengeLikes,
  usePostChallengeLike,
} from "../hooks/useApi";
import { getErrorFromMultiple, getErrorMessage } from "./basic";
import { PlayerChip } from "./goldberries";
import { toast } from "react-toastify";

export function LikeButton({ challengeId, sx }) {
  const { t } = useTranslation(undefined, { keyPrefix: "likes" });
  const auth = useAuth();

  const [localWishlist, setLocalWishlist] = useState(null);
  const wishlistInitialized = useRef(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const challengeQuery = useGetChallenge(challengeId);
  const likesQuery = useGetChallengeLikes(challengeId);

  const postLikeMutation = usePostChallengeLike();
  const deleteLikeMutation = useDeleteChallengeLike();

  const challenge = getQueryData(challengeQuery);
  const likes = getQueryData(likesQuery) ?? [];

  const isLoading = challengeQuery.isLoading || likesQuery.isLoading;
  const isError = challengeQuery.isError || likesQuery.isError;

  const ownLike = likes.find((like) => auth.isPlayerWithId(like.player_id));
  const hasLiked = !!ownLike;
  const ownCompleted = challenge?.submissions?.some((submission) =>
    auth.isPlayerWithId(submission.player_id),
  );

  // Initialize local wishlist state when ownLike is available
  useEffect(() => {
    if (ownLike && !wishlistInitialized.current) {
      setLocalWishlist(ownLike.is_wishlist ?? false);
      wishlistInitialized.current = true;
    }
    if (!ownLike) {
      wishlistInitialized.current = false;
      setLocalWishlist(null);
    }
  }, [ownLike]);

  const handleLikeClick = () => {
    if (!auth.user) return;

    if (hasLiked) {
      deleteLikeMutation.mutate({ id: ownLike.id, challengeId });
    } else {
      postLikeMutation.mutate({ challenge_id: challengeId });
    }
  };

  const handleWishlistChange = (event) => {
    setLocalWishlist(event.target.checked);
  };

  // Send wishlist update when tooltip closes, if value changed
  const handleTooltipClose = () => {
    if (!ownLike || localWishlist === null) return;

    const serverValue = ownLike.is_wishlist ?? false;
    if (localWishlist !== serverValue) {
      postLikeMutation.mutate({
        id: ownLike.id,
        challenge_id: challengeId,
        is_wishlist: localWishlist,
      });
    }
  };

  const closeTooltip = () => {
    if (infoOpen) {
      handleTooltipClose();
      setInfoOpen(false);
    }
  };

  const toggleTooltip = () => {
    if (isLoading) return;
    setInfoOpen((open) => {
      if (open) {
        handleTooltipClose();
      }
      return !open;
    });
  };

  // Separate players who have completed vs haven't completed the challenge
  const completedPlayerIds = new Set(
    (challenge?.submissions ?? []).map((submission) => submission.player_id),
  );

  const likesFromCompleted = likes.filter((like) => completedPlayerIds.has(like.player_id));
  const likesFromNotCompleted = likes.filter((like) => !completedPlayerIds.has(like.player_id));

  const isMutating = postLikeMutation.isLoading || deleteLikeMutation.isLoading;

  // Determine button variant and color
  const buttonVariant = hasLiked ? "contained" : "outlined";
  const buttonColor = isError ? "error" : "primary";

  // Determine what to show in tooltip
  const getTooltipContent = () => {
    if (isLoading) return "";
    if (isError) return getErrorFromMultiple(challengeQuery, likesQuery);
    return (
      <ClickAwayListener onClickAway={closeTooltip}>
        <Stack direction="column" gap={1} sx={{ p: 1 }}>
          {hasLiked && !ownCompleted && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localWishlist ?? false}
                    onChange={handleWishlistChange}
                    size="small"
                    sx={{ color: "inherit", "&.Mui-checked": { color: "inherit" } }}
                  />
                }
                label={t("wishlist")}
                sx={{ mr: 0 }}
              />
              <Divider sx={{ borderColor: "rgba(255,255,255,0.3)" }} />
            </>
          )}

          <Stack direction="row" gap={2}>
            {/* Completed column */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
                {t("completed")} ({likesFromCompleted.length}/{challenge?.submissions?.length || 0})
              </Typography>
              <Stack direction="column" gap={0.5} sx={{ mt: 1 }}>
                {likesFromCompleted.length === 0 ? (
                  <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                    {t("no_likes")}
                  </Typography>
                ) : (
                  likesFromCompleted.map((like) => (
                    <PlayerChip key={like.id} player={like.player} size="small" />
                  ))
                )}
              </Stack>
            </Box>

            {/* Not completed column */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
                {t("not_completed")} ({likesFromNotCompleted.length})
              </Typography>
              <Stack direction="column" gap={0.5} sx={{ mt: 1 }}>
                {likesFromNotCompleted.length === 0 ? (
                  <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                    {t("no_likes")}
                  </Typography>
                ) : (
                  likesFromNotCompleted.map((like) => (
                    <PlayerChip key={like.id} player={like.player} size="small" />
                  ))
                )}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </ClickAwayListener>
    );
  };

  // Determine what icon/text to show for the like count
  const getLikeCountContent = () => {
    if (isLoading)
      return (
        <span>
          <FontAwesomeIcon icon={faSpinner} spin />
        </span>
      );
    if (isError)
      return (
        <span>
          <FontAwesomeIcon icon={faXmark} />
        </span>
      );
    return likes.length;
  };

  // Determine if the like button should be clickable
  const isLikeButtonDisabled = isMutating || isLoading;

  // Handle like click - only do something if not in error state
  const onLikeButtonClick = () => {
    if (isError) return;
    if (!auth.hasPlayerClaimed) {
      toast.info("You need to sign in and claim a player to like challenges");
      return;
    }
    handleLikeClick();
  };

  return (
    <ButtonGroup variant={buttonVariant} color={buttonColor} size="small" sx={sx}>
      <Button
        onClick={onLikeButtonClick}
        disabled={isLikeButtonDisabled}
        startIcon={<FontAwesomeIcon icon={faHeart} />}
      >
        {getLikeCountContent()}
      </Button>
      <Tooltip
        title={getTooltipContent()}
        arrow
        placement="bottom"
        open={infoOpen}
        disableHoverListener
        disableFocusListener
        disableTouchListener
        onClose={closeTooltip}
        slotProps={{
          tooltip: {
            sx: {
              maxWidth: "none",
              backgroundColor: "rgba(30, 30, 30, 1)",
              "& .MuiTooltip-arrow": {
                color: "rgba(30, 30, 30, 1)",
              },
              maxHeight: 300,
              overflowY: "auto",
              overflowX: "hidden",
            },
          },
        }}
      >
        <Button sx={{ px: 1, minWidth: "auto" }} disabled={isLoading} onClick={toggleTooltip}>
          <FontAwesomeIcon icon={faInfoCircle} />
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
}

export function LikeDisplay({ likes }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      <FontAwesomeIcon icon={faHeart} />
      <span>{likes}</span>
    </Stack>
  );
}

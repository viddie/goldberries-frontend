import { faHeart, faInfoCircle, faSpinner, faStarOfLife, faXmark } from "@fortawesome/free-solid-svg-icons";
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
  useMediaQuery,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useAuth } from "../../hooks/AuthProvider";
import {
  getQueryData,
  useDeleteChallengeLike,
  useGetChallenge,
  useGetChallengeLikes,
  usePostChallengeLike,
} from "../../hooks/useApi";
import { getErrorFromMultiple } from "../basic";
import { PlayerChip } from "../goldberries";

import { LikeStateSelect } from "./LikeStateSelect";
import { WISHLIST_STATE_COLORS } from "./WishlistCard";

//#region LikeButton
export function LikeButton({ challengeId, sx }) {
  const { t } = useTranslation(undefined, { keyPrefix: "likes" });
  const auth = useAuth();
  const isSmScreen = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  const [localWishlist, setLocalWishlist] = useState(null);
  const [localState, setLocalState] = useState(null);
  const wishlistInitialized = useRef(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);

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

  // Initialize local wishlist and state when ownLike is available
  useEffect(() => {
    if (ownLike && !wishlistInitialized.current) {
      setLocalWishlist(ownLike.is_wishlist ?? false);
      setLocalState(ownLike.state ?? null);
      wishlistInitialized.current = true;
    }
    if (!ownLike) {
      wishlistInitialized.current = false;
      setLocalWishlist(null);
      setLocalState(null);
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
    const checked = event.target.checked;
    setLocalWishlist(checked);
    if (!checked) {
      setLocalState(null);
    }
  };

  // Send wishlist and state update when tooltip closes, if values changed
  const handleTooltipClose = () => {
    if (!ownLike || localWishlist === null) return;

    const serverWishlist = ownLike.is_wishlist ?? false;
    const serverState = ownLike.state ?? null;
    const wishlistChanged = localWishlist !== serverWishlist;
    const stateChanged = localState !== serverState;
    if (wishlistChanged || (localWishlist && stateChanged)) {
      postLikeMutation.mutate({
        id: ownLike.id,
        challenge_id: challengeId,
        is_wishlist: localWishlist,
        state: localState,
      });
    }
  };

  const closeTooltip = () => {
    if (selectOpen) return;
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
        <Stack direction="column" gap={1} sx={{ p: 1, width: "fit-content" }}>
          {hasLiked && (
            <>
              <Stack
                direction={isSmScreen ? "row" : "column"}
                gap={1}
                alignItems={isSmScreen ? "center" : "flex-start"}
              >
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
                <LikeStateSelect
                  value={localState}
                  onChange={setLocalState}
                  disabled={!localWishlist}
                  onOpen={() => setSelectOpen(true)}
                  onClose={() => setSelectOpen(false)}
                />
              </Stack>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.3)" }} />
            </>
          )}

          <Stack direction="row" gap={2} alignItems="flex-start">
            {/* Completed column */}
            <LikeColumn
              label={`${t("completed")} (${likesFromCompleted.length}/${challenge?.submissions?.length || 0})`}
              likes={likesFromCompleted}
              emptyLabel={t("no_likes")}
            />

            {/* Not completed column */}
            <LikeColumn
              label={`${t("not_completed")} (${likesFromNotCompleted.length})`}
              likes={likesFromNotCompleted}
              emptyLabel={t("no_likes")}
            />
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
//#endregion

//#region LikeColumn
function LikeColumn({ label, likes, emptyLabel }) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
        {label}
      </Typography>
      <Box sx={{ maxHeight: 250, overflowY: "auto", scrollbarGutter: "stable", mt: 1 }}>
        <Stack direction="column" gap={0.5}>
          {likes.length === 0 ? (
            <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
              {emptyLabel}
            </Typography>
          ) : (
            likes.map((like) => <LikePlayerChip key={like.id} like={like} />)
          )}
        </Stack>
      </Box>
    </Box>
  );
}
//#endregion

//#region LikePlayerChip
function LikePlayerChip({ like }) {
  const color = WISHLIST_STATE_COLORS[like.state] ?? "#ffffff";
  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      <PlayerChip player={like.player} size="small" />
      {like.is_wishlist && (
        <FontAwesomeIcon
          icon={faStarOfLife}
          size="xs"
          style={{ color: color, flexShrink: 0, marginRight: 1.0 }}
        />
      )}
    </Stack>
  );
}
//#endregion

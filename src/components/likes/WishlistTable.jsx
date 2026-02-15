import { faComment, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Link } from "react-router-dom";

import { getChallengeCampaign, getGamebananaEmbedUrl, secondsToDuration } from "../../util/data_util";
import { API_BASE_URL } from "../../util/constants";
import { PlaceholderImage } from "../PlaceholderImage";
import { DifficultyChip, SkullIcon } from "../goldberries";
import { ChallengeInline } from "../goldberries";
import { useAuth } from "../../hooks/AuthProvider";
import { CustomModal, useModal } from "../../hooks/useModal";

import { WISHLIST_STATE_COLORS } from "./WishlistCard";
import { FormWishlistLike } from "./WishlistLike";

//#region WishlistTable
export function WishlistTable({ likes }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const auth = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useLocalStorage("wishlist_table_rows_per_page", 25);
  const editWishlistModal = useModal();

  const paginatedLikes =
    rowsPerPage === -1 ? likes : likes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <TableContainer component={Paper} sx={{ backgroundColor: "transparent" }}>
        <TablePagination
          labelRowsPerPage={t_g("table_rows_per_page")}
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={likes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          slotProps={{
            select: {
              MenuProps: {
                disableScrollLock: true,
              },
            },
          }}
        />
        <Table size="small">
          <TableBody>
            {paginatedLikes.map((like) => {
              const canEdit = auth.hasVerifierPriv || auth.isPlayerWithId(like.player_id);
              return (
                <WishlistTableRow
                  key={like.id}
                  like={like}
                  canEdit={canEdit}
                  onEdit={() => editWishlistModal.open(like)}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <CustomModal modalHook={editWishlistModal} options={{ hideFooter: true }}>
        {editWishlistModal.data && (
          <FormWishlistLike like={editWishlistModal.data} onSave={() => editWishlistModal.close()} />
        )}
      </CustomModal>
    </>
  );
}
//#endregion

//#region WishlistTableRow
function WishlistTableRow({ like, canEdit, onEdit }) {
  const { t } = useTranslation(undefined, { keyPrefix: "likes" });
  const challenge = like.challenge;
  const map = challenge?.map ?? null;
  const campaign = getChallengeCampaign(challenge);

  const bannerSrc = map
    ? API_BASE_URL + "/img/map/" + map.id + "&scale=2"
    : getGamebananaEmbedUrl(campaign?.url, "large");

  const hasComment = like.comment !== null && like.comment !== undefined && like.comment !== "";
  const hasProgress = like.progress !== null && like.progress !== undefined;
  const hasLowDeath =
    like.low_death !== null && like.low_death !== undefined && hasProgress && like.progress < 100;
  const hasTimeTaken = like.time_taken !== null && like.time_taken !== undefined && like.time_taken > 0;
  const hasDetails = hasComment || hasProgress || hasLowDeath || hasTimeTaken;

  return (
    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      {/* Banner cell */}
      <TableCell sx={{ p: 0, width: "35%", minWidth: "150px", position: "relative" }}>
        <WishlistTableBanner
          bannerSrc={bannerSrc}
          alt={campaign?.name ?? ""}
          challengeId={challenge?.id}
          difficulty={challenge?.difficulty}
          state={like.state}
        />
      </TableCell>

      {/* Challenge inline + details cell */}
      <TableCell>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <ChallengeInline challenge={challenge} showChallenge />
          {hasDetails && (
            <Stack direction="row" alignItems="center" gap={1} sx={{ whiteSpace: "nowrap", flexShrink: 0 }}>
              {hasComment && (
                <Tooltip title={like.comment} arrow>
                  <FontAwesomeIcon icon={faComment} style={{ color: "rgba(255,255,255,0.5)" }} />
                </Tooltip>
              )}
              {hasProgress && (
                <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.8rem" }}>
                  {like.progress}%
                </Typography>
              )}
              {hasLowDeath && (
                <Stack direction="row" alignItems="center" gap={0.25}>
                  <SkullIcon height="14px" />
                  <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.8rem" }}>
                    {t("low_death", { count: like.low_death })}
                  </Typography>
                </Stack>
              )}
              {hasTimeTaken && (
                <Chip
                  label={secondsToDuration(like.time_taken)}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.7rem",
                    height: "20px",
                  }}
                />
              )}
            </Stack>
          )}
        </Stack>
      </TableCell>

      {/* Edit button cell */}
      {canEdit && (
        <TableCell sx={{ width: "1px", whiteSpace: "nowrap" }}>
          <IconButton size="small" onClick={onEdit}>
            <FontAwesomeIcon icon={faEdit} size="sm" />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
}
//#endregion

//#region WishlistTableBanner
function WishlistTableBanner({ bannerSrc, alt, challengeId, difficulty, state }) {
  const { t } = useTranslation(undefined, { keyPrefix: "likes" });
  const stateColor = WISHLIST_STATE_COLORS[state] ?? "grey";
  const stateLabel = state ? t("state." + state) : null;

  return (
    <Link to={challengeId ? `/challenge/${challengeId}` : "#"} style={{ display: "block" }}>
      {/* Absolutely positioned image that fills the entire table cell */}
      <PlaceholderImage
        src={bannerSrc}
        alt={alt}
        loading="lazy"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
        }}
      />
      {/* Gradient fade on the right */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: "50%",
          background: "linear-gradient(to right, transparent 0%, #313131 98%)",
          pointerEvents: "none",
        }}
      />

      {/* Floating chips - vertically centered via flexbox overlay */}
      <Stack
        direction="row"
        gap={0.5}
        alignItems="center"
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 8,
          pointerEvents: "none",
        }}
      >
        {difficulty && (
          <Box sx={{ pointerEvents: "auto" }}>
            <DifficultyChip difficulty={difficulty} size="small" />
          </Box>
        )}
        {state && state !== "backlog" && (
          <Chip
            label={stateLabel}
            size="small"
            sx={{
              backgroundColor: stateColor,
              color: "#fff",
              fontWeight: "bold",
              textShadow: "0 1px 2px rgba(0,0,0,0.4)",
              pointerEvents: "auto",
            }}
          />
        )}
      </Stack>
    </Link>
  );
}
//#endregion

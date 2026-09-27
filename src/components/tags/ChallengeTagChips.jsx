import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Chip, Stack, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useAuth } from "../../hooks/AuthProvider";
import {
  getQueryData,
  useDeleteTagAssignment,
  useGetChallengeTagCounts,
  useGetChallengeTagPlayers,
} from "../../hooks/useApi";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";
import { displayDate } from "../../util/data_util";
import { CustomIconButton, ErrorDisplay, LoadingSpinner } from "../basic";
import { PlayerChip } from "../goldberries";

import { TagChip } from "./TagChip";
import { getTagValueDescription, getTagValueLabel, resolveTagCounts, useTagLookup } from "./tag_util";

//#region ChallengeTagChips
// Renders the aggregated tag chips of a challenge. Either pass `counts` ([{ tag_value_id, count }]) or let the
// component fetch them for `challengeId`. Clicking a chip opens the list of players who assigned that tag.
// Chips of `highlightedValueIds` (Set of tag value ids) are highlighted and shown first.
export function ChallengeTagChips({
  challengeId,
  counts = null,
  maxVisible = 8,
  highlightedValueIds = null,
  clickable = true,
  emptyText = null,
  size = "small",
  sx,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags" });
  const [expanded, setExpanded] = useState(false);
  const { query: treeQuery, lookup } = useTagLookup();
  const countsQuery = useGetChallengeTagCounts(counts === null ? challengeId : null);
  const playersModal = useModal(null, undefined, { actions: [ModalButtons.close] });

  if (treeQuery.isLoading || (counts === null && countsQuery.isLoading)) {
    return <LoadingSpinner size="small" />;
  } else if (treeQuery.isError || (counts === null && countsQuery.isError)) {
    return <ErrorDisplay error={treeQuery.error ?? countsQuery.error} />;
  }

  const resolved = resolveTagCounts(counts ?? getQueryData(countsQuery), lookup);
  const isHighlighted = (entry) => !!highlightedValueIds?.has(entry.tag_value_id);
  if (highlightedValueIds?.size > 0) {
    resolved.sort((a, b) => isHighlighted(b) - isHighlighted(a));
  }
  if (resolved.length === 0) {
    if (emptyText === null) return null;
    return (
      <Typography variant="body2" color="text.secondary" sx={sx}>
        {emptyText}
      </Typography>
    );
  }

  const hasHidden = maxVisible !== null && resolved.length > maxVisible;
  const visible = hasHidden && !expanded ? resolved.slice(0, maxVisible) : resolved;

  return (
    <>
      <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center" sx={sx}>
        {visible.map((entry) => (
          <TagChip
            key={entry.tag_value_id}
            tag={entry.tag}
            value={entry.value}
            category={entry.category}
            count={entry.count}
            highlighted={isHighlighted(entry)}
            size={size}
            onClick={
              clickable
                ? () => playersModal.open({ challengeId: entry.challenge_id ?? challengeId, entry })
                : undefined
            }
          />
        ))}
        {hasHidden && (
          <Chip
            size={size}
            variant="outlined"
            label={expanded ? t("show_less") : t("show_more", { count: resolved.length - maxVisible })}
            onClick={() => setExpanded(!expanded)}
          />
        )}
      </Stack>
      {clickable && (
        <CustomModal modalHook={playersModal} options={{ title: t("players_modal.title") }}>
          {playersModal.data && (
            <TagPlayersList challengeId={playersModal.data.challengeId} entry={playersModal.data.entry} />
          )}
        </CustomModal>
      )}
    </>
  );
}
//#endregion

//#region TagPlayersList
function TagPlayersList({ challengeId, entry }) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags.players_modal" });
  const auth = useAuth();
  const query = useGetChallengeTagPlayers(challengeId, entry.tag_value_id);
  const { mutate: deleteAssignment, isLoading: isDeleting } = useDeleteTagAssignment(() => {
    toast.success(t("feedback.deleted"));
  });

  const { tag, value, category } = entry;

  return (
    <Stack direction="column" gap={1.5}>
      <Stack direction="column" gap={0.25}>
        <Typography variant="caption" color="text.secondary">
          {category.name}
        </Typography>
        <TagChip
          tag={tag}
          value={value}
          category={category}
          showTooltip={false}
          sx={{ alignSelf: "start" }}
        />
        <Typography variant="body2" sx={{ whiteSpace: "pre-line", mt: 0.5 }}>
          {getTagValueDescription(tag, value)}
        </Typography>
      </Stack>
      {query.isLoading ? (
        <LoadingSpinner />
      ) : query.isError ? (
        <ErrorDisplay error={query.error} />
      ) : (
        <TagPlayersRows
          assignments={getQueryData(query)}
          canDelete={auth.hasHelperPriv}
          isDeleting={isDeleting}
          onDelete={(assignment) => deleteAssignment(assignment.id)}
          label={getTagValueLabel(tag, value)}
        />
      )}
    </Stack>
  );
}
//#endregion

//#region TagPlayersRows
function TagPlayersRows({ assignments, canDelete, isDeleting, onDelete, label }) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags.players_modal" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  if (assignments.length === 0) {
    return <Typography variant="body2">{t("empty")}</Typography>;
  }
  return (
    <Stack direction="column" gap={0.75}>
      <Typography variant="subtitle2" fontWeight="bold">
        {t("count", { count: assignments.length })}
      </Typography>
      {assignments.map((assignment) => (
        <Stack key={assignment.id} direction="row" alignItems="center" gap={1}>
          <PlayerChip player={assignment.player} size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
            {displayDate(assignment.date_created, t_g)}
          </Typography>
          {canDelete && (
            <Tooltip title={t("delete_tooltip", { label })} arrow>
              <span>
                <CustomIconButton
                  size="small"
                  color="error"
                  variant="outlined"
                  disabled={isDeleting}
                  onClick={() => onDelete(assignment)}
                >
                  <FontAwesomeIcon icon={faTrash} size="sm" />
                </CustomIconButton>
              </span>
            </Tooltip>
          )}
        </Stack>
      ))}
    </Stack>
  );
}
//#endregion

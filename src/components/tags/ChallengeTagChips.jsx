import { faEye, faEyeSlash, faTrash } from "@fortawesome/free-solid-svg-icons";
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

const MAX_TOOLTIP_VOTERS = 20;

//#region ChallengeTagChips
// Renders the aggregated tag chips of a challenge. Either pass `counts` ([{ tag_value_id, count }]) or let the
// component fetch them for `challengeId`. Hovering a chip lists the players who assigned that tag, clicking it opens
// that list in a dialog. Chips of `highlightedValueIds` (Set of tag value ids) are highlighted and shown first.
// Values that were out-voted by another value of the same tag are greyed out. With `hideOutvoted` they are hidden
// (unless highlighted) by default, and once all tags are shown a toggle button allows showing/hiding them. Without it
// they are always shown and there is no toggle.
export function ChallengeTagChips({
  challengeId,
  counts = null,
  maxVisible = 8,
  highlightedValueIds = null,
  hideOutvoted = false,
  clickable = true,
  emptyText = null,
  size = "medium",
  sx,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags" });
  const [expanded, setExpanded] = useState(false);
  const [showOutvoted, setShowOutvoted] = useState(false);
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

  // The collapsed view always hides out-voted values (if `hideOutvoted`), the toggle only applies once all tags are shown
  const getShownEntries = (withOutvoted) =>
    withOutvoted ? resolved : resolved.filter((entry) => !entry.isOutvoted || isHighlighted(entry));
  const collapsedEntries = getShownEntries(!hideOutvoted);
  const hasMore = maxVisible !== null && collapsedEntries.length > maxVisible;
  const isCollapsed = hasMore && !expanded;
  const visible = isCollapsed
    ? collapsedEntries.slice(0, maxVisible)
    : getShownEntries(!hideOutvoted || showOutvoted);
  const showOutvotedToggle =
    hideOutvoted && !isCollapsed && resolved.some((entry) => entry.isOutvoted && !isHighlighted(entry));
  const buttonSize = size === "large" ? "medium" : "small";

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
            dimmed={entry.isOutvoted}
            tooltip={<TagVotersTooltip challengeId={entry.challenge_id ?? challengeId} entry={entry} />}
            size={size}
            onClick={
              clickable
                ? () => playersModal.open({ challengeId: entry.challenge_id ?? challengeId, entry })
                : undefined
            }
          />
        ))}
        {showOutvotedToggle && (
          <Chip
            size={buttonSize}
            variant="outlined"
            icon={
              <FontAwesomeIcon
                icon={showOutvoted ? faEyeSlash : faEye}
                style={{ fontSize: "0.9em", marginLeft: "8px" }}
              />
            }
            label={showOutvoted ? t("hide_hidden") : t("show_hidden")}
            onClick={() => setShowOutvoted(!showOutvoted)}
          />
        )}
        {hasMore && (
          <Chip
            size={buttonSize}
            variant="outlined"
            label={expanded ? t("show_less") : t("show_more", { count: collapsedEntries.length - maxVisible })}
            onClick={() => setExpanded(!expanded)}
          />
        )}
      </Stack>
      {clickable && (
        <CustomModal modalHook={playersModal} contentSx={{ borderTop: "none" }}>
          {playersModal.data && (
            <TagPlayersList challengeId={playersModal.data.challengeId} entry={playersModal.data.entry} />
          )}
        </CustomModal>
      )}
    </>
  );
}
//#endregion

//#region TagVotersTooltip
// Only mounted while the tooltip is open, so the players are fetched lazily on hover
function TagVotersTooltip({ challengeId, entry }) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags" });
  const query = useGetChallengeTagPlayers(challengeId, entry.tag_value_id);

  if (query.isLoading) {
    return <LoadingSpinner size="small" />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const assignments = getQueryData(query);
  const listed = assignments.slice(0, MAX_TOOLTIP_VOTERS);
  return (
    <Stack direction="column">
      <Typography variant="caption" sx={{ opacity: 0.75 }}>
        {getTagValueLabel(entry.tag, entry.value)}
      </Typography>
      {listed.map((assignment) => (
        <Typography key={assignment.id} variant="body2">
          {assignment.player.name}
        </Typography>
      ))}
      {assignments.length > listed.length && (
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          {t("show_more", { count: assignments.length - listed.length })}
        </Typography>
      )}
    </Stack>
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

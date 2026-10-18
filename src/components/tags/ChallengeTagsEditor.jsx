import { faMinus, faPen, faPlus, faTags } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, ButtonBase, Divider, Stack, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useAuth } from "../../hooks/AuthProvider";
import { useAppSettings } from "../../hooks/AppSettingsProvider";
import { useRestriction } from "../../hooks/useRestriction";
import { RESTRICTIONS } from "../../pages/Account";
import {
  getQueryData,
  useGetChallengeTagCounts,
  useGetTagAssignment,
  usePostTagAssignment,
} from "../../hooks/useApi";
import { CustomModal, useModal } from "../../hooks/useModal";
import { ErrorDisplay, LoadingSpinner, SegmentedChip, safeAlpha, safeLighten } from "../basic";
import { ChallengeInline, RestrictionNotice } from "../goldberries";

import { ChallengeTagChips } from "./ChallengeTagChips";
import { TagsEditor } from "./TagsEditor";
import { allowsNegativeVotes } from "./tag_util";

//#region ChallengeTagsSection
// Tag chips of a challenge plus a button for the current player to add/edit their own tags
export function ChallengeTagsSection({
  challenge,
  counts = null,
  maxVisible = 8,
  showIcon = true,
  highlightedValueIds = null,
  sortHighlightedFirst = true,
  hideOutvoted,
  emptyText,
  sx,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags" });
  const auth = useAuth();
  const { settings } = useAppSettings();
  const editModal = useModal();

  const canEdit = auth.hasPlayerClaimed && !challenge.is_rejected;

  return (
    <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap" sx={sx}>
      {showIcon && <FontAwesomeIcon icon={faTags} style={{ opacity: 0.7 }} />}
      {/* display: contents lets the chips wrap within this row, instead of their own wrapping box taking up a full line */}
      <ChallengeTagChips
        challengeId={challenge.id}
        counts={counts}
        maxVisible={maxVisible}
        highlightedValueIds={highlightedValueIds}
        sortHighlightedFirst={sortHighlightedFirst}
        hideOutvoted={hideOutvoted ?? !settings.general.alwaysShowOutvotedTags}
        emptyText={emptyText === undefined ? t("no_tags") : emptyText}
        sx={{ display: "contents" }}
      />
      {canEdit && (
        <>
          <EditTagsChip challengeId={challenge.id} playerId={auth.user.player.id} onClick={editModal.open} />
          <ChallengeTagsEditorModal
            modalHook={editModal}
            challenge={challenge}
            player={auth.user.player}
          />
        </>
      )}
    </Stack>
  );
}
//#endregion

//#region EditTagsChip
function EditTagsChip({ challengeId, playerId, onClick }) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags" });
  const theme = useTheme();
  const query = useGetTagAssignment(challengeId, playerId);
  const { isRestricted, message } = useRestriction(RESTRICTIONS.add_tags);
  const assignment = getQueryData(query);
  const hasTags =
    (assignment?.tag_value_ids?.length ?? 0) + (assignment?.negative_tag_value_ids?.length ?? 0) > 0;
  const color = theme.palette.primary.main;
  // Restricted players can still remove their own tags, so only block the chip if there is nothing to remove
  const isDisabled = isRestricted && !hasTags;

  const chip = (
    <SegmentedChip
      onClick={() => onClick()}
      disabled={isDisabled}
      segments={[
        {
          key: "icon",
          label: <FontAwesomeIcon icon={hasTags ? faPen : faPlus} size="sm" />,
          color: safeLighten(color, 0.45),
        },
        { key: "text", label: hasTags ? t("edit") : t("add"), color, sx: { fontWeight: 500 } },
      ]}
    />
  );
  if (!isDisabled) return chip;
  return (
    <Tooltip title={message} arrow placement="top">
      {chip}
    </Tooltip>
  );
}
//#endregion

//#region ChallengeTagsEditorModal
export function ChallengeTagsEditorModal({ modalHook, challenge, player }) {
  return (
    <CustomModal modalHook={modalHook} maxWidth="md" options={{ hideFooter: true }}>
      {modalHook.isVisible && (
        <ChallengeTagsEditor challenge={challenge} player={player} onClose={modalHook.close} />
      )}
    </CustomModal>
  );
}
//#endregion

//#region ChallengeTagsEditor
function ChallengeTagsEditor({ challenge, player, onClose }) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags.editor_modal" });
  const { t: t_m } = useTranslation(undefined, { keyPrefix: "general.modals.buttons" });
  const auth = useAuth();
  const [value, setValue] = useState(null);
  const [negativeValue, setNegativeValue] = useState(null);
  const challengeId = challenge.id;
  const query = useGetTagAssignment(challengeId, player.id);
  const countsQuery = useGetChallengeTagCounts(challengeId);
  const { mutate: saveTags, isLoading: isSaving } = usePostTagAssignment((data) => {
    setValue(data.tag_value_ids);
    setNegativeValue(data.negative_tag_value_ids);
    toast.success(t("feedback.saved"));
    onClose();
  });
  const { isRestricted } = useRestriction(RESTRICTIONS.add_tags);

  const assignment = getQueryData(query);
  useEffect(() => {
    if (assignment && value === null) {
      setValue(assignment.tag_value_ids);
      setNegativeValue(assignment.negative_tag_value_ids ?? []);
    }
  }, [assignment]);

  const isReady = value !== null && negativeValue !== null;
  const serverCounts = getQueryData(countsQuery);
  const previewCounts =
    isReady && serverCounts ? getPreviewCounts(serverCounts, assignment, value, negativeValue) : null;

  // Voting for a value removes the vote against it and vice versa
  const onChangeValue = (ids) => {
    setValue(ids);
    setNegativeValue(negativeValue.filter((id) => !ids.includes(id)));
  };
  const toggleNegative = (valueId) => {
    if (negativeValue.includes(valueId)) {
      setNegativeValue(negativeValue.filter((id) => id !== valueId));
    } else {
      setNegativeValue([...negativeValue, valueId]);
      setValue(value.filter((id) => id !== valueId));
    }
  };

  const getNegativeSegment = (entry) => {
    const { tag, category, tag_value_id: valueId } = entry;
    if (!allowsNegativeVotes(tag) || category.is_archived) return null;
    if (!tag.is_player_assignable && !auth.hasHelperPriv) return null;
    const isNegative = negativeValue.includes(valueId);
    // Only values someone else voted for can be voted against
    const serverEntry = serverCounts?.find((c) => c.tag_value_id === valueId);
    const ownPositive = assignment?.tag_value_ids.includes(valueId) ? 1 : 0;
    const otherPositive = serverEntry ? serverEntry.count + (serverEntry.negative ?? 0) - ownPositive : 0;
    if (!isNegative && otherPositive <= 0) return null;
    return {
      key: "negative",
      color: "transparent",
      label: (
        <NegativeVoteButton
          isNegative={isNegative}
          disabled={isSaving || (isRestricted && !isNegative)}
          onClick={() => toggleNegative(valueId)}
        />
      ),
      sx: { p: 0 },
    };
  };

  const onSave = () => {
    saveTags({
      challenge_id: challengeId,
      player_id: player.id,
      tag_value_ids: value,
      negative_tag_value_ids: negativeValue,
    });
  };

  return (
    <Stack direction="column" gap={2}>
      <ChallengeInline challenge={challenge} showChallenge />
      <Divider />
      <RestrictionNotice restriction={RESTRICTIONS.add_tags} />
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {t("current_tags")}
        </Typography>
        {countsQuery.isError ? (
          <ErrorDisplay error={countsQuery.error} />
        ) : previewCounts === null ? (
          <LoadingSpinner size="small" />
        ) : (
          <ChallengeTagChips
            challengeId={challengeId}
            counts={previewCounts}
            maxVisible={null}
            clickable={false}
            emptyText={t("no_tags")}
            getChipTrailingSegment={getNegativeSegment}
          />
        )}
      </Box>
      <Divider />
      {query.isLoading || !isReady ? (
        query.isError ? (
          <ErrorDisplay error={query.error} />
        ) : (
          <LoadingSpinner />
        )
      ) : (
        <TagsEditor
          value={value}
          onChange={onChangeValue}
          canEditTeamTags={auth.hasHelperPriv}
          disabled={isSaving}
          allowedValueIds={isRestricted ? (assignment?.tag_value_ids ?? []) : null}
          negativeValueIds={negativeValue}
        />
      )}
      <Divider />
      <Stack direction="row" justifyContent="flex-end" gap={1}>
        <Button variant="outlined" onClick={() => onClose(true)}>
          {t_m("cancel")}
        </Button>
        <Button variant="contained" onClick={onSave} disabled={!isReady || isSaving}>
          {t_m("save")}
        </Button>
      </Stack>
    </Stack>
  );
}
//#endregion

//#region NegativeVoteButton
function NegativeVoteButton({ isNegative, disabled, onClick }) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags.editor_modal" });
  const theme = useTheme();
  const color = theme.palette.error.main;
  return (
    <Tooltip title={isNegative ? t("remove_negative") : t("add_negative")} arrow placement="top">
      <Box component="span" sx={{ display: "flex", alignSelf: "stretch" }}>
        <ButtonBase
          onClick={onClick}
          disabled={disabled}
          aria-label={isNegative ? t("remove_negative") : t("add_negative")}
          aria-pressed={isNegative}
          sx={{
            px: 1,
            backgroundColor: isNegative ? color : safeAlpha(color, 0.15),
            color: isNegative ? theme.palette.error.contrastText : color,
            borderLeft: `1px solid ${safeAlpha(color, 0.6)}`,
            "&:hover": { filter: "brightness(1.2)" },
            "&.Mui-disabled": { opacity: 0.5 },
          }}
        >
          <FontAwesomeIcon icon={faMinus} size="sm" fixedWidth />
        </ButtonBase>
      </Box>
    </Tooltip>
  );
}
//#endregion

//#region Utility Functions
// Applies the player's unsaved changes to the challenge's tag counts, so the chips show the result of saving
function getPreviewCounts(serverCounts, assignment, value, negativeValue) {
  const savedPositive = new Set(assignment?.tag_value_ids ?? []);
  const savedNegative = new Set(assignment?.negative_tag_value_ids ?? []);
  const positive = new Set(value);
  const negative = new Set(negativeValue);
  const byValueId = {};
  for (const entry of serverCounts) {
    const negativeCount = entry.negative ?? 0;
    byValueId[entry.tag_value_id] = { positive: entry.count + negativeCount, negative: negativeCount };
  }
  for (const id of new Set([...savedPositive, ...savedNegative, ...positive, ...negative])) {
    const entry = byValueId[id] ?? (byValueId[id] = { positive: 0, negative: 0 });
    entry.positive += (positive.has(id) ? 1 : 0) - (savedPositive.has(id) ? 1 : 0);
    entry.negative += (negative.has(id) ? 1 : 0) - (savedNegative.has(id) ? 1 : 0);
  }
  return Object.entries(byValueId)
    .filter(([, entry]) => entry.positive > 0 || entry.negative > 0)
    .map(([id, entry]) => ({
      tag_value_id: Number(id),
      count: entry.positive - entry.negative,
      negative: entry.negative,
    }));
}
//#endregion

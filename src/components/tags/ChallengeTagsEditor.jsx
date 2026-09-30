import { faPen, faPlus, faTags } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Divider, Stack, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useAuth } from "../../hooks/AuthProvider";
import { useAppSettings } from "../../hooks/AppSettingsProvider";
import { useRestriction } from "../../hooks/useRestriction";
import { RESTRICTIONS } from "../../pages/Account";
import { getQueryData, useGetTagAssignment, usePostTagAssignment } from "../../hooks/useApi";
import { CustomModal, useModal } from "../../hooks/useModal";
import { ErrorDisplay, LoadingSpinner, SegmentedChip, safeLighten } from "../basic";
import { RestrictionNotice } from "../goldberries";

import { ChallengeTagChips } from "./ChallengeTagChips";
import { TagsEditor } from "./TagsEditor";

//#region ChallengeTagsSection
// Tag chips of a challenge plus a button for the current player to add/edit their own tags
export function ChallengeTagsSection({ challenge, maxVisible = 8, showIcon = true, sx }) {
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
        maxVisible={maxVisible}
        hideOutvoted={!settings.general.alwaysShowOutvotedTags}
        emptyText={t("no_tags")}
        sx={{ display: "contents" }}
      />
      {canEdit && (
        <>
          <EditTagsChip challengeId={challenge.id} playerId={auth.user.player.id} onClick={editModal.open} />
          <ChallengeTagsEditorModal
            modalHook={editModal}
            challengeId={challenge.id}
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
  const hasTags = (getQueryData(query)?.tag_value_ids?.length ?? 0) > 0;
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
export function ChallengeTagsEditorModal({ modalHook, challengeId, player }) {
  return (
    <CustomModal modalHook={modalHook} maxWidth="md" options={{ hideFooter: true }}>
      {modalHook.isVisible && (
        <ChallengeTagsEditor challengeId={challengeId} player={player} onClose={modalHook.close} />
      )}
    </CustomModal>
  );
}
//#endregion

//#region ChallengeTagsEditor
function ChallengeTagsEditor({ challengeId, player, onClose }) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags.editor_modal" });
  const { t: t_m } = useTranslation(undefined, { keyPrefix: "general.modals.buttons" });
  const auth = useAuth();
  const [value, setValue] = useState(null);
  const query = useGetTagAssignment(challengeId, player.id);
  const { mutate: saveTags, isLoading: isSaving } = usePostTagAssignment((data) => {
    setValue(data.tag_value_ids);
    toast.success(t("feedback.saved"));
    onClose();
  });
  const { isRestricted } = useRestriction(RESTRICTIONS.add_tags);

  const assignment = getQueryData(query);
  useEffect(() => {
    if (assignment && value === null) {
      setValue(assignment.tag_value_ids);
    }
  }, [assignment]);

  const onSave = () => {
    saveTags({ challenge_id: challengeId, player_id: player.id, tag_value_ids: value });
  };

  return (
    <Stack direction="column" gap={2}>
      <RestrictionNotice restriction={RESTRICTIONS.add_tags} />
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {t("current_tags")}
        </Typography>
        <ChallengeTagChips
          challengeId={challengeId}
          maxVisible={null}
          clickable={false}
          emptyText={t("no_tags")}
        />
      </Box>
      <Divider />
      {query.isLoading || value === null ? (
        query.isError ? (
          <ErrorDisplay error={query.error} />
        ) : (
          <LoadingSpinner />
        )
      ) : (
        <TagsEditor
          value={value}
          onChange={setValue}
          canEditTeamTags={auth.hasHelperPriv}
          disabled={isSaving}
          allowedValueIds={isRestricted ? (assignment?.tag_value_ids ?? []) : null}
        />
      )}
      <Divider />
      <Stack direction="row" justifyContent="flex-end" gap={1}>
        <Button variant="outlined" onClick={() => onClose(true)}>
          {t_m("cancel")}
        </Button>
        <Button variant="contained" onClick={onSave} disabled={value === null || isSaving}>
          {t_m("save")}
        </Button>
      </Stack>
    </Stack>
  );
}
//#endregion

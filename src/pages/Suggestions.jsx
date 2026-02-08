import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useDebounce } from "@uidotdev/usehooks";
import { Box, Button, Dialog, DialogContent, Grid, Stack, Tooltip, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCircleCheck,
  faCircleXmark,
  faEyeSlash,
  faPlus,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

import { useDeleteSuggestion } from "../hooks/useApi";
import { useAuth } from "../hooks/AuthProvider";
import { BasicContainerBox, HeadTitle, StyledLink } from "../components/basic";
import { ChallengeFcIcon, DifficultyChip, ObjectiveIcon } from "../components/goldberries";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import { getChallengeCampaign, getChallengeSuffix, getMapNameClean } from "../util/data_util";
import { SuggestionsList, SuggestionsSearch } from "../components/suggestions_page/SuggestionsList";
import { ViewSuggestionModal } from "../components/suggestions_page/ViewSuggestionModal";
import { CreateSuggestionModal } from "../components/suggestions_page/CreateSuggestionModal";

//#region Main Page Component

export function PageSuggestions({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions" });
  const auth = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [type, setType] = useLocalStorage("search_filter_type", "all");
  const [tab, setTab] = useLocalStorage("search_filter_tab", "active");
  const [search, setSearch] = useLocalStorage("suggestions_search", "");
  const searchDebounced = useDebounce(search, 500);

  const newSuggestion = () => {
    modalRefs.create.current.open();
  };

  const onCloseSuggestion = () => {
    navigate("/suggestions");
  };
  const openSuggestion = (id) => {
    navigate("/suggestions/" + id);
  };

  const modalRefs = {
    create: useRef(),
    delete: useRef(),
    view: useRef(),
  };
  modalRefs.view.current = openSuggestion;

  const filterOptions = [
    { value: "all", label: t("filter.all") },
    { value: "general", label: t("filter.general") },
    { value: "challenge", label: t("filter.challenge") },
    { value: "challenge_own", label: t("filter.challenge_own") },
  ];
  const stateOptions = [
    { value: "active", label: t("active") },
    { value: "undecided", label: t("undecided") },
    { value: "expired", label: t("expired") },
  ];
  const tabExpiredValue = tab === "expired" ? true : tab === "undecided" ? null : false;

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={t("title")} />
      <Grid container>
        <Grid item xs>
          <Typography variant="h4">{t("header")}</Typography>
        </Grid>
        <Grid item xs="auto">
          {auth.hasPlayerClaimed && (
            <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={newSuggestion}>
              {t("buttons.create")}
            </Button>
          )}
        </Grid>
      </Grid>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {t("language_info")}
      </Typography>

      <RadioButtonsGroup
        title={t("filter_by_type")}
        options={filterOptions}
        value={type}
        onChange={(v) => setType(v)}
      />
      <RadioButtonsGroup
        title={t("filter_by_state")}
        options={stateOptions}
        value={tab}
        onChange={(v) => setTab(v)}
      />
      <SuggestionsSearch search={search} setSearch={setSearch} />
      <SuggestionsList
        expired={tabExpiredValue}
        defaultPerPage={25}
        modalRefs={modalRefs}
        filterType={type}
        tab={tab}
        search={searchDebounced}
      />

      <SuggestionsModalContainer modalRefs={modalRefs} suggestionId={id} closeModal={onCloseSuggestion} />
    </BasicContainerBox>
  );
}

//#endregion

//#region Modal Container

function SuggestionsModalContainer({ modalRefs, suggestionId, closeModal }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.delete" });
  const { mutate: deleteSuggestion } = useDeleteSuggestion();

  const createSuggestionModal = useModal();
  const deleteSuggestionModal = useModal(null, (cancelled, data) => {
    if (cancelled) return;
    deleteSuggestion(data.id);
  });

  // Setting the refs
  modalRefs.create.current = createSuggestionModal;
  modalRefs.delete.current = deleteSuggestionModal;

  return (
    <>
      <CustomModal modalHook={createSuggestionModal} maxWidth="sm" options={{ hideFooter: true }}>
        <CreateSuggestionModal id={createSuggestionModal.data} onSuccess={createSuggestionModal.close} />
      </CustomModal>

      <Dialog
        onClose={closeModal}
        open={suggestionId !== undefined}
        maxWidth="md"
        fullWidth
        disableScrollLock
        disableRestoreFocus
      >
        <DialogContent dividers>
          {suggestionId !== undefined && <ViewSuggestionModal id={suggestionId} />}
        </DialogContent>
      </Dialog>

      <CustomModal
        modalHook={deleteSuggestionModal}
        options={{ title: t("title") }}
        actions={[ModalButtons.cancel, ModalButtons.delete]}
      >
        <Typography variant="body1">{t("info")}</Typography>
      </CustomModal>
    </>
  );
}

//#endregion

//#region Shared Components (used by multiple files)

export function DifficultyMoveDisplay({ from, to, ...props }) {
  return (
    <Stack direction="row" gap={1} alignItems="center" {...props}>
      {from && <DifficultyChip difficulty={from} />}
      <FontAwesomeIcon icon={faArrowRight} />
      {to && <DifficultyChip difficulty={to} />}
    </Stack>
  );
}

export function SuggestionName({ suggestion, expired }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.name" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const theme = useTheme();
  const challenge = suggestion.challenge;
  const map = challenge?.map;
  const campaign = getChallengeCampaign(challenge);
  const sameMapName =
    suggestion.challenge_id !== null && challenge.map_id !== null && map.name === campaign.name;

  return (
    <Stack direction="column" gap={0}>
      <Stack direction="row" gap={1} alignItems="center">
        {suggestion.challenge_id === null ? (
          <>
            <Typography variant="h6">{t("general")}</Typography>
          </>
        ) : (
          <>
            <Stack direction="column" gap={1}>
              <StyledLink to={"/challenge/" + challenge.id} onClick={(e) => e.stopPropagation()}>
                <Typography variant="h6">
                  {getMapNameClean(map, campaign, t_g, true)}
                  {getChallengeSuffix(challenge) && " [" + getChallengeSuffix(challenge) + "]"}
                </Typography>
              </StyledLink>
            </Stack>
            <ObjectiveIcon objective={challenge.objective} challenge={challenge} height="1.2em" />
            <ChallengeFcIcon challenge={challenge} height="1.4em" />
          </>
        )}
        {suggestion.is_verified !== false && (expired === true || expired === null) && (
          <SuggestionAcceptedIcon isAccepted={suggestion.is_accepted} />
        )}
        {suggestion.is_verified === null && (
          <Tooltip title={t("pending")} arrow placement="top">
            <FontAwesomeIcon icon={faEyeSlash} />
          </Tooltip>
        )}
        {suggestion.is_verified === false && (
          <Tooltip title={t("rejected")} arrow placement="top">
            <FontAwesomeIcon icon={faCircleXmark} color={theme.palette.error.main} />
          </Tooltip>
        )}
      </Stack>

      {suggestion.challenge_id !== null && (
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          sx={{
            pl: {
              xs: 0,
              sm: 0,
            },
            color: theme.palette.text.secondary,
          }}
        >
          {sameMapName
            ? t("same_map", { author: campaign.author_gb_name })
            : t("different_map", { campaign: campaign.name, author: campaign.author_gb_name })}
        </Stack>
      )}
    </Stack>
  );
}

export function SuggestionAcceptedIcon({ isAccepted, height = "1.5em" }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.icon" });
  const theme = useTheme();

  if (isAccepted === null)
    return (
      <Tooltip title={t("undecided")} arrow placement="top">
        <FontAwesomeIcon icon={faQuestionCircle} height={height} />
      </Tooltip>
    );

  const acceptedText = t(isAccepted ? "accepted" : "rejected");
  const icon = isAccepted === true ? faCircleCheck : faCircleXmark;
  const color = isAccepted ? theme.palette.success.main : theme.palette.error.main;
  return (
    <Tooltip title={acceptedText} arrow placement="top">
      <FontAwesomeIcon icon={icon} color={color} height={height} />
    </Tooltip>
  );
}

export function CharsCountLabel({ text, minChars = -1, maxChars }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.chars_count_label" });
  text = text ?? "";
  const length = text.length;
  const color = length < minChars || length > maxChars ? "error" : "text.secondary";
  return (
    <Typography variant="caption" color={color}>
      {t("label", { count: length, max: maxChars })}
    </Typography>
  );
}

export function SuggestionCommentDisplay({ comment, ...props }) {
  if (!comment) return "-";

  return (
    <Box component="span" sx={{ whiteSpace: "pre-wrap" }} {...props}>
      {comment}
    </Box>
  );
}

//#endregion

//#region Helper Components

function RadioButtonsGroup({ title, options, value, onChange, color = "primary", sx = {}, ...props }) {
  const variantUnselected = "outlined";
  const variantSelected = "contained";
  return (
    <Stack direction="column" gap={0} sx={{ mb: 0, ...sx }} {...props}>
      <Typography variant="h6">{title}</Typography>
      <Stack direction="row" gap={2} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? variantSelected : variantUnselected}
            color={color}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
//#endregion

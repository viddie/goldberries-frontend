import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faClock,
  faComment,
  faEdit,
  faShield,
  faUser,
  faTrash,
  faCheckCircle,
  faExternalLink,
  faFlagCheckered,
  faBook,
  faCalendar,
  faGaugeSimpleHigh,
  faMapLocation,
  faWorm,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

import { useAuth } from "../hooks/AuthProvider";
import {
  DifficultyChip,
  VerificationStatusChip,
  PlayerChip,
  SubmissionFcIcon,
} from "../components/goldberries";
import {
  displayDate,
  getChallengeCampaign,
  getChallengeNameShort,
  getGamebananaEmbedUrl,
  getMapName,
  getSubmissionVerifier,
  secondsToDuration,
} from "../util/data_util";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import {
  BasicContainerBox,
  ErrorDisplay,
  LoadingSpinner,
  ProofEmbed,
  HeadTitle,
  StyledExternalLink,
  InfoBox,
  InfoBoxIconTextLine,
  TooltipLineBreaks,
} from "../components/basic";
import { CustomMenu } from "../components/Menu";
import { FormSubmissionWrapper } from "../components/forms/Submission";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import { getQueryData, useDeleteSubmission, useGetSubmission } from "../hooks/useApi";
import { dateToTimeAgoString, jsonDateToJsDate } from "../util/util";

import { FadingMapBanner } from "./Challenge";

export function PageSubmission({}) {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <BasicContainerBox
      maxWidth="md"
      sx={{
        backgroundColor: "#282828",
        border: "none",
        p: 0,
        pt: 0,
        pb: 0,
        overflow: "hidden",
      }}
    >
      <SubmissionDisplay
        id={parseInt(id)}
        onDelete={() => {
          navigate("/");
        }}
      />
    </BasicContainerBox>
  );
}

export function SubmissionDisplay({ id, onDelete }) {
  const { t } = useTranslation(undefined, { keyPrefix: "submission" });
  const auth = useAuth();
  const query = useGetSubmission(id);
  const { mutate: deleteSubmission } = useDeleteSubmission((submission) => {
    toast.success(t("feedback.deleted"));
    if (onDelete !== undefined) onDelete();
  });

  const editModal = useModal();
  const deleteModal = useModal(
    null,
    (cancelled, data) => {
      if (cancelled) return;
      deleteSubmission(data.id);
    },
    { actions: [ModalButtons.cancel, ModalButtons.delete] },
  );

  if (query.isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <LoadingSpinner />
      </Box>
    );
  } else if (query.isError) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <ErrorDisplay error={query.error} />
      </Box>
    );
  }

  const submission = getQueryData(query);
  const isOwnSubmission = auth.hasPlayerClaimed && submission && submission.player_id === auth.user.player.id;
  const isHelper = auth.hasHelperPriv;

  const challenge = submission.challenge;
  const map = challenge?.map;
  const campaign = getChallengeCampaign(challenge);

  let title = "";
  if (submission.new_challenge !== null) {
    title = t("title", { challenge: submission.new_challenge.name, player: submission.player.name });
  } else {
    const challengeName = (map?.name ?? campaign.name) + " - " + getChallengeNameShort(challenge);
    title = t("title", { challenge: challengeName, player: submission.player.name });
  }

  const contentPadding = { px: { xs: 2, sm: 3 } };

  return (
    <Box sx={{ pb: { xs: 2, sm: 3 } }}>
      <HeadTitle title={title} />

      {/* Banner image - full width, fading into background */}
      {map ? (
        <FadingMapBanner id={map.id} alt={getMapName(map, campaign, false)} size="small" />
      ) : campaign ? (
        <FadingMapBanner
          alt={campaign.name}
          src={getGamebananaEmbedUrl(campaign.url, "large")}
          size="small"
        />
      ) : null}

      {/* Breadcrumbs + modify button */}
      <Box sx={{ ...contentPadding, mb: 1.5 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          {challenge !== null && (
            <GoldberriesBreadcrumbs
              campaign={campaign}
              map={map}
              challenge={challenge}
              submission={submission}
            />
          )}
          <Box flexGrow={1} />
          {(isHelper || isOwnSubmission) && (
            <CustomMenu
              title={t("buttons.modify")}
              variant="outlined"
              items={[
                { icon: faEdit, text: t("buttons.edit"), onClick: () => editModal.open(submission) },
                { divider: true },
                {
                  icon: faTrash,
                  text: t("buttons.delete"),
                  color: "error",
                  onClick: () => deleteModal.open(submission),
                },
              ]}
            />
          )}
        </Stack>
      </Box>

      {/* Video embed - full width */}
      <Box sx={{ "& iframe": { border: "none" } }}>
        <ProofEmbed url={submission.proof_url} />
      </Box>

      {/* Details grid */}
      <Box sx={{ ...contentPadding, mt: 2 }}>
        <SubmissionDetailsGrid submission={submission} />
      </Box>

      <CustomModal modalHook={editModal} options={{ hideFooter: true }}>
        <FormSubmissionWrapper id={editModal.data?.id} onSave={() => editModal.close()} />
      </CustomModal>

      <CustomModal modalHook={deleteModal} options={{ title: t("delete_modal.title") }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t("delete_modal.description")}
        </Typography>
      </CustomModal>
    </Box>
  );
}

export function FullChallengeDisplay({
  challenge,
  map,
  campaign,
  hideMap = false,
  showObjective = false,
  ...props
}) {
  return (
    <Grid container columnSpacing={1} rowSpacing={1} {...props}>
      <Grid item xs={12} sm={12} display="flex" flexDirection="column" rowGap={1}>
        <ChallengeInfoBoxes
          challenge={challenge}
          map={map}
          campaign={campaign}
          hideMap={hideMap}
          showObjective={showObjective}
        />
      </Grid>
    </Grid>
  );
}

//#region Submission Details Grid
function SubmissionDetailsGrid({ submission }) {
  const { t } = useTranslation(undefined, { keyPrefix: "submission.details" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_a } = useTranslation();
  const verifier = getSubmissionVerifier(submission);
  const challenge = submission.challenge;
  const newChallenge = submission.new_challenge;

  return (
    <Grid container columnSpacing={1.5} rowSpacing={1.5}>
      {/* Column 1: Challenge / New Challenge Info */}
      <Grid item xs={12} sm={4} display="flex" flexDirection="column" gap={1}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontSize: "0.7rem", letterSpacing: "0.08em", lineHeight: 1.5 }}
          textAlign="center"
        >
          {challenge === null ? t("new_challenge") : t_g("challenge", { count: 1 })}
        </Typography>
        {challenge !== null ? (
          <ChallengeDetailCells challenge={challenge} submission={submission} />
        ) : (
          <>
            <DetailCell label={t_a("forms.create_full_challenge.campaign.url")}>
              <StyledExternalLink href={newChallenge.url}>{newChallenge.url}</StyledExternalLink>
            </DetailCell>
            <DetailCell label={t_g("map", { count: 1 })}>{newChallenge.name}</DetailCell>
            <DetailCell label={t_g("description")}>{newChallenge.description ?? "-"}</DetailCell>
          </>
        )}
      </Grid>

      {/* Column 2: Submission Info */}
      <Grid item xs={12} sm={4} display="flex" flexDirection="column" gap={1}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontSize: "0.7rem", letterSpacing: "0.08em", lineHeight: 1.5 }}
          textAlign="center"
        >
          {t_g("submission", { count: 1 })}
        </Typography>
        <DetailCell label={t_g("player", { count: 1 })} icon={<FontAwesomeIcon icon={faUser} fixedWidth />}>
          <PlayerChip player={submission.player} size="small" />
        </DetailCell>
        <DetailCell label={t("achieved")} icon={<FontAwesomeIcon icon={faCalendar} fixedWidth />}>
          <Stack
            direction="row"
            alignItems="baseline"
            justifyContent="space-between"
            flexWrap="wrap"
            columnGap={1}
          >
            <DateWithTooltip date={submission.date_achieved} />
            {submission.time_taken && (
              <Stack direction="row" alignItems="baseline" gap={0.5} sx={{ whiteSpace: "nowrap" }}>
                <Typography variant="body2">{secondsToDuration(submission.time_taken)}</Typography>
                <TooltipLineBreaks title={t("time_taken_explanation")}>
                  <FontAwesomeIcon icon={faClock} size="sm" />
                </TooltipLineBreaks>
              </Stack>
            )}
          </Stack>
        </DetailCell>
        <DetailCell
          label={t_a("forms.submission.player_notes")}
          icon={<FontAwesomeIcon icon={faComment} fixedWidth />}
        >
          {submission.player_notes ?? "-"}
        </DetailCell>
        <DetailCell
          label={t_a("components.difficulty_select.label")}
          icon={<FontAwesomeIcon icon={faGaugeSimpleHigh} fixedWidth />}
        >
          {submission.suggested_difficulty === null ? (
            "-"
          ) : (
            <DifficultyChip
              difficulty={submission.suggested_difficulty}
              frac={submission.frac ?? 50}
              isPersonal={submission.is_personal}
            />
          )}
        </DetailCell>
        <DetailCell label={t("links")} icon={<FontAwesomeIcon icon={faExternalLink} fixedWidth />}>
          <Stack direction="row" gap={2}>
            <StyledExternalLink href={submission.proof_url}>{t("video")}</StyledExternalLink>
            {submission.raw_session_url !== null && (
              <StyledExternalLink href={submission.raw_session_url}>{t("raw_session")}</StyledExternalLink>
            )}
          </Stack>
        </DetailCell>
      </Grid>

      {/* Column 3: Verification Info */}
      <Grid item xs={12} sm={4} display="flex" flexDirection="column" gap={1}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontSize: "0.7rem", letterSpacing: "0.08em", lineHeight: 1.5 }}
          textAlign="center"
        >
          {t("verification")}
        </Typography>
        {submission.is_verified !== null ? (
          <>
            <DetailCell
              label={t_a("forms.submission.verifier")}
              icon={<FontAwesomeIcon icon={faUser} fixedWidth />}
            >
              {verifier.id ? <PlayerChip player={submission.verifier} size="small" /> : verifier.name}
            </DetailCell>
            <DetailCell label={t("submitted")} icon={<FontAwesomeIcon icon={faCalendar} fixedWidth />}>
              <DateWithTooltip date={submission.date_created} />
            </DetailCell>
            <DetailCell
              label={t_a("forms.submission.verifier_notes")}
              icon={<FontAwesomeIcon icon={faComment} fixedWidth />}
            >
              {submission.verifier_notes ?? "-"}
            </DetailCell>
            <DetailCell label={t("status")} icon={<FontAwesomeIcon icon={faShield} fixedWidth />}>
              <Stack direction="column" gap={0.5} alignItems="flex-start">
                <VerificationStatusChip isVerified={submission.is_verified} size="small" />
                <DateWithTooltip
                  date={submission.date_verified}
                  style={{ fontSize: "0.8rem", opacity: 0.7 }}
                />
              </Stack>
            </DetailCell>
          </>
        ) : (
          <>
            <DetailCell label={t("status")} icon={<FontAwesomeIcon icon={faShield} fixedWidth />}>
              <VerificationStatusChip isVerified={submission.is_verified} size="small" />
            </DetailCell>
            <DetailCell label={t("submitted")} icon={<FontAwesomeIcon icon={faClock} fixedWidth />}>
              <DateWithTooltip date={submission.date_created} />
            </DetailCell>
          </>
        )}
      </Grid>
    </Grid>
  );
}

function DetailCell({ label, icon, children }) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 1,
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "background-color 0.15s ease",
        minHeight: 70,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        "&:hover": {
          backgroundColor: "rgba(255,255,255,0.03)",
        },
      }}
    >
      <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 0.5 }}>
        {icon && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.75rem", width: 16, textAlign: "center" }}
          >
            {icon}
          </Typography>
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight="bold"
          sx={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.03em" }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        component="div"
        sx={{ wordBreak: "break-word", whiteSpace: "pre-line", pl: icon ? "24px" : 0 }}
      >
        {children}
      </Typography>
    </Box>
  );
}

function ChallengeDetailCells({ challenge, submission }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_a } = useTranslation();
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);
  return (
    <>
      <DetailCell label={t_g("campaign", { count: 1 })} icon={<FontAwesomeIcon icon={faBook} fixedWidth />}>
        {campaign.name}
      </DetailCell>
      {map !== null && getMapName(map, campaign) !== campaign.name && (
        <DetailCell
          label={t_g("map", { count: 1 })}
          icon={<FontAwesomeIcon icon={faMapLocation} fixedWidth />}
        >
          {getMapName(map, campaign)}
        </DetailCell>
      )}
      {map === null && (
        <DetailCell label={t_a("challenge.is_full_game")} icon={<FontAwesomeIcon icon={faWorm} fixedWidth />}>
          <FontAwesomeIcon icon={faCheckCircle} color="green" />
        </DetailCell>
      )}
      <DetailCell
        label={t_g("challenge", { count: 1 })}
        icon={<FontAwesomeIcon icon={faFlagCheckered} fixedWidth />}
      >
        <Stack direction="row" alignItems="center" gap={0.75}>
          <span>{getChallengeNameShort(challenge)}</span>
          {submission.is_fc && challenge.has_fc && (
            <>
              <FontAwesomeIcon icon={faArrowRight} size="xs" style={{ opacity: 0.5 }} />
              <SubmissionFcIcon submission={submission} height="1.2em" />
            </>
          )}
        </Stack>
      </DetailCell>
      <DetailCell
        label={t_g("difficulty", { count: 1 })}
        icon={<FontAwesomeIcon icon={faGaugeSimpleHigh} fixedWidth />}
      >
        <DifficultyChip difficulty={challenge.difficulty} />
      </DetailCell>
    </>
  );
}
//#endregion

function ChallengeInfoBoxes({ challenge, map, campaign, hideMap = false, showObjective = false }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_a } = useTranslation();
  map = map ?? challenge.map;
  campaign = campaign ?? getChallengeCampaign(challenge);
  const objectiveSuffix = showObjective ? " - " + challenge.objective.description : "";
  return (
    <>
      {!hideMap && (
        <InfoBox>
          <InfoBoxIconTextLine
            icon={<FontAwesomeIcon icon={faBook} />}
            text={t_g("campaign", { count: 1 })}
          />
          <InfoBoxIconTextLine text={campaign.name} isSecondary />
        </InfoBox>
      )}
      {map !== null ? (
        getMapName(map, campaign) === campaign.name ? null : (
          !hideMap && (
            <InfoBox>
              <InfoBoxIconTextLine text={t_g("map", { count: 1 })} />
              <InfoBoxIconTextLine text={getMapName(map, campaign)} isSecondary />
            </InfoBox>
          )
        )
      ) : (
        <InfoBox>
          <InfoBoxIconTextLine text={t_a("challenge.is_full_game")} />
          <InfoBoxIconTextLine text={<FontAwesomeIcon icon={faCheckCircle} color="green" />} isSecondary />
        </InfoBox>
      )}
      <InfoBox>
        <InfoBoxIconTextLine
          icon={<FontAwesomeIcon icon={faFlagCheckered} />}
          text={t_g("challenge", { count: 1 })}
        />
        <InfoBoxIconTextLine text={getChallengeNameShort(challenge) + objectiveSuffix} isSecondary />
      </InfoBox>
      <InfoBox>
        <InfoBoxIconTextLine text={t_g("difficulty", { count: 1 })} />
        <InfoBoxIconTextLine text={<DifficultyChip difficulty={challenge.difficulty} />} isSecondary />
      </InfoBox>
    </>
  );
}

export function DateWithTooltip({ date, ...props }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const tooltip =
    date === null || date === undefined ? "" : jsonDateToJsDate(date).toLocaleString(navigator.language);
  return (
    <TooltipLineBreaks title={tooltip}>
      <span {...props}>{displayDate(date, t_g)}</span>
    </TooltipLineBreaks>
  );
}

export function TimeDiffWithTooltip({ date, ...props }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const jsDate = jsonDateToJsDate(date);
  const tooltip = date === null || date === undefined ? "" : jsDate.toLocaleString(navigator.language);
  return (
    <TooltipLineBreaks title={tooltip}>
      <span {...props}>{dateToTimeAgoString(jsDate, t_g)}</span>
    </TooltipLineBreaks>
  );
}

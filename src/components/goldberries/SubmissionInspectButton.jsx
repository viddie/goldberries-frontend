import {
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faMagnifyingGlassChart } from "@fortawesome/free-solid-svg-icons";

import { getChallengeCampaign } from "../../util/data_util";
import { getQueryData, useGetSubmissionQueueInspect, usePostSubmission } from "../../hooks/useApi";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";
import { CustomIconButton, ErrorDisplay, LoadingSpinner } from "../basic";

import { ChallengeInline } from "./ChallengeInline";
import { VerificationStatusChip } from "./VerificationStatusChip";
import { SubmissionFcIcon } from "./ChallengeFcIcon";

export function SubmissionInspectButton({ id, sx = {} }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.submission_inspect" });
  const modal = useModal(null, undefined, { actions: [ModalButtons.close] });

  const query = useGetSubmissionQueueInspect(id);
  const data = getQueryData(query);

  const notes = data?.notes ?? [];
  const related = (data?.related ?? []).slice().sort(compareRelatedSubmissions);
  const hasNotes = notes.length > 0;
  const hasRelated = related.length > 0;

  return (
    <>
      <Tooltip arrow placement="top" title={t("title")}>
        <span style={{ alignSelf: "stretch", display: "flex" }}>
          <CustomIconButton
            variant={hasRelated ? "contained" : "outlined"}
            color={hasNotes ? "warning" : "primary"}
            onClick={() => modal.open()}
            disabled={query.isLoading}
            sx={{ alignSelf: "stretch", ...sx }}
          >
            <FontAwesomeIcon icon={faMagnifyingGlassChart} />
          </CustomIconButton>
        </span>
      </Tooltip>

      <CustomModal modalHook={modal} options={{}} maxWidth="md">
        <SubmissionInspectModalContent query={query} data={data} t={t} id={id} />
      </CustomModal>
    </>
  );
}

function compareRelatedSubmissions(a, b) {
  const challengeA = a.challenge;
  const challengeB = b.challenge;
  if (challengeA === null || challengeA === undefined) return challengeB === null || challengeB === undefined ? 0 : 1;
  if (challengeB === null || challengeB === undefined) return -1;

  const campaignA = getChallengeCampaign(challengeA);
  const campaignB = getChallengeCampaign(challengeB);
  const campaignComparison =
    compareNullable(campaignA?.name, campaignB?.name, (left, right) => left.localeCompare(right)) ||
    compareNullable(campaignA?.id, campaignB?.id);
  if (campaignComparison !== 0) return campaignComparison;

  const mapA = challengeA.map;
  const mapB = challengeB.map;
  for (const field of ["sort_major", "sort_minor", "sort_order"]) {
    const comparison = compareNullable(mapA?.[field], mapB?.[field]);
    if (comparison !== 0) return comparison;
  }

  const mapNameComparison = compareNullable(mapA?.name, mapB?.name, (left, right) => left.localeCompare(right));
  if (mapNameComparison !== 0) return mapNameComparison;

  return (
    compareNullable(challengeA.sort, challengeB.sort) ||
    compareNullable(challengeB.difficulty?.sort, challengeA.difficulty?.sort) ||
    compareNullable(challengeA.id, challengeB.id)
  );
}

function compareNullable(a, b, compare = (left, right) => left - right) {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : 1;
  if (b === null || b === undefined) return -1;
  return compare(a, b);
}

function SubmissionInspectModalContent({ query, data, t, id }) {
  const queryClient = useQueryClient();
  const { mutate: updateSubmission, isLoading: isUpdating } = usePostSubmission(() => {
    queryClient.invalidateQueries(["submission_queue_inspect", id]);
  });

  if (query.isLoading) return <LoadingSpinner />;
  if (query.isError) return <ErrorDisplay error={query.error} />;

  const notes = data?.notes ?? [];
  const related = (data?.related ?? []).slice().sort(compareRelatedSubmissions);

  return (
    <Stack direction="column" gap={2}>
      <Typography variant="h6">{t("title")}</Typography>

      <Stack direction="column" gap={1}>
        <Typography variant="subtitle1" fontWeight="bold">
          {t("related_submissions")}
        </Typography>
        {related.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            {t("no_related")}
          </Typography>
        ) : (
          related.map((sub) => (
            <Stack key={sub.id} direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <ChallengeInline challenge={sub.challenge} submission={sub} showChallenge />
              {sub.is_fc && sub.challenge.has_fc && (
                <>
                  <FontAwesomeIcon icon={faArrowRight} size="xs" style={{ opacity: 0.5 }} />
                  <SubmissionFcIcon submission={sub} height="1.2em" />
                </>
              )}
              {sub.is_verified === null && <VerificationStatusChip isVerified={null} size="small" />}
              <Tooltip arrow placement="top" title={t(sub.is_obsolete ? "unmark_obsolete" : "mark_obsolete")}>
                <Switch
                  size="small"
                  checked={sub.is_obsolete}
                  onChange={() => updateSubmission({ ...sub, is_obsolete: !sub.is_obsolete })}
                  disabled={isUpdating}
                />
              </Tooltip>
            </Stack>
          ))
        )}
      </Stack>

      <Stack direction="column" gap={1}>
        <Typography variant="subtitle1" fontWeight="bold">
          {t("notes_history")}
        </Typography>
        {notes.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            {t("no_notes")}
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("table.date")}</TableCell>
                <TableCell>{t("table.status")}</TableCell>
                <TableCell>{t("table.note")}</TableCell>
                <TableCell align="right">{t("table.count")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notes.map((note, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{note.date_verified ?? "-"}</TableCell>
                  <TableCell>
                    <VerificationStatusChip isVerified={note.is_verified} size="small" />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "pre-wrap" }}>{note.verifier_notes}</TableCell>
                  <TableCell align="right">{note.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Stack>
    </Stack>
  );
}

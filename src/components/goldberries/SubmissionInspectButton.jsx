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
import { faMagnifyingGlassChart } from "@fortawesome/free-solid-svg-icons";

import { getQueryData, useGetSubmissionQueueInspect, usePostSubmission } from "../../hooks/useApi";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";
import { CustomIconButton, ErrorDisplay, LoadingSpinner } from "../basic";

import { ChallengeInline } from "./ChallengeInline";
import { VerificationStatusChip } from "./VerificationStatusChip";

export function SubmissionInspectButton({ id, sx = {} }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.submission_inspect" });
  const modal = useModal(null, undefined, { actions: [ModalButtons.close] });

  const query = useGetSubmissionQueueInspect(id);
  const data = getQueryData(query);

  const notes = data?.notes ?? [];
  const related = data?.related ?? [];
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

function SubmissionInspectModalContent({ query, data, t, id }) {
  const queryClient = useQueryClient();
  const { mutate: updateSubmission, isLoading: isUpdating } = usePostSubmission(() => {
    queryClient.invalidateQueries(["submission_queue_inspect", id]);
  });

  if (query.isLoading) return <LoadingSpinner />;
  if (query.isError) return <ErrorDisplay error={query.error} />;

  const notes = data?.notes ?? [];
  const related = data?.related ?? [];

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

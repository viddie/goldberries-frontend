import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledLink,
  TooltipLineBreaks,
} from "../components/BasicComponents";
import { getQueryData, useGetRejectedChallenges, useGetRejectedMapList } from "../hooks/useApi";
import { getCampaignName, getChallengeCampaign, getChallengeNameShort, getMapName } from "../util/data_util";
import { Trans, useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { ProofExternalLinkButton } from "../components/GoldberriesComponents";

export function PageRejectedChallenges() {
  const { t } = useTranslation(undefined, { keyPrefix: "rejected_challenges" });

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={t("title")} />
      <Typography variant="h4">{t("title")}</Typography>
      <Typography variant="body2" gutterBottom>
        {t("info_1")}
      </Typography>
      <Typography variant="body2" gutterBottom color="error.main">
        <Trans t={t} i18nKey="info_2" components={{ CustomLink: <StyledLink to="/rules#maps" /> }} />
      </Typography>
      <RejectedChallengesTable />
    </BasicContainerBox>
  );
}

function RejectedMapsTable({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "rejected_maps" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useGetRejectedMapList();
  const maps = getQueryData(query);

  return (
    <>
      {(query.isLoading || query.isFetching) && <LoadingSpinner />}
      {query.isError && <ErrorDisplay error={query.error} />}
      {(!maps || maps.length === 0) && <Typography variant="body2">{t("no_rejected_maps")}</Typography>}
      {maps && maps.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t_g("campaign", { count: 1 })}</TableCell>
                <TableCell>{t_g("map", { count: 1 })}</TableCell>
                <TableCell>{t("reason")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maps.map((map) => (
                <TableRow key={map.id}>
                  <TableCell>
                    <StyledLink to={"/campaign/" + map.campaign.id}>
                      {getCampaignName(map.campaign, t_g)}
                    </StyledLink>
                  </TableCell>
                  <TableCell>
                    <StyledLink to={"/map/" + map.id}>
                      {getMapName(map, map.campaign, true, true, false)}
                    </StyledLink>
                  </TableCell>
                  <TableCell>{map.rejection_reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}

function RejectedChallengesTable() {
  const { t } = useTranslation(undefined, { keyPrefix: "rejected_challenges" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  const query = useGetRejectedChallenges();
  const challenges = getQueryData(query);

  return (
    <>
      {(query.isLoading || query.isFetching) && <LoadingSpinner />}
      {query.isError && <ErrorDisplay error={query.error} />}
      {(!challenges || challenges.length === 0) && (
        <Typography variant="body2">{t("no_rejected_challenges")}</Typography>
      )}
      {challenges && challenges.length > 0 && <RejectedChallengesTableResults challenges={challenges} />}
    </>
  );
}
function RejectedChallengesTableResults({ challenges }) {
  const { t } = useTranslation(undefined, { keyPrefix: "rejected_challenges" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  // Group challenges by campaign
  const groupedChallenges = challenges.reduce((acc, challenge) => {
    const campaignId = getChallengeCampaign(challenge).id;
    if (!acc[campaignId]) {
      acc[campaignId] = [];
    }
    acc[campaignId].push(challenge);
    return acc;
  }, {});
  const keys = Object.keys(groupedChallenges);

  // Sort keys by campaign name
  keys.sort((a, b) => {
    const campaignA = getChallengeCampaign(groupedChallenges[a][0]);
    const campaignB = getChallengeCampaign(groupedChallenges[b][0]);
    return campaignA.name.localeCompare(campaignB.name);
  });

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t_g("campaign", { count: 1 })}</TableCell>
            <TableCell>{t_g("map", { count: 1 })}</TableCell>
            <TableCell>{t_g("challenge", { count: 1 })}</TableCell>
            <TableCell>{t("reason")}</TableCell>
            <TableCell align="center">{t("video")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keys.map((campaignId) => {
            const campaignChallenges = groupedChallenges[campaignId];
            return (
              <>
                {campaignChallenges.map((challenge, index) => {
                  const firstSubmission = challenge.submissions[0];
                  const hasSubmission = firstSubmission !== undefined;
                  const isFirst = index === 0;
                  const isLast = index === campaignChallenges.length - 1;
                  const cellBorder = isLast ? undefined : "1px dashed #444";
                  return (
                    <TableRow key={challenge.id}>
                      <TableCell align={isFirst ? "left" : "center"} sx={{ borderBottom: cellBorder }}>
                        {isFirst ? (
                          <StyledLink to={"/campaign/" + getChallengeCampaign(challenge).id}>
                            {getCampaignName(getChallengeCampaign(challenge), t_g)}
                          </StyledLink>
                        ) : (
                          "|"
                        )}
                      </TableCell>
                      <TableCell sx={{ borderBottom: cellBorder }}>
                        {challenge.map ? (
                          <StyledLink to={"/map/" + challenge.map.id}>
                            {getMapName(challenge.map, getChallengeCampaign(challenge), true, true, false)}
                          </StyledLink>
                        ) : (
                          <Typography>
                            <TooltipLineBreaks title={t("fullgame_notice")}>
                              <FontAwesomeIcon icon={faXmark} />
                            </TooltipLineBreaks>
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ borderBottom: cellBorder }}>
                        <StyledLink to={"/challenge/" + challenge.id}>
                          {getChallengeNameShort(challenge, true, true, false)}
                        </StyledLink>
                      </TableCell>
                      <TableCell sx={{ borderBottom: cellBorder }}>{challenge.reject_note}</TableCell>
                      <TableCell align="center" sx={{ borderBottom: cellBorder }}>
                        {hasSubmission ? <ProofExternalLinkButton url={firstSubmission.proof_url} /> : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

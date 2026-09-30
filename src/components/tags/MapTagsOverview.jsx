import { Box, Divider, Stack, Typography } from "@mui/material";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import { useAppSettings } from "../../hooks/AppSettingsProvider";
import { getQueryData, useGetMapTagCounts } from "../../hooks/useApi";
import { getChallengeNameShort } from "../../util/data_util";
import { ErrorDisplay, LoadingSpinner, StyledLink } from "../basic";
import { DifficultyChip, ObjectiveIcon } from "../goldberries";

import { ChallengeTagChips } from "./ChallengeTagChips";

//#region MapTagsOverview
// Lists all challenges of a map together with their tag chips
export function MapTagsOverview({ map }) {
  const { t } = useTranslation(undefined, { keyPrefix: "tags.map_overview" });
  const { settings } = useAppSettings();
  const query = useGetMapTagCounts(map.id);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const counts = getQueryData(query);

  return (
    <Stack direction="column" gap={1.5}>
      <Typography variant="h6">{t("title", { map: map.name })}</Typography>
      {map.challenges.map((challenge, index) => (
        <Fragment key={challenge.id}>
          {index > 0 && <Divider />}
          <Box>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.75 }}>
              <ObjectiveIcon objective={challenge.objective} challenge={challenge} height="1.2em" />
              <StyledLink
                to={"/challenge/" + challenge.id}
                style={{ textDecoration: challenge.is_rejected ? "line-through" : undefined }}
              >
                {getChallengeNameShort(challenge, true, true, false)}
              </StyledLink>
              <DifficultyChip difficulty={challenge.difficulty} />
            </Stack>
            <ChallengeTagChips
              challengeId={challenge.id}
              counts={counts.filter((entry) => entry.challenge_id === challenge.id)}
              maxVisible={null}
              hideOutvoted={!settings.general.alwaysShowOutvotedTags}
              emptyText={t("no_tags")}
            />
          </Box>
        </Fragment>
      ))}
    </Stack>
  );
}
//#endregion

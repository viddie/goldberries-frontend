import { useTranslation } from "react-i18next";
import { BasicContainerBox, ErrorDisplay, getErrorFromMultiple, LoadingSpinner } from "../components/basic";
import { getQueryData, useSearch } from "../hooks/useApi";
import { SearchResultsCampaigns, SearchResultsMaps } from "./Search";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Divider, Grid, Stack, Typography } from "@mui/material";

export function PageAuthor() {
  const { name, tab } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab || "maps");
  useEffect(() => {
    if (tab && tab !== selectedTab) {
      setSelectedTab(tab);
    } else if (tab === undefined) {
      setSelectedTab("maps");
    }
  }, [tab]);

  return (
    <BasicContainerBox maxWidth="md">
      <AuthorDisplay name={name} tab={selectedTab} setTab={setSelectedTab} />
    </BasicContainerBox>
  );
}

function AuthorDisplay({ name }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  const query = useSearch(name, ["authors"], true);
  const response = getQueryData(query);
  const authors = response ? response.authors : [];

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    const error = getErrorFromMultiple(query);
    return <ErrorDisplay error={error} />;
  } else if (authors.length === 0) {
    return <ErrorDisplay error={{ message: t_g("error_handling.404") }} />;
  }

  // authors can be multiple. find by exact name match. if no exact match is found, return 404 error.
  // const author = authors.find((author) => author.name.toLowerCase() === name.toLowerCase());
  // if (!author) {
  //   return <ErrorDisplay error={{ message: t_g("error_handling.404") }} />;
  // }

  return (
    <Stack direction="column" gap={2}>
      <Box>
        <Typography variant="body2" color="text.secondary">
          This page is getting reworked soon!
        </Typography>
      </Box>
      {authors.map((author) => (
        <AuthorResult key={author.name} author={author} />
      ))}
    </Stack>
  );
}

function AuthorResult({ author }) {
  const { t } = useTranslation(undefined, { keyPrefix: "author" });
  return (
    <Stack direction="column" gap={1}>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} sm>
          <Typography variant="h4">{author.name}</Typography>
        </Grid>
        {/* {authorGbId && (
          <Grid item xs={12} sm={"auto"}>
            <StyledExternalLink href={`https://gamebanana.com/members/${authorGbId}`}>
              {t("view_on_gamebanana")}
            </StyledExternalLink>
          </Grid>
        )} */}
      </Grid>
      <SearchResultsMaps maps={author.maps} isExplicitAuthor explanationText={t("maps_text")} />
      <Divider sx={{ my: 2 }} />
      <SearchResultsCampaigns
        campaigns={author.campaigns}
        isExplicitAuthor
        filterStandalone={false}
        explanationText={t("campaigns_text")}
      />
    </Stack>
  );
}

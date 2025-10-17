import { useTranslation } from "react-i18next";
import {
  BasicContainerBox,
  ErrorDisplay,
  getErrorFromMultiple,
  LoadingSpinner,
  StyledExternalLink,
} from "../components/BasicComponents";
import { getQueryData, useSearch } from "../hooks/useApi";
import { SearchResultsCampaigns, SearchResultsMaps, SearchResultsSingleAuthor } from "./Search";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Divider, Grid, Stack, Typography } from "@mui/material";

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
  const { t } = useTranslation(undefined, { keyPrefix: "author" });

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
  const author = authors.find((author) => author.name.toLowerCase() === name.toLowerCase());
  if (!author) {
    return <ErrorDisplay error={{ message: t_g("error_handling.404") }} />;
  }

  // Find the author's gamebanana ID. its not directly in the author object, but can be found in the campaigns or maps.
  // Specifically:
  // - loop through all campaigns. if the author_gb_name is the same as the author name, take the author_gb_id field.
  // - if still not found, loop through all maps and attempt the same there.
  // If we found the author through the search, it has to be in either the campaigns or the maps.
  let authorGbId = null;
  for (const campaign of author.campaigns) {
    if (campaign.author_gb_name.toLowerCase() === author.name.toLowerCase()) {
      authorGbId = campaign.author_gb_id;
      break;
    }
  }
  if (!authorGbId) {
    for (const map of author.maps) {
      if (map.author_gb_name.toLowerCase() === author.name.toLowerCase()) {
        authorGbId = map.author_gb_id;
        break;
      }
    }
  }

  return (
    <Stack direction="column" gap={1}>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} sm>
          <Typography variant="h4">{author.name}</Typography>
        </Grid>
        {authorGbId && (
          <Grid item xs={12} sm={"auto"}>
            <StyledExternalLink href={`https://gamebanana.com/members/${authorGbId}`}>
              {t("view_on_gamebanana")}
            </StyledExternalLink>
          </Grid>
        )}
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

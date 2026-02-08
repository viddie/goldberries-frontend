import { useEffect, useState } from "react";
import { Divider, Grid, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@uidotdev/usehooks";

import {
  getCampaignName,
  getMapLobbyInfo,
  getMapName,
  getMapNameClean,
  groupMapsByMajor,
} from "../util/data_util";
import { CampaignGallerySingleImage, CampaignImageFull } from "../components/map_image";
import { PlayerChip } from "../components/goldberries";
import { getQueryData, useSearch } from "../hooks/useApi";
import {
  BasicBox,
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledLink,
} from "../components/basic";

export function PageSearch({ isDirectSearch = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "search" });
  const { q } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(q || "");
  const [, setTab] = useLocalStorage("search_selected_tab", "maps");

  useEffect(() => {
    setTab("maps"); // Reset to maps tab once per opening the search
  }, []);

  const updateSearch = (newSearch) => {
    setSearch(newSearch);
    //Also adjust URL
    if (!isDirectSearch) {
      if (newSearch === "" || newSearch === undefined) {
        navigate("/search", { replace: true });
      } else {
        //Url encode the search string
        newSearch = encodeURIComponent(newSearch);
        navigate("/search/" + newSearch, { replace: true });
      }
    }
  };

  useEffect(() => {
    if (q !== undefined && q !== search) {
      setSearch(q);
    }
  }, [q]);

  const title = search ? t("title_content", { content: search }) : t("title_no_content");

  const containerSx = { mt: 0 };
  if (isDirectSearch) {
    containerSx.border = "unset";
    containerSx.borderRadius = "unset";
  }

  return (
    <BasicContainerBox
      maxWidth="md"
      sx={containerSx}
      containerSx={containerSx}
      ignoreNewMargins={isDirectSearch}
    >
      <HeadTitle title={title} />
      {!search && (
        <>
          <Typography variant="h4">{t("header")}</Typography>
          <Typography variant="body1" color="gray" gutterBottom>
            {t("info")}
          </Typography>
        </>
      )}
      <DebouncedTextField
        value={search}
        setValue={updateSearch}
        label={t("search_label")}
        isDirectSearch={isDirectSearch}
        sx={{ mb: 0 }}
      />
      {search && search.length < 3 && search.length > 0 && (
        <Typography variant="body1" color="gray">
          {t("feedback.min_length", { count: 3 })}
        </Typography>
      )}
      {search && search.toLocaleLowerCase() === "cc" && (
        <Typography variant="body1" color="gray" sx={{ my: 1.5 }}>
          Did you mean crumbling castle, cave-in cavern, chaos complex, cornerboost collab, ceiling pop
          contest, candy cliffs, cheesecake country, circular platform clutter, collapsing canyon, curious
          crater, cpop city, corroded city, coresaken city, citrus coast, celestial cabinet, construction
          conundrum, cycles contest, cupid's comit, cloud chamber, cherry city, comb connections city,
          cloudfrost cave, cyclic cliffside, carlos collab, cc-sides, cloudy cliffs, catfish collab, chilly
          caves, crossover collab, comb room collab, chromatic complex, cerulean couloir, cancel culture,
          chilled cliff, crystalline cove, cat canopy, caper cavortion, cantaloupe county, celeste castle,
          chrozone c-side, cozy cavern, cannon canyon, cartesian co, crystal cave, crystal caverns, crystal
          core, core c-side, capybara civilization, cassette cliffs, catacylysmic cavern, celestial cavern,
          chocolate cavern, city challenge, clementine clouds, cliffside climb, cobalt coastland, collapsing
          cathedral, color catalyst, connected candy, constructed caverns, cosmic concrete, crumbling caverns,
          crumbling cliffside or crystal comet?
          <br />
          Next time, be more clear with your abbreviations
        </Typography>
      )}
      {search && search.length >= 1 && <SearchDisplay search={search} />}
    </BasicContainerBox>
  );
}

export function SearchDisplay({ search }) {
  const query = useSearch(search);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const data = getQueryData(query);

  return (
    <Stack direction="column" gap={2}>
      {data.players && <SearchResultsPlayers players={data.players} />}
      <SearchResultTabs search={search} maps={data.maps} campaigns={data.campaigns} authors={data.authors} />
    </Stack>
  );
}

export function SearchResultsCampaigns({
  campaigns,
  isInAuthors = false,
  isExplicitAuthor = false,
  filterStandalone = true,
  explanationText = null,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "search" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const showCampaign = (campaign) =>
    campaign.maps.length !== 0 && (campaign.maps.length > 1 || campaign.maps[0].name !== campaign.name);
  const filteredCampaigns = filterStandalone ? campaigns.filter(showCampaign) : campaigns;

  const showTitle = isInAuthors || isExplicitAuthor;
  const titleVariant = isExplicitAuthor ? "h5" : "body1";

  return (
    (filteredCampaigns.length > 0 || isExplicitAuthor) && (
      <Stack direction="column" gap={0}>
        {showTitle && (
          <Typography variant={titleVariant}>
            {t_g("campaign", { count: 30 })} - {filteredCampaigns.length}
          </Typography>
        )}
        {explanationText && (
          <Typography variant="body2" color="gray">
            {explanationText}
          </Typography>
        )}
        {filteredCampaigns.length === 0 && (
          <Typography variant="body1" color="gray" sx={{ mt: 1 }}>
            {t("no_campaigns")}
          </Typography>
        )}
        {filteredCampaigns.map((campaign) => (
          <Stack direction="column" sx={{ mt: 1 }}>
            <Stack direction="row" gap={2} alignItems="center">
              <Link to={"/campaign/" + campaign.id} style={{ color: "var(--toastify-color-info)" }}>
                <Typography variant="h6">{getCampaignName(campaign, t_g)}</Typography>
              </Link>
            </Stack>
            <Grid container rowSpacing={0} columnSpacing={1.5} sx={{ my: 1 }}>
              <Grid item xs={12} sm={4} sx={{ mb: 2 }}>
                <CampaignImageFull id={campaign.id} alt={campaign.name} doLink scale={1} style={{}} />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Stack direction="column" rowGap={2}>
                  {groupMapsByMajor(campaign).map((group) => {
                    return (
                      <Stack
                        direction="row"
                        rowGap={0.5}
                        columnGap={2}
                        flexWrap="wrap"
                        sx={{
                          borderLeft: "5px solid " + (group.color || "#ffffff"),
                          paddingLeft: "8px",
                        }}
                      >
                        {group.maps.map((map) => {
                          const lobbyInfo = getMapLobbyInfo(map, campaign);
                          const textColor = lobbyInfo.minor
                            ? lobbyInfo.minor.color
                            : "var(--toastify-color-info)";
                          const textShadow = lobbyInfo.minor
                            ? "0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, " +
                              "0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black"
                            : "none";
                          return (
                            <Typography key={map.id} variant="body2" sx={{ pl: 0.75 }}>
                              <Link
                                to={"/map/" + map.id}
                                style={{
                                  textDecoration: "none",
                                  color: textColor,
                                  textShadow: textShadow,
                                }}
                              >
                                {getMapName(map, campaign, false)}
                              </Link>
                            </Typography>
                          );
                        })}
                      </Stack>
                    );
                  })}
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        ))}
      </Stack>
    )
  );
}

export function SearchResultsMaps({
  maps,
  isInAuthors = false,
  isExplicitAuthor = false,
  explanationText = null,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "search" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  const numMaps = 9;
  const firstFewMaps = maps.slice(0, numMaps);
  const remainingMaps = maps.slice(numMaps);

  const showTitle = isInAuthors || isExplicitAuthor;
  const titleVariant = isExplicitAuthor ? "h5" : "body1";

  return (
    (maps.length > 0 || isExplicitAuthor) && (
      <Stack direction="column" gap={0}>
        {showTitle && (
          <Typography variant={titleVariant}>
            {t_g("map", { count: 30 })} - {maps.length}
          </Typography>
        )}
        {explanationText && (
          <Typography variant="body2" color="gray">
            {explanationText}
          </Typography>
        )}
        {maps.length === 0 && (
          <Typography variant="body1" color="gray" sx={{ mt: 1 }}>
            {t("no_maps")}
          </Typography>
        )}
        {maps.length > 0 && (
          <Grid container rowSpacing={2.5} columnSpacing={1.5} sx={{ mt: 0 }}>
            {firstFewMaps.map((map) => {
              return <CampaignGallerySingleImage campaign={map.campaign} map={map} xs={6} lg={4} isSearch />;
            })}
          </Grid>
        )}
        {remainingMaps.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1" color="gray">
              {t("and_more_maps", { count: remainingMaps.length })}
            </Typography>
          </>
        )}
        {remainingMaps.map((map) => {
          const isSameName = map.campaign.name === map.name;
          return (
            <Stack direction="column" gap={1}>
              <Link to={"/map/" + map.id} style={{ color: "var(--toastify-color-info)" }}>
                <Typography variant="h6">{getMapNameClean(map, map.campaign, t_g, !isSameName)}</Typography>
              </Link>
              {!isSameName && (
                <Typography variant="body2" sx={{ pl: 2 }}>
                  <Link to={"/campaign/" + map.campaign.id} style={{ color: "var(--toastify-color-info)" }}>
                    <FontAwesomeIcon icon={faBook} style={{ marginRight: "5px" }} />
                    {getCampaignName(map.campaign, t_g)}
                  </Link>
                </Typography>
              )}
            </Stack>
          );
        })}
      </Stack>
    )
  );
}

function SearchResultsPlayers({ players }) {
  const { t } = useTranslation(undefined, { keyPrefix: "search" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  return (
    players.length > 0 && (
      <Stack direction="column" gap={1} sx={{ mt: 1 }}>
        <Typography variant="h5">
          {t_g("player", { count: 30 })} - {players.length}
        </Typography>
        {players.length === 0 ? (
          <Typography variant="body1" color="gray">
            {t("no_players")}
          </Typography>
        ) : (
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
            {players.map((player) => (
              <PlayerChip key={player.id} player={player} />
            ))}
          </Stack>
        )}
      </Stack>
    )
  );
}

function SearchResultsAuthors({ authors }) {
  const { t } = useTranslation(undefined, { keyPrefix: "search" });
  return (
    authors.length > 0 && (
      <Stack direction="column" gap={1}>
        <Typography variant="h5">
          {t("authors")} - {authors.length}
        </Typography>
        {authors.length === 0 && (
          <Typography variant="body1" color="gray">
            {t("no_authors")}
          </Typography>
        )}
        {authors.map((author) => (
          <SearchResultsSingleAuthor key={author.id} author={author} />
        ))}
      </Stack>
    )
  );
}

function SearchResultsSingleAuthor({ author }) {
  return (
    <BasicBox key={author.id} sx={{ width: "100%", px: 2 }}>
      <Stack direction="column" gap={1}>
        <Typography variant="h6">
          <StyledLink to={"/author/" + encodeURIComponent(author.name)}>{author.name}</StyledLink>
        </Typography>
        {author.maps.length > 0 && <SearchResultsMaps maps={author.maps} isInAuthors />}
        {author.campaigns.length > 0 && (
          <SearchResultsCampaigns campaigns={author.campaigns} isInAuthors filterStandalone={false} />
        )}
      </Stack>
    </BasicBox>
  );
}

function SearchResultTabs({ search, maps, campaigns, authors }) {
  const { t } = useTranslation(undefined, { keyPrefix: "search" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  const [tab, setTab] = useState(getPreSelectedTab(maps, campaigns, authors, search));

  useEffect(() => {
    setTab(getPreSelectedTab(maps, campaigns, authors, search));
  }, [search]);

  const filteredCampaigns = campaigns
    ? campaigns.filter(
        (campaign) =>
          campaign.maps.length !== 0 && (campaign.maps.length > 1 || campaign.maps[0].name !== campaign.name),
      )
    : [];

  return (
    <>
      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        variant="fullWidth"
        sx={{
          mt: 0,
          mb: 1,
          borderBottom: 1,
          borderColor: "divider",
          position: "sticky",
          top: 0,
          backgroundColor: "background.paperContainer",
          zIndex: 1,
        }}
      >
        <Tab label={`${t_g("map", { count: 5 })} (${maps.length})`} value="maps" />
        <Tab label={`${t_g("campaign", { count: 5 })} (${filteredCampaigns.length})`} value="campaigns" />
        <Tab label={`${t("authors")} (${authors.length})`} value="authors" />
      </Tabs>
      {tab === "maps" && <SearchResultsMaps maps={maps} />}
      {tab === "campaigns" && <SearchResultsCampaigns campaigns={campaigns} />}
      {tab === "authors" && <SearchResultsAuthors authors={authors} />}
    </>
  );
}

function DebouncedTextField({ value, setValue, label, clearOnFocus = false, isDirectSearch, sx = {} }) {
  const [valueInternal, setValueInternal] = useState(value);
  const setValueDebounced = useDebouncedCallback(setValue, 250);
  const navigate = useNavigate();

  useEffect(() => {
    setValueInternal(value);
  }, [value]);

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      if (isDirectSearch) {
        navigate("/search/" + encodeURIComponent(valueInternal));
      } else {
        setValue(valueInternal);
      }
    }
  };

  return (
    <TextField
      label={label}
      value={valueInternal}
      onChange={(event) => {
        setValueInternal(event.target.value);
        setValueDebounced(event.target.value);
      }}
      onKeyDown={onKeyDown}
      sx={{ mb: 2, mt: { xs: 2, sm: 0 }, ...sx }}
      fullWidth
      onFocus={(e) => {
        if (clearOnFocus) {
          setValueInternal("");
          setValueDebounced("");
        }
      }}
      autoFocus
    />
  );
}

/**
 * Get the pre-selected tab based on the search input and available results.
 * @param {*} maps list of maps
 * @param {*} campaigns list of campaigns
 * @param {*} authors list of authors
 * @param {string} search search input
 * @returns pre-selected tab
 */
function getPreSelectedTab(maps, campaigns, authors, search) {
  const normalize = (str) => str?.toLowerCase()?.replace(/[^a-z0-9]/g, "") ?? "";

  const searchNormalized = normalize(search);

  const campaignKeywords = ["collab", "contest", "campaign"];
  if (campaignKeywords.some((keyword) => searchNormalized.includes(keyword))) {
    if (campaigns.length > 0) return "campaigns";
  }

  const hasExactMatch = (items, getName) =>
    items.some((item) => normalize(getName(item)) === searchNormalized);
  const hasPrefixMatch = (items, getName) =>
    items.some((item) => normalize(getName(item)).startsWith(searchNormalized));

  const mapExact = maps.length > 0 && hasExactMatch(maps, (m) => m.name);
  const campaignExact = campaigns.length > 0 && hasExactMatch(campaigns, (c) => c.name);
  const authorExact = authors.length > 0 && hasExactMatch(authors, (a) => a.name);
  if (mapExact) return "maps";
  if (campaignExact) return "campaigns";
  if (authorExact) return "authors";

  const mapPrefix = maps.length > 0 && hasPrefixMatch(maps, (m) => m.name);
  const campaignPrefix = campaigns.length > 0 && hasPrefixMatch(campaigns, (c) => c.name);
  const authorPrefix = authors.length > 0 && hasPrefixMatch(authors, (a) => a.name);
  if (mapPrefix) return "maps";
  if (campaignPrefix) return "campaigns";
  if (authorPrefix) return "authors";

  // Fallback: select first non-empty tab
  if (maps.length > 0) return "maps";
  if (campaigns.length > 0) return "campaigns";
  if (authors.length > 0) return "authors";
  return "maps";
}

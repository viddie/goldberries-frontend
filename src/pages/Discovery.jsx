import {
  faArrowLeft,
  faArrowTrendUp,
  faCompass,
  faDice,
  faFire,
  faHeart,
  faRotateRight,
  faSeedling,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  Grid,
  LinearProgress,
  Pagination,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { BasicContainerBox, ErrorDisplay, HeadTitle, LoadingSpinner } from "../components/basic";
import {
  DiscoveryCard,
  DiscoveryFilter,
  getIncludedTagValueIds,
  sanitizeFilter,
} from "../components/discovery";
import { useTagLookup } from "../components/tags";
import { getQueryData, useGetDiscovery } from "../hooks/useApi";

const GROUPS = ["popular", "liked", "trending", "new", "random"];
const GROUP_ICONS = {
  popular: faFire,
  liked: faHeart,
  new: faSeedling,
  trending: faArrowTrendUp,
  random: faDice,
};
// Only these groups show a description below their header
const DESCRIBED_GROUPS = ["trending"];
// Cards per row on large screens, smaller screens always use fewer columns
const COLUMN_OPTIONS = [3, 4];
const DEFAULT_COLUMNS = 3;
const OVERVIEW_ROWS = 2;
const SEED_MAX = 2147483647;
const PER_PAGE_GROUP = 24;

export function PageDiscovery() {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery" });
  const [storedColumns, setColumns] = useLocalStorage("discovery_columns", DEFAULT_COLUMNS);
  const [searchParams, setSearchParams] = useSearchParams();
  const { query: tagQuery, lookup } = useTagLookup();
  const columns = COLUMN_OPTIONS.includes(storedColumns) ? storedColumns : DEFAULT_COLUMNS;

  const filterParam = searchParams.get("filter");
  const groupParam = searchParams.get("group");
  const group = GROUPS.includes(groupParam) ? groupParam : null;
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  // The random group always has a seed in the URL, so its order can be shared and paged through
  const seed = group === "random" ? parseSeedParam(searchParams.get("seed")) : null;

  const filter = useMemo(() => {
    if (!lookup) return null;
    return sanitizeFilter(parseFilterParam(filterParam), lookup);
  }, [filterParam, lookup]);
  const highlightedValueIds = useMemo(
    () => (lookup && filter ? getIncludedTagValueIds(filter, lookup) : null),
    [filter, lookup],
  );

  const updateParams = (changes, replace = true) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === undefined) next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace });
  };
  const setFilter = (newFilter) => {
    const isEmpty = Object.keys(newFilter).length === 0;
    updateParams({ filter: isEmpty ? null : JSON.stringify(newFilter), page: null });
  };
  const setGroup = (newGroup, newSeed = null) => {
    updateParams({ group: newGroup, page: null, seed: newGroup === "random" ? newSeed : null }, false);
    window.scrollTo(0, 0);
  };
  const rerollSeed = () => {
    updateParams({ seed: generateSeed(), page: null }, false);
  };

  useEffect(() => {
    if (group === "random" && seed === null) {
      updateParams({ seed: generateSeed() });
    }
  }, [group, seed]);
  const setPage = (newPage) => {
    updateParams({ page: newPage === 1 ? null : newPage }, false);
  };

  return (
    <BasicContainerBox
      maxWidth="lg"
      sx={{ backgroundColor: "#282828", p: 0, pt: 0, pb: 0, overflow: "hidden" }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <HeadTitle title={t("title")} />
        <Box sx={{ position: "relative", mb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1.5}>
            <FontAwesomeIcon icon={faCompass} size="2x" />
            <Typography variant="h4">{t("title")}</Typography>
          </Stack>
          <ColumnsToggle
            columns={columns}
            setColumns={setColumns}
            sx={{
              display: { xs: "none", lg: "inline-flex" },
              position: "absolute",
              top: "50%",
              right: 0,
              transform: "translateY(-50%)",
            }}
          />
        </Box>

        {tagQuery.isLoading ? (
          <LoadingSpinner />
        ) : tagQuery.isError ? (
          <ErrorDisplay error={tagQuery.error} />
        ) : (
          <>
            <DiscoveryFilter filter={filter} onApply={setFilter} lookup={lookup} />
            <Box sx={{ mt: 3 }}>
              {group === null ? (
                <DiscoveryOverview
                  filter={filter}
                  onShowGroup={setGroup}
                  columns={columns}
                  highlightedValueIds={highlightedValueIds}
                />
              ) : group === "random" && seed === null ? (
                <LoadingSpinner />
              ) : (
                <DiscoveryGroup
                  filter={filter}
                  group={group}
                  seed={seed}
                  onReroll={rerollSeed}
                  page={page}
                  setPage={setPage}
                  onBack={() => setGroup(null)}
                  columns={columns}
                  highlightedValueIds={highlightedValueIds}
                />
              )}
            </Box>
          </>
        )}
      </Box>
    </BasicContainerBox>
  );
}

//#region ColumnsToggle
function ColumnsToggle({ columns, setColumns, sx }) {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery" });
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={columns}
      onChange={(e, value) => value && setColumns(value)}
      sx={sx}
    >
      {COLUMN_OPTIONS.map((option) => (
        <ToggleButton key={option} value={option} aria-label={t("columns", { count: option })} sx={{ p: 0 }}>
          <Tooltip title={t("columns", { count: option })} arrow placement="top">
            <Stack direction="row" gap="2px" sx={{ px: 1.5, py: 1 }}>
              {Array.from({ length: option }, (_, i) => (
                <Box
                  key={i}
                  sx={{ width: 4, height: 14, borderRadius: "1px", backgroundColor: "currentColor" }}
                />
              ))}
            </Stack>
          </Tooltip>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
//#endregion

//#region DiscoveryOverview
function DiscoveryOverview({ filter, onShowGroup, columns, highlightedValueIds }) {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery" });
  const query = useGetDiscovery(filter, "all", 1, columns * OVERVIEW_ROWS);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const data = getQueryData(query);
  const hasAny = GROUPS.some((name) => data.groups[name]?.total_count > 0);

  return (
    <Stack direction="column" gap={3}>
      {query.isFetching && <LinearProgress />}
      {!hasAny && <Typography variant="body1">{t("no_results")}</Typography>}
      {hasAny &&
        GROUPS.map((name) => {
          const groupData = data.groups[name] ?? { challenges: [], total_count: 0 };
          return (
            <Box key={name}>
              <GroupHeader
                group={name}
                totalCount={groupData.total_count}
                action={
                  groupData.total_count > groupData.challenges.length && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onShowGroup(name, name === "random" ? data.seed : null)}
                    >
                      {t("buttons.show_more")}
                    </Button>
                  )
                }
              />
              <ChallengeCardGrid
                challenges={groupData.challenges}
                columns={columns}
                highlightedValueIds={highlightedValueIds}
              />
            </Box>
          );
        })}
    </Stack>
  );
}
//#endregion

//#region DiscoveryGroup
function DiscoveryGroup({
  filter,
  group,
  seed,
  onReroll,
  page,
  setPage,
  onBack,
  columns,
  highlightedValueIds,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery" });
  const query = useGetDiscovery(filter, group, page, PER_PAGE_GROUP, seed);
  const data = getQueryData(query);
  const isRandom = group === "random";

  return (
    <Stack direction="column" gap={2}>
      <Button
        variant="text"
        startIcon={<FontAwesomeIcon icon={faArrowLeft} size="sm" />}
        onClick={onBack}
        sx={{ alignSelf: "flex-start" }}
      >
        {t("buttons.back")}
      </Button>
      <GroupHeader
        group={group}
        totalCount={data?.max_count ?? null}
        action={
          isRandom && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<FontAwesomeIcon icon={faRotateRight} size="sm" />}
              onClick={onReroll}
              disabled={query.isFetching}
            >
              {t("buttons.reroll")}
            </Button>
          )
        }
      />
      {query.isFetching && !query.isLoading && <LinearProgress />}
      {query.isLoading ? (
        <LoadingSpinner />
      ) : query.isError ? (
        <ErrorDisplay error={query.error} />
      ) : (
        <>
          <ChallengeCardGrid
            challenges={data.challenges}
            columns={columns}
            highlightedValueIds={highlightedValueIds}
          />
          {data.max_page > 1 && (
            <Stack direction="row" justifyContent="center">
              <Pagination
                count={data.max_page}
                page={page}
                onChange={(e, value) => {
                  setPage(value);
                  window.scrollTo(0, 0);
                }}
              />
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}
//#endregion

//#region GroupHeader
function GroupHeader({ group, totalCount, action }) {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery.groups" });
  return (
    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }} flexWrap="wrap">
      <FontAwesomeIcon icon={GROUP_ICONS[group]} />
      <Typography variant="h5">{t(group + ".title")}</Typography>
      {totalCount !== null && group !== "random" && (
        <Typography variant="body1" color="text.secondary">
          ({totalCount})
        </Typography>
      )}
      <Box
        sx={{
          flexGrow: 1,
          height: "2px",
          mx: 0.5,
          borderRadius: "1px",
          backgroundColor: "rgba(255,255,255,0.12)",
        }}
      />
      {action}
      {DESCRIBED_GROUPS.includes(group) && (
        <Typography variant="body2" color="text.secondary" sx={{ width: "100%" }}>
          {t(group + ".description")}
        </Typography>
      )}
    </Stack>
  );
}
//#endregion

//#region ChallengeCardGrid
function ChallengeCardGrid({ challenges, columns, highlightedValueIds }) {
  const { t } = useTranslation(undefined, { keyPrefix: "discovery" });
  if (challenges.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("no_results_group")}
      </Typography>
    );
  }
  return (
    <Grid container spacing={2}>
      {challenges.map((challenge) => (
        <Grid item key={challenge.id} xs={12} sm={6} md={4} lg={12 / columns}>
          <DiscoveryCard challenge={challenge} highlightedValueIds={highlightedValueIds} />
        </Grid>
      ))}
    </Grid>
  );
}
//#endregion

//#region Utility Functions
function parseSeedParam(param) {
  if (!param || !/^\d+$/.test(param)) return null;
  const seed = parseInt(param);
  return seed >= 1 && seed <= SEED_MAX ? seed : null;
}

function generateSeed() {
  return Math.floor(Math.random() * SEED_MAX) + 1;
}

function parseFilterParam(param) {
  if (!param) return {};
  try {
    const parsed = JSON.parse(param);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    return {};
  }
}
//#endregion

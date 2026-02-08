import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  faArrowRightToBracket,
  faBasketShopping,
  faEdit,
  faExclamationTriangle,
  faInfoCircle,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useTheme } from "@emotion/react";

import {
  getCampaignName,
  getChallengeFcShort,
  getChallengeNameShort,
  getMapLobbyInfo,
  getMapName,
} from "../util/data_util";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledLink,
  TooltipLineBreaks,
} from "../components/basic";
import {
  ChallengeFcIcon,
  DifficultyChip,
  ObjectiveIcon,
  OtherIcon,
  VerificationStatusChip,
} from "../components/goldberries";
import { CustomModal, useModal } from "../hooks/useModal";
import {
  FormMapWrapper,
  COLLECTIBLES,
  getCollectibleIcon,
  getCollectibleName,
} from "../components/forms/Map";
import { useAuth } from "../hooks/AuthProvider";
import { getQueryData, useGetMap, usePostMap } from "../hooks/useApi";
import { Changelog } from "../components/Changelog";
import { SuggestedDifficultyChart, SuggestedDifficultyTierCounts } from "../components/stats_page/Stats";
import { useAppSettings } from "../hooks/AppSettingsProvider";

import { MapNoProgressTooltip } from "./Campaign";
import {
  AuthorDetailsRow,
  CalculatedFractionalTierChip,
  CampaignDetailsRow,
  ChallengeSubmissionTable,
  DetailsRow,
  FadingMapBanner,
  LobbyDetailsRow,
  MapDetailsRow,
  NoteDisclaimer,
  TwoColumnDetailsGrid,
  UrlDetailsRow,
} from "./Challenge";

export function PageMap() {
  const { id, challengeId } = useParams();

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
      <MapDisplay id={parseInt(id)} challengeId={parseInt(challengeId)} />
    </BasicContainerBox>
  );
}

export function MapDisplay({ id, challengeId, isModal = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map" });
  const { t: t_c } = useTranslation(undefined, { keyPrefix: "challenge" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const auth = useAuth();
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const query = useGetMap(id);
  const [selectedChallengeId, setSelectedChallengeId] = useState(challengeId ?? null);

  const updateSelectedChallenge = (challengeId) => {
    setSelectedChallengeId(challengeId);
    if (!isModal) {
      navigate("/map/" + id + "/" + challengeId, { replace: true });
    }
  };

  const editMapModal = useModal();

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

  const map = getQueryData(query);
  const firstChallenge = map.challenges[0];
  const selectedChallenge = map.challenges.find((c) => c.id === selectedChallengeId) ?? firstChallenge;
  const campaign = map.campaign;
  const title = getMapName(map, campaign) + " - " + getCampaignName(map.campaign, t_g);

  const contentPadding = { px: isModal ? { xs: 1, sm: 1.5 } : { xs: 2, sm: 3 } };

  return (
    <Box sx={{ pb: { xs: 2, sm: 3 } }}>
      <HeadTitle title={title} />

      {/* Banner image - full width, fading into background */}
      <FadingMapBanner id={map.id} alt={getMapName(map, campaign, false)} />

      {/* Breadcrumbs */}
      {/* <Box sx={{ ...contentPadding, mb: 1.5 }}>
        <GoldberriesBreadcrumbs campaign={map.campaign} map={map} />
      </Box> */}

      {/* Map details grid */}
      <Box sx={{ ...contentPadding }}>
        <MapDetailsGrid map={map} />
      </Box>

      {map.note && (
        <Box sx={{ ...contentPadding, mt: 1.5 }}>
          <NoteDisclaimer note={map.note} title={"Map Note"} />
        </Box>
      )}

      {/* Edit button */}
      {auth.hasHelperPriv && (
        <Box sx={{ ...contentPadding, mt: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Button
              onClick={editMapModal.open}
              variant="outlined"
              size="small"
              startIcon={<FontAwesomeIcon icon={faEdit} />}
            >
              {t("buttons.edit")}
            </Button>
          </Stack>
        </Box>
      )}

      <Box sx={{ ...contentPadding }}>
        <Divider sx={{ my: 2 }}>
          <Chip label="Challenges" size="small" />
        </Divider>
      </Box>

      {selectedChallenge === null || selectedChallenge === undefined ? (
        <Box sx={{ ...contentPadding }}>
          <Typography variant="body1">{t("no_challenges")}</Typography>
        </Box>
      ) : (
        <Box sx={{ ...contentPadding }}>
          <Box sx={{ p: 1, background: "rgba(0,0,0,0.2)", borderRadius: 1 }}>
            <MapChallengeTabs
              selected={selectedChallenge.id}
              setSelected={updateSelectedChallenge}
              map={map}
            />
          </Box>
          {selectedChallenge.description && !selectedChallenge.is_rejected && (
            <NoteDisclaimer
              note={selectedChallenge.description}
              title={t_c("description")}
              sx={{ mt: 1, mb: 1 }}
            />
          )}
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" sx={{ my: 1 }}>
            <ObjectiveIcon
              objective={selectedChallenge.objective}
              challenge={selectedChallenge}
              height="1.3em"
            />
            <ChallengeFcIcon challenge={selectedChallenge} showClear height="1.3em" />
            <span>{getChallengeFcShort(selectedChallenge)}</span>
            <DifficultyChip difficulty={selectedChallenge.difficulty} />
            <CalculatedFractionalTierChip challenge={selectedChallenge} />
            {selectedChallenge.reject_note && (
              <>
                {selectedChallenge.is_rejected && <VerificationStatusChip isVerified={false} size="small" />}
                <TooltipLineBreaks title={selectedChallenge.reject_note}>
                  <FontAwesomeIcon
                    color={selectedChallenge.is_rejected ? theme.palette.error.main : undefined}
                    icon={faExclamationTriangle}
                  />
                </TooltipLineBreaks>
              </>
            )}
            {!selectedChallenge.is_rejected && (
              <StyledLink
                to={"/submit/single-challenge/" + selectedChallenge.id}
                style={{ marginLeft: "auto", display: isMdScreen ? "block" : "none" }}
              >
                <Button variant="outlined" startIcon={<FontAwesomeIcon icon={faPlus} />}>
                  {t("buttons.submit")}
                </Button>
              </StyledLink>
            )}
            <StyledLink
              to={"/challenge/" + selectedChallenge.id}
              style={{ marginLeft: isMdScreen && !selectedChallenge.is_rejected ? "0" : "auto" }}
            >
              <Button variant="text" startIcon={<FontAwesomeIcon icon={faArrowRightToBracket} />}>
                {t("buttons.view_challenge")}
              </Button>
            </StyledLink>
          </Stack>
          <ChallengeSubmissionTable key={selectedChallenge.id} challenge={selectedChallenge} />
          <Divider sx={{ my: 2 }}>
            <Chip label={t_c("difficulty_suggestions")} size="small" />
          </Divider>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <SuggestedDifficultyChart challenge={selectedChallenge} />
          </div>
          <SuggestedDifficultyTierCounts challenge={selectedChallenge} sx={{ mt: 2 }} hideIfEmpty />
          <Changelog type="challenge" id={selectedChallenge.id} sx={{ mt: 2 }} />
        </Box>
      )}

      <Box sx={{ ...contentPadding }}>
        <Divider sx={{ my: 2 }} />
        <Changelog type="map" id={id} />
      </Box>

      <CustomModal modalHook={editMapModal} options={{ hideFooter: true }}>
        <FormMapWrapper id={id} onSave={editMapModal.close} />
      </CustomModal>
    </Box>
  );
}

//#region Map Details Grid
function MapDetailsGrid({ map }) {
  const campaign = map.campaign;

  const lobbyInfo = getMapLobbyInfo(map);
  const hasLobbyInfo = lobbyInfo !== null && (lobbyInfo.major !== undefined || lobbyInfo.minor !== undefined);
  const mapHasAuthor = map.author_gb_name !== null;
  const showMapRow = getMapName(map, campaign) !== campaign.name;

  const leftItems = [];
  const rightItems = [];

  leftItems.push(
    <CampaignDetailsRow key="campaign">
      <StyledLink to={"/campaign/" + campaign.id}>{campaign.name}</StyledLink>
    </CampaignDetailsRow>,
  );

  if (showMapRow) {
    leftItems.push(
      <MapDetailsRow key="map">
        <Stack direction="row" alignItems="center" gap={0.75}>
          <span>{getMapName(map, campaign)}</span>
          {!map.is_progress && <MapNoProgressTooltip />}
        </Stack>
      </MapDetailsRow>,
    );
  }

  leftItems.push(<CollectiblesDetailsRow key="collectibles" map={map} collectibles={map.collectibles} />);

  if (hasLobbyInfo) {
    rightItems.push(<LobbyDetailsRow key="lobby" lobbyInfo={lobbyInfo} />);
  }

  rightItems.push(<UrlDetailsRow key="url" campaign={campaign} map={map} />);

  if (mapHasAuthor) {
    rightItems.push(
      <AuthorDetailsRow key="author" author_gb_id={map.author_gb_id} author_gb_name={map.author_gb_name} />,
    );
  }

  rightItems.push(<GoldenChangesDetailsRow key="goldenchanges" map={map} />);

  return <TwoColumnDetailsGrid leftItems={leftItems} rightItems={rightItems} />;
}

function CollectiblesDetailsRow({ map, collectibles }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map.info_boxes" });
  const auth = useAuth();
  const { mutate: postMap } = usePostMap();

  const objectiveToCollectible = { 1: 0, 2: 1, 9: 5 };
  const objectiveId = map?.challenges.length > 0 ? map?.challenges[0].objective_id : null;
  const collectible = objectiveToCollectible[objectiveId];
  const addDefaultCollectible = () => {
    postMap({
      ...map,
      collectibles: [[collectible + "", "", "", "", ""]],
    });
  };

  const content = [];
  if (collectibles === null) {
    content.push(
      <Typography key="unknown" variant="body2" color="text.secondary">
        {t("no_collectibles")}
      </Typography>,
    );
    if (map && auth.hasHelperPriv) {
      content.push(
        <Button
          key="add"
          variant="outlined"
          color="warning"
          size="small"
          onClick={addDefaultCollectible}
          disabled={collectible === undefined}
          sx={{ mt: 0.5 }}
        >
          Add default collectible
        </Button>,
      );
    }
  }
  if (collectibles) {
    collectibles.forEach((item, index) => {
      const coll = COLLECTIBLES.find((c) => c.value === item[0]);
      if (!coll) return;
      let collectibleNote = item[2] ? item[2] : null;
      if (item[4]) {
        const append = t("meaningful_collectibles", { count: item[4] });
        collectibleNote = collectibleNote ? collectibleNote + "\n" + append : append;
      }
      content.push(
        <Stack key={index} direction="row" gap={1} alignItems="center">
          <OtherIcon url={getCollectibleIcon(item[0], item[1])} />
          <Typography variant="body2">
            {getCollectibleName(item[0], item[1]) + " x" + (item[3] ? item[3] : "1")}
          </Typography>
          {collectibleNote && (
            <TooltipLineBreaks title={collectibleNote}>
              <FontAwesomeIcon icon={faInfoCircle} size="sm" />
            </TooltipLineBreaks>
          )}
        </Stack>,
      );
    });
  }

  return (
    <DetailsRow label={t("collectibles")} icon={<FontAwesomeIcon icon={faBasketShopping} fixedWidth />}>
      <Stack direction="column" gap={0.25}>
        {content}
      </Stack>
    </DetailsRow>
  );
}

function GoldenChangesDetailsRow({ map }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map.info_boxes.golden_changes" });
  const { settings } = useAppSettings();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const { mutate: postMap } = usePostMap();

  const setNoChanges = () => {
    postMap({
      ...map,
      golden_changes: null,
    });
  };

  const showChanges = open || settings.general.alwaysShowGoldenChanges;

  return (
    <DetailsRow label={t("label")}>
      {showChanges ? (
        <Typography variant="body2" sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {map.golden_changes ?? t("no_changes")}
        </Typography>
      ) : (
        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Button
            variant="outlined"
            size="small"
            onClick={() => setOpen(true)}
            sx={{ py: 0, px: 1, minWidth: 0, fontSize: "0.8rem" }}
          >
            {t("show")}
          </Button>
          {auth.hasHelperPriv && map.golden_changes === "Unknown" && (
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={setNoChanges}
              sx={{ py: 0, px: 1, minWidth: 0, fontSize: "0.8rem" }}
            >
              Set to "No changes"
            </Button>
          )}
        </Stack>
      )}
    </DetailsRow>
  );
}
//#endregion

//controlled property: selected challenge ID
function MapChallengeTabs({ selected, setSelected, map }) {
  //If too many challenges, instead render as select dropdown
  if (map.challenges.length > 5) {
    return (
      <Select
        value={selected}
        fullWidth
        onChange={(e) => setSelected(e.target.value)}
        MenuProps={{ disableScrollLock: true }}
      >
        {map.challenges.map((challenge) => (
          <MenuItem key={challenge.id} value={challenge.id}>
            {getChallengeNameShort(challenge, true)}
          </MenuItem>
        ))}
      </Select>
    );
  }
  return (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {map.challenges.map((challenge) => (
        <Button
          key={challenge.id}
          onClick={() => setSelected(challenge.id)}
          variant={selected === challenge.id ? "contained" : "outlined"}
          sx={{ whiteSpace: "nowrap", textDecoration: challenge.is_rejected ? "line-through" : undefined }}
        >
          {getChallengeNameShort(challenge, true, true, false)}
        </Button>
      ))}
    </Stack>
  );
}

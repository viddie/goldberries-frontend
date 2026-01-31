import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import { Button, Chip, Divider, Grid, Stack, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsSplitUpAndLeft,
  faArrowsUpDown,
  faComment,
  faInfoCircle,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import { SuggestedDifficultyChart, SuggestedDifficultyTierCounts } from "../../components/Stats";
import { ChallengeSubmissionTable } from "../Challenge";

import { GeneralSuggestionForm } from "./FormGeneral";
import { FeatureSuggestionForm } from "./FormFeature";
import { ChallengeGeneralSuggestionForm } from "./FormChallengeGeneral";
import { ChallengeSplitSuggestionForm } from "./FormChallengeSplit";
import { ChallengePlacementSuggestionForm } from "./FormChallengePlacement";

const SUGGESTION_TYPES = {
  GENERAL: "general",
  FEATURE: "feature",
  CHALLENGE_GENERAL: "challenge_general",
  CHALLENGE_SPLIT: "challenge_split",
  CHALLENGE_PLACEMENT: "challenge_placement",
};

export function CreateSuggestionModal({ onSuccess }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.create" });
  const [stage, setStage] = useState(1);
  const [suggestionType, setSuggestionType] = useState(null);

  const handleTypeSelect = (type) => {
    setSuggestionType(type);
    setStage(2);
  };

  const handleBack = () => {
    setStage(1);
    setSuggestionType(null);
  };

  const handleSuccess = () => {
    // Reset state on success
    setStage(1);
    setSuggestionType(null);
    if (onSuccess) onSuccess();
  };

  // Get the header text based on stage and type
  const getHeaderText = () => {
    if (stage === 1) return t("header");
    switch (suggestionType) {
      case SUGGESTION_TYPES.GENERAL:
        return t("header_general");
      case SUGGESTION_TYPES.FEATURE:
        return t("header_feature");
      case SUGGESTION_TYPES.CHALLENGE_GENERAL:
        return t("header_challenge_general");
      case SUGGESTION_TYPES.CHALLENGE_SPLIT:
        return t("header_challenge_split");
      case SUGGESTION_TYPES.CHALLENGE_PLACEMENT:
        return t("header_challenge_placement");
      default:
        return t("header");
    }
  };

  return (
    <Grid container rowSpacing={1} columnSpacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          {getHeaderText()}
        </Typography>
      </Grid>

      {stage === 1 && <SuggestionTypeSelector onSelect={handleTypeSelect} />}

      {stage === 2 && suggestionType === SUGGESTION_TYPES.GENERAL && (
        <GeneralSuggestionForm onSuccess={handleSuccess} onBack={handleBack} />
      )}

      {stage === 2 && suggestionType === SUGGESTION_TYPES.FEATURE && (
        <FeatureSuggestionForm onSuccess={handleSuccess} onBack={handleBack} />
      )}

      {stage === 2 && suggestionType === SUGGESTION_TYPES.CHALLENGE_GENERAL && (
        <ChallengeGeneralSuggestionForm onSuccess={handleSuccess} onBack={handleBack} />
      )}

      {stage === 2 && suggestionType === SUGGESTION_TYPES.CHALLENGE_SPLIT && (
        <ChallengeSplitSuggestionForm onSuccess={handleSuccess} onBack={handleBack} />
      )}

      {stage === 2 && suggestionType === SUGGESTION_TYPES.CHALLENGE_PLACEMENT && (
        <ChallengePlacementSuggestionForm onSuccess={handleSuccess} onBack={handleBack} />
      )}
    </Grid>
  );
}

function SuggestionTypeSelector({ onSelect }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.create.types" });
  const theme = useTheme();

  const types = [
    {
      value: SUGGESTION_TYPES.CHALLENGE_GENERAL,
      label: t("challenge_general.label"),
      description: t("challenge_general.description"),
      icon: faInfoCircle,
    },
    {
      value: SUGGESTION_TYPES.CHALLENGE_PLACEMENT,
      label: t("challenge_placement.label"),
      description: t("challenge_placement.description"),
      icon: faArrowsUpDown,
    },
    {
      value: SUGGESTION_TYPES.CHALLENGE_SPLIT,
      label: t("challenge_split.label"),
      description: t("challenge_split.description"),
      icon: faArrowsSplitUpAndLeft,
    },
    {
      value: SUGGESTION_TYPES.GENERAL,
      label: t("general.label"),
      description: t("general.description"),
      icon: faComment,
    },
    {
      value: SUGGESTION_TYPES.FEATURE,
      label: t("feature.label"),
      description: t("feature.description"),
      icon: faPlus,
    },
  ];

  return (
    <>
      {types.map((type) => (
        <Grid item xs={12} key={type.value}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => onSelect(type.value)}
            sx={{
              justifyContent: "flex-start",
              textAlign: "left",
              py: 1.5,
              px: 2,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <Stack direction="row" gap={2} alignItems="center" sx={{ width: "100%" }}>
              <FontAwesomeIcon icon={type.icon} style={{ width: "1.0em" }} size="xl" />
              <Stack direction="column" gap={0} alignItems="flex-start">
                <Typography variant="body1" sx={{ fontWeight: "bold", textTransform: "none" }}>
                  {type.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: "none" }}>
                  {type.description}
                </Typography>
              </Stack>
            </Stack>
          </Button>
        </Grid>
      ))}
    </>
  );
}

export function BackButton({ onBack }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.create" });
  return (
    <Button variant="text" onClick={onBack} sx={{ mr: 1 }}>
      {t("back")}
    </Button>
  );
}

export function ChallengeDetailsDisplay({ challenge, t }) {
  return (
    <>
      <Grid item xs={12}>
        <Divider>
          <Chip label={t("challenge_details")} size="small" />
        </Divider>
      </Grid>
      <Grid item xs={12}>
        <ChallengeSubmissionTable challenge={challenge} onlyShowFirstFew />
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12} sm={9}>
        <Stack direction="row" justifyContent="space-around">
          <SuggestedDifficultyChart challenge={challenge} />
        </Stack>
      </Grid>
      <Grid item xs={12} sm>
        <Typography variant="body1" gutterBottom>
          {t("totals")}
        </Typography>
        <SuggestedDifficultyTierCounts challenge={challenge} direction="column" hideIfEmpty stackGrid />
      </Grid>
    </>
  );
}

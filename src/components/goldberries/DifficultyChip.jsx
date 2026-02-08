import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Chip, Grid, Stack, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

import { useAppSettings } from "../../hooks/AppSettingsProvider";
import { getDifficultyName } from "../../util/data_util";
import { DIFF_CONSTS, getDifficultyChipName, getNewDifficultyColors } from "../../util/constants";

export function DifficultyChip({
  difficulty,
  frac = null,
  prefix = "",
  isPersonal = false,
  highlightPersonal = false,
  noTier = false,
  sx = {},
  ...props
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.difficulty_chip" });
  const { settings } = useAppSettings();
  if (difficulty === null) return null;

  let suffix = "";
  let hasFraction = false;
  if (frac !== null && settings.general.showFractionalTiers) {
    if (frac < 10) {
      suffix = ".0" + frac;
    } else {
      suffix = "." + frac;
    }
    hasFraction = true;
  }
  let name = getDifficultyChipName(settings, difficulty.id, hasFraction);
  if (noTier) {
    name = name.replace(/^Tier\s*/, "");
  }

  const colors = getNewDifficultyColors(settings, difficulty?.id);
  const isTrivial = difficulty.id === DIFF_CONSTS.TRIVIAL_ID;

  const bgColor = colors.color;
  const opacity = isPersonal && !highlightPersonal ? 0.25 : 1;
  const boxShadow =
    isPersonal && highlightPersonal
      ? "0px 0px 3px red, 0px 0px 3px red, 0px 0px 3px red, 0px 0px 3px red, 0px 0px 3px red"
      : "none";

  const chip = (
    <Chip
      label={
        <Stack direction="column" gap={0} sx={{ lineHeight: "11px" }} alignItems="center">
          <Stack direction="row" gap={1} alignItems="center">
            <span>{prefix + name + suffix}</span>
            {isTrivial && (
              <Tooltip title={t("trivial_explanation")} arrow>
                <FontAwesomeIcon icon={faInfoCircle} />
              </Tooltip>
            )}
          </Stack>
        </Stack>
      }
      size="small"
      {...props}
      sx={{
        bgcolor: bgColor,
        color: colors.contrast_color,
        opacity: opacity,
        boxShadow: boxShadow,
        ...sx,
      }}
    />
  );

  if (isPersonal) {
    return (
      <Tooltip title={t("personal_tooltip")} placement="top" arrow>
        {chip}
      </Tooltip>
    );
  }

  return chip;
}

export function DifficultyValueChip({ difficulty, value, prefix = "", suffix = "", sx = {}, ...props }) {
  const { settings } = useAppSettings();
  if (difficulty === null) return null;

  const text = getDifficultyName(difficulty);
  const colors = getNewDifficultyColors(settings, difficulty?.id);
  return (
    <Grid container columnSpacing={0.75}>
      <Grid item xs>
        <Chip
          label={prefix + text + suffix}
          size="small"
          {...props}
          sx={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            bgcolor: colors.color,
            color: colors.contrast_color,
            ...sx,
          }}
        />
      </Grid>
      <Grid item xs="auto" minWidth="50px">
        <Chip
          label={value}
          size="small"
          {...props}
          sx={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            bgcolor: colors.color,
            color: colors.contrast_color,
            ...sx,
          }}
        />
      </Grid>
    </Grid>
  );
}

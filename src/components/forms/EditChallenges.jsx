import { useQuery } from "react-query";
import { Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { getCampaignName, getChallengeNameShort, getMapName } from "../../util/data_util";
import { fetchCampaign, fetchMap } from "../../util/api";
import { getQueryData, usePostChallengesMassEdit } from "../../hooks/useApi";
import { ErrorDisplay, LoadingSpinner, StyledLink } from "../basic";
import { DifficultyChip } from "../goldberries";

export function FormEditChallengesWrapper({ mapId = null, campaignId = null, onSave, ...props }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const isMap = mapId !== null;
  const id = isMap ? mapId : campaignId;

  const query = useQuery({
    queryKey: ["edit_challenges", isMap ? "map" : "campaign", id],
    queryFn: () => (isMap ? fetchMap(id, true, false, true) : fetchCampaign(id, false, true, false, false, true)),
    staleTime: 0,
    cacheTime: 0,
    enabled: id !== null,
  });

  if (query.isLoading || query.isFetching) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const data = getQueryData(query);
  const title = isMap ? (
    <StyledLink to={"/map/" + data.id}>{getMapName(data, data.campaign)}</StyledLink>
  ) : (
    <StyledLink to={"/campaign/" + data.id}>{getCampaignName(data, t_g)}</StyledLink>
  );

  return <FormEditChallenges title={title} challenges={data.challenges ?? []} onSave={onSave} {...props} />;
}

function FormEditChallenges({ title, challenges, onSave, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.edit_challenges" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { mutate: saveChallenges } = usePostChallengesMassEdit((response) => {
    toast.success(t("feedback.updated"));
    if (onSave) onSave(response);
  });

  const form = useForm({
    defaultValues: { challenges: transformChallenges(challenges) },
  });
  const onUpdateSubmit = form.handleSubmit((data) => {
    const payload = data.challenges.map((challenge) => ({
      id: challenge.id,
      sort: challenge.sort === "" || challenge.sort === null ? null : parseInt(challenge.sort),
      label: challenge.label,
    }));
    saveChallenges(payload);
  });

  useEffect(() => {
    form.reset({ challenges: transformChallenges(challenges) });
  }, [challenges]);

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        {title} {">"} {t_g("challenge", { count: 30 })}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t("note")}
      </Typography>

      {challenges.length === 0 && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          {t("no_challenges")}
        </Typography>
      )}

      {challenges.map((challenge, i) => (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={{ xs: 1, sm: 2 }}
          key={challenge.id}
          sx={{ mt: 2 }}
          alignItems="center"
        >
          <Stack direction="row" gap={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <StyledLink to={"/challenge/" + challenge.id}>
              <Typography variant="body1">{getChallengeNameShort(challenge, false, true, true)}</Typography>
            </StyledLink>
            <DifficultyChip difficulty={challenge.difficulty} />
          </Stack>
          <TextField
            label={t_g("label")}
            sx={{ width: { xs: "100%", sm: "350px" } }}
            {...form.register(`challenges[${i}].label`)}
          />
          <TextField
            label={t("sort_order")}
            type="number"
            sx={{ width: { xs: "100%", sm: "120px" } }}
            {...form.register(`challenges[${i}].sort`)}
            onWheel={(e) => e.target.blur()}
          />
        </Stack>
      ))}

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        fullWidth
        color="primary"
        onClick={onUpdateSubmit}
        disabled={challenges.length === 0}
      >
        {t("save_challenges")}
      </Button>
    </form>
  );
}

function transformChallenges(challenges) {
  return challenges.map((challenge) => ({
    id: challenge.id,
    sort: challenge.sort ?? "",
    label: challenge.label ?? "",
  }));
}

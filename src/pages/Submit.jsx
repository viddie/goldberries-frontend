import { Tab, Tabs } from "@mui/material";
import { useQuery } from "react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { fetchChallenge } from "../util/api";
import { BasicContainerBox, ErrorDisplay, HeadTitle, LoadingSpinner } from "../components/basic";
import { SingleSubmission, MultiSubmission, NewChallengeSubmission } from "../components/submit";

//#region PageSubmit
export function PageSubmit() {
  const { t } = useTranslation(undefined, { keyPrefix: "submit" });
  const { tab, challengeId } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab ?? "single-challenge");
  const navigate = useNavigate();

  const setTab = (tab) => {
    setSelectedTab(tab);
    if (tab === "single-challenge") {
      navigate("/submit", { replace: true });
    } else {
      navigate(`/submit/${tab}`, { replace: true });
    }
  };

  const query = useQuery({
    queryKey: ["challenge", challengeId],
    queryFn: () => fetchChallenge(challengeId),
    enabled: challengeId !== undefined,
  });

  if (query.isFetching) {
    return (
      <BasicContainerBox maxWidth="md">
        <Tabs
          value={selectedTab}
          onChange={(event, newValue) => setTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t("tabs.single.label")} value="single-challenge" />
          <Tab label={t("tabs.multi.label")} value="multi-challenge" />
          <Tab label={t("tabs.new.label")} value="new-challenge" />
        </Tabs>
        <LoadingSpinner sx={{ mt: 2 }} />
      </BasicContainerBox>
    );
  } else if (query.isError) {
    return (
      <BasicContainerBox maxWidth="md">
        <ErrorDisplay error={query.error} />
      </BasicContainerBox>
    );
  }

  const challenge = query.data?.data ?? null;

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={t("title")} />
      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label={t("tabs.single.label")} value="single-challenge" />
        <Tab label={t("tabs.multi.label")} value="multi-challenge" />
        <Tab label={t("tabs.new.label")} value="new-challenge" />
      </Tabs>
      {selectedTab === "single-challenge" && (
        <SingleSubmission
          defaultCampaign={challenge?.map?.campaign}
          defaultMap={challenge?.map}
          defaultChallenge={challenge}
        />
      )}
      {selectedTab === "multi-challenge" && <MultiSubmission />}
      {selectedTab === "new-challenge" && <NewChallengeSubmission />}
    </BasicContainerBox>
  );
}
//#endregion

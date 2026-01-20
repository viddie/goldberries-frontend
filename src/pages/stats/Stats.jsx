import { Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BasicContainerBox, HeadTitle } from "../../components/BasicComponents";
import { useTranslation } from "react-i18next";

import { TabMonthlyTierClears } from "./TabMonthlyTierClears";
import { TabMostGoldened } from "./TabMostGoldened";
import { TabMisc } from "./TabMisc";
import { TabVerifierStats } from "./TabVerifierStats";
import { TabTierClears } from "./TabTierClears";

const STATS_TABS = [
  {
    i18key: "historical_clears.label",
    value: "historical-clears",
    component: <TabMonthlyTierClears />,
    subtabs: [],
  },
  {
    i18key: "tier_clears.label",
    value: "tier-clears",
    component: <TabTierClears />,
    subtabs: [],
  },
  {
    i18key: "most_goldened.label",
    value: "most-goldened",
    component: <TabMostGoldened />,
    subtabs: [],
  },
  {
    i18key: "verifier_stats.label",
    value: "verifier-stats",
    component: <TabVerifierStats />,
    subtabs: [],
  },
  {
    i18key: "misc.label",
    value: "misc",
    component: <TabMisc />,
    subtabs: [],
  },
];

export function PageStats() {
  const { t } = useTranslation(undefined, { keyPrefix: "stats" });
  const { t: t_tabs } = useTranslation(undefined, { keyPrefix: "stats.tabs" });
  const navigate = useNavigate();
  const { tab, subtab } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab || "historical-clears");
  const [selectedSubtab, setSelectedSubtab] = useState(
    subtab || STATS_TABS.find((t) => t.value === selectedTab).subtabs[0],
  );

  const updateSelectedTab = (tab) => {
    setSelectedTab(tab);
    setSelectedSubtab(STATS_TABS.find((t) => t.value === tab).subtabs[0]);
    navigate(`/stats/${tab}`, { replace: true });
  };
  const updateSelectedSubtab = (subtab) => {
    setSelectedSubtab(subtab);
    navigate(`/stats/${selectedTab}/${subtab}`, { replace: true });
  };

  const hasSubtabs = selectedTab ? STATS_TABS.find((t) => t.value === selectedTab).subtabs.length > 0 : false;
  const getSubtabs = () => {
    if (selectedTab === null || selectedTab === undefined) {
      return [];
    }
    const tab = STATS_TABS.find((t) => t.value === selectedTab);
    if (tab === undefined) {
      return [];
    }
    return tab.subtabs;
  };
  const getCurrentComponent = () => {
    if (selectedTab === null || selectedTab === undefined) {
      return <></>;
    }
    const tab = STATS_TABS.find((t) => t.value === selectedTab);
    if (tab === undefined) {
      return <></>;
    }

    if (selectedSubtab === null || selectedSubtab === undefined) {
      return tab.component;
    }
    const subtab = tab.subtabs.find((t) => t.value === selectedSubtab);
    if (subtab === undefined) {
      return tab.component;
    }
    return subtab.component;
  };

  return (
    <BasicContainerBox maxWidth="lg">
      <HeadTitle title={t("title")} />
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => updateSelectedTab(newValue)}
        sx={{ borderBottom: "1px solid grey", mb: 1 }}
      >
        {STATS_TABS.map((tab) => (
          <Tab key={tab.value} label={t_tabs(tab.i18key)} value={tab.value} />
        ))}
      </Tabs>

      {hasSubtabs && (
        <Tabs
          value={selectedSubtab}
          onChange={(_, newValue) => updateSelectedSubtab(newValue)}
          sx={{ borderBottom: "1px solid grey", my: 1 }}
        >
          {getSubtabs().map((subtab) => (
            <Tab key={subtab.value} label={t_tabs(subtab.i18key)} value={subtab.value} />
          ))}
        </Tabs>
      )}

      {selectedTab && getCurrentComponent()}
    </BasicContainerBox>
  );
}

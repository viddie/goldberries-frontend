import { Chip, Stack, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BasicContainerBox, HeadTitle } from "../../components/BasicComponents";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faLayerGroup,
  faTrophy,
  faUserCheck,
  faEllipsis,
  faBasketShopping,
  faArrowsUpDown,
} from "@fortawesome/free-solid-svg-icons";

import { TabMonthlyTierClears } from "./TabMonthlyTierClears";
import { TabMostGoldened } from "./TabMostGoldened";
import { TabMisc } from "./TabMisc";
import { TabVerifierStats } from "./TabVerifierStats";
import { TabTierClears } from "./TabTierClears";
import { TabCollectibleCounts } from "./TabCollectibleCounts";
import { TabBiggestDifficultyGap } from "./TabBiggestDifficultyGap";

const STATS_TABS = [
  {
    i18key: "tier_clears.label",
    value: "tier-clears",
    component: <TabTierClears />,
    icon: faLayerGroup,
    subtabs: [],
  },
  {
    i18key: "historical_clears.label",
    value: "historical-clears",
    component: <TabMonthlyTierClears />,
    icon: faChartLine,
    subtabs: [],
  },
  {
    i18key: "most_goldened.label",
    value: "most-goldened",
    component: <TabMostGoldened />,
    icon: faTrophy,
    subtabs: [],
  },
  {
    i18key: "biggest_difficulty_gap.label",
    value: "biggest-difficulty-gap",
    component: <TabBiggestDifficultyGap />,
    icon: faArrowsUpDown,
    subtabs: [],
  },
  {
    i18key: "collectible_counts.label",
    value: "collectible-counts",
    component: <TabCollectibleCounts />,
    icon: faBasketShopping,
    subtabs: [],
  },
  {
    i18key: "verifier_stats.label",
    value: "verifier-stats",
    component: <TabVerifierStats />,
    icon: faUserCheck,
    subtabs: [],
  },
  {
    i18key: "misc.label",
    value: "misc",
    component: <TabMisc />,
    icon: faEllipsis,
    subtabs: [],
  },
];

export function PageStats() {
  const { t } = useTranslation(undefined, { keyPrefix: "stats" });
  const { t: t_tabs } = useTranslation(undefined, { keyPrefix: "stats.tabs" });
  const navigate = useNavigate();
  const { tab, subtab } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab || "tier-clears");
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

      <NavigationChips tabs={STATS_TABS} selectedTab={selectedTab} onTabSelect={updateSelectedTab} />

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

function NavigationChips({ tabs, selectedTab, onTabSelect }) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs" });
  return (
    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
      {tabs.map((tab) => (
        <Chip
          key={tab.value}
          icon={<FontAwesomeIcon icon={tab.icon} />}
          label={t(tab.i18key)}
          onClick={() => onTabSelect(tab.value)}
          variant={selectedTab === tab.value ? "filled" : "outlined"}
          color={selectedTab === tab.value ? "primary" : "default"}
          sx={{
            "& .MuiChip-icon": {
              marginLeft: 1.5,
            },
          }}
        />
      ))}
    </Stack>
  );
}

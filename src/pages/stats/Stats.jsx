import {
  Box,
  Chip,
  Drawer,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
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

// ============================================
// NAVIGATION STYLE CONFIGURATION
// Change this value to switch between navigation styles:
// "tabs" | "drawer" | "toggle" | "chips" | "dropdown" | "cards"
// ============================================
const NAVIGATION_STYLE = "chips";

const STATS_TABS = [
  {
    i18key: "historical_clears.label",
    value: "historical-clears",
    component: <TabMonthlyTierClears />,
    icon: faChartLine,
    subtabs: [],
  },
  {
    i18key: "tier_clears.label",
    value: "tier-clears",
    component: <TabTierClears />,
    icon: faLayerGroup,
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

  const renderNavigation = () => {
    switch (NAVIGATION_STYLE) {
      case "drawer":
        return (
          <NavigationDrawer
            tabs={STATS_TABS}
            selectedTab={selectedTab}
            onTabSelect={updateSelectedTab}
            t={t_tabs}
          />
        );
      case "toggle":
        return (
          <NavigationToggleGroup
            tabs={STATS_TABS}
            selectedTab={selectedTab}
            onTabSelect={updateSelectedTab}
            t={t_tabs}
          />
        );
      case "chips":
        return (
          <NavigationChips
            tabs={STATS_TABS}
            selectedTab={selectedTab}
            onTabSelect={updateSelectedTab}
            t={t_tabs}
          />
        );
      case "dropdown":
        return (
          <NavigationDropdown
            tabs={STATS_TABS}
            selectedTab={selectedTab}
            onTabSelect={updateSelectedTab}
            t={t_tabs}
          />
        );
      case "cards":
        return (
          <NavigationCards
            tabs={STATS_TABS}
            selectedTab={selectedTab}
            onTabSelect={updateSelectedTab}
            t={t_tabs}
          />
        );
      case "tabs":
      default:
        return (
          <NavigationTabs
            tabs={STATS_TABS}
            selectedTab={selectedTab}
            onTabSelect={updateSelectedTab}
            t={t_tabs}
          />
        );
    }
  };

  // For drawer style, we need a different layout
  if (NAVIGATION_STYLE === "drawer") {
    return (
      <Box sx={{ display: "flex" }}>
        <NavigationDrawer
          tabs={STATS_TABS}
          selectedTab={selectedTab}
          onTabSelect={updateSelectedTab}
          t={t_tabs}
        />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <HeadTitle title={t("title")} />
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
        </Box>
      </Box>
    );
  }

  return (
    <BasicContainerBox maxWidth="lg">
      <HeadTitle title={t("title")} />

      {renderNavigation()}

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

// ============================================
// NAVIGATION COMPONENTS
// ============================================

// 1. Original Tabs Navigation
function NavigationTabs({ tabs, selectedTab, onTabSelect, t }) {
  return (
    <Tabs
      value={selectedTab}
      onChange={(_, newValue) => onTabSelect(newValue)}
      sx={{ borderBottom: "1px solid grey", mb: 1 }}
      allowScrollButtonsMobile
      variant="scrollable"
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          label={t(tab.i18key)}
          value={tab.value}
          icon={<FontAwesomeIcon icon={tab.icon} />}
          iconPosition="start"
        />
      ))}
    </Tabs>
  );
}

// 2. Sidebar Drawer Navigation
const DRAWER_WIDTH = 280;

function NavigationDrawer({ tabs, selectedTab, onTabSelect, t }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          position: "relative",
          height: "auto",
          minHeight: "100vh",
        },
      }}
    >
      <Box sx={{ overflow: "auto", pt: 2 }}>
        <Typography variant="h6" sx={{ px: 2, pb: 1 }}>
          Statistics
        </Typography>
        <List>
          {tabs.map((tab) => (
            <ListItemButton
              key={tab.value}
              selected={selectedTab === tab.value}
              onClick={() => onTabSelect(tab.value)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                  borderRight: 3,
                  borderColor: "primary.main",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <FontAwesomeIcon icon={tab.icon} />
              </ListItemIcon>
              <ListItemText primary={t(tab.i18key)} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

// 3. Toggle Button Group Navigation
function NavigationToggleGroup({ tabs, selectedTab, onTabSelect, t }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <ToggleButtonGroup
      value={selectedTab}
      exclusive
      onChange={(_, newValue) => {
        if (newValue !== null) onTabSelect(newValue);
      }}
      sx={{
        mb: 2,
        flexWrap: "wrap",
        gap: 0.5,
        "& .MuiToggleButtonGroup-grouped": {
          border: 1,
          borderColor: "divider",
          "&:not(:first-of-type)": {
            borderLeft: 1,
            borderColor: "divider",
            marginLeft: 0,
          },
        },
      }}
    >
      {tabs.map((tab) => (
        <ToggleButton
          key={tab.value}
          value={tab.value}
          sx={{
            px: isMobile ? 1.5 : 2,
            py: 1,
            textTransform: "none",
          }}
        >
          <FontAwesomeIcon icon={tab.icon} style={{ marginRight: 8 }} />
          {t(tab.i18key)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

// 4. Chip-based Navigation
function NavigationChips({ tabs, selectedTab, onTabSelect, t }) {
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
              marginLeft: 1,
            },
          }}
        />
      ))}
    </Stack>
  );
}

// 5. Dropdown/Select Menu Navigation
function NavigationDropdown({ tabs, selectedTab, onTabSelect, t }) {
  return (
    <TextField
      select
      value={selectedTab}
      onChange={(e) => onTabSelect(e.target.value)}
      label="Select Statistics"
      fullWidth
      sx={{ mb: 2 }}
    >
      {tabs.map((tab) => (
        <MenuItem key={tab.value} value={tab.value}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <FontAwesomeIcon icon={tab.icon} style={{ width: "1em" }} />
            {t(tab.i18key)}
          </Stack>
        </MenuItem>
      ))}
    </TextField>
  );
}

// 6. Grid of Cards Navigation (styled like CreateSuggestionModal/Report)
const StyledNavCard = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  border: selected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
  userSelect: "none",
  backgroundColor: selected ? theme.palette.action.selected : theme.palette.background.paper,
  "&:hover": {
    backgroundColor: selected ? theme.palette.action.selected : theme.palette.action.hover,
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

function NavigationCards({ tabs, selectedTab, onTabSelect, t }) {
  const theme = useTheme();

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {tabs.map((tab) => (
        <Grid item xs={6} sm={4} md={4} key={tab.value}>
          <StyledNavCard
            elevation={selectedTab === tab.value ? 3 : 1}
            selected={selectedTab === tab.value}
            onClick={() => onTabSelect(tab.value)}
          >
            <Stack direction="row" gap={2} alignItems="center">
              <FontAwesomeIcon
                icon={tab.icon}
                style={{
                  width: "1.2em",
                  color: selectedTab === tab.value ? theme.palette.primary.main : "inherit",
                }}
                size="lg"
              />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: selectedTab === tab.value ? "bold" : "normal",
                  color: selectedTab === tab.value ? "primary.main" : "text.primary",
                }}
              >
                {t(tab.i18key)}
              </Typography>
            </Stack>
          </StyledNavCard>
        </Grid>
      ))}
    </Grid>
  );
}

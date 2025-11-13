import { CampaignIcon } from "../components/GoldberriesComponents";

export const NewRules = {
  goldens: {
    id: "submissions",
    rules: {
      id: "submissions-all",
      type: "ordered",
      count: 15,
    },
    full_game_additional: {
      id: "submissions-fullgame",
      explanation: true,
      type: "ordered",
      count: 8,
    },
  },
  general_recommendations: {
    id: "general-recs",
    section: {
      header: false,
      explanation: true,
      type: "unordered",
      size: "small",
      count: 3,
    },
  },
  allowed_mods: {
    id: "allowed-mods",
    section: {
      header: false,
      explanation: true,
      type: "unordered",
      size: "small",
      count: 6,
    },
  },
  maps: {
    id: "maps",
    rules: {
      header: false,
      type: "ordered",
      count: 6,
    },
  },
};

export const featuredCampaigns = [
  {
    name: "Strawberry Jam",
    id: 1199,
    icon_url: "/icons/campaigns/sj.png",
  },
  {
    name: "Spring Collab 2020",
    id: 1200,
    icon_url: "/icons/campaigns/spring-collab-20.png",
  },
  {
    name: "Gallery Collab",
    id: 387,
    icon_url: "/icons/campaigns/gallery-collab.png",
  },
  {
    name: "Breeze Contest",
    id: 1502,
    icon_url: "/icons/campaigns/breeze-contest.png",
  },
  {
    name: "Startup Contest",
    id: 810,
    icon_url: "/icons/campaigns/startup-contest.png",
  },
  {
    name: "Glyph",
    id: 400,
    icon_url: "/icons/campaigns/glyph.png",
  },
  {
    name: "Winter Collab 2021",
    id: 977,
    icon_url: "/icons/campaigns/winter-collab-21.png",
  },
  {
    name: "Monika's D-Sides",
    id: 867,
    icon_url: "/icons/campaigns/d-sides-monika.png",
  },
  {
    name: "Beginner Collab",
    id: 92,
    icon_url: "/icons/campaigns/beginner-collab.png",
  },
  {
    name: "Midway Contest",
    id: 564,
    icon_url: "/icons/campaigns/midway-contest.png",
  },
  // {
  //   name: "Secret Santa Collab 2024",
  //   id: 1216,
  //   icon_url: "/icons/campaigns/secret-santa-collab-2024.png",
  // },
];

export function getFeaturedCampaignsNavEntries() {
  return featuredCampaigns.map((item) => produceCampaignNavEntry(item));
}

function produceCampaignNavEntry(item) {
  return {
    name: item.name,
    path: `/campaign/${item.id}`,
    icon: <CampaignIcon campaign={{ name: item.name, icon_url: item.icon_url }} />,
  };
}

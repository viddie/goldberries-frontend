import { memo, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@uidotdev/usehooks";
import { TooltipLineBreaks } from "../basic_components/TooltipLineBreaks";

const defaultEmote = {
  img: "golden-control.png",
  alt: "Golden Control",
};

export const EMOTES = [
  {
    img: "chart_with_sideways_trend.png",
    alt: "Chart with Sideways Trend",
    weight: 100,
  },
  {
    img: "chart_with_midwards_trend.png",
    alt: "Chart with Midwards Trend",
    weight: 100,
  },
  {
    img: "chart_with_awesome_trend.png",
    alt: "Chart with Awesome Trend",
    weight: 100,
  },
  {
    img: "chart_with_no_trend.png",
    alt: "Chart with No Trend",
    weight: 100,
  },
  {
    img: "chart_with_dunning_kruger_trend.png",
    alt: "Chart with Dunning Kruger Trend",
    weight: 100,
  },
  {
    img: "chart_with_horse_trend.png",
    alt: "Chart with Horse Trend",
    weight: 100,
  },
  {
    img: "clowneline.png",
    alt: "Clowneline",
    weight: 50,
  },
  {
    img: "frank.png",
    alt: "Frank",
    weight: 50,
  },
  {
    img: "3dgrineline.png",
    alt: "3dgrineline",
    weight: 50,
  },
  {
    img: "3dfrowneline.png",
    alt: "3dfrowneline",
    weight: 50,
  },
  {
    img: "entity.png",
    alt: "Entity",
    weight: 10,
  },
];

// new emotes: destareline, catplush, catbucket and catbus (uncommon), frontstare (rare), catnodwashingmachine and Cat (ultra rare)
export function WebsiteIcon({
  height = "1em",
  style = {},
  preventFunny = false,
  hideTooltip = false,
  countLoad = false,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "navigation.icon_tooltip" });
  const [loaded, setLoaded] = useLocalStorage("website_icon_loaded", 0);

  //Track how often the icon is loaded
  useEffect(() => {
    if (countLoad) {
      setLoaded((prev) => prev + 1);
    }
  }, []);

  let totalWeight = EMOTES.reduce((sum, emote) => sum + emote.weight, 0);
  let rand = Math.random() * totalWeight;
  let icon = defaultEmote; // Default icon if no emote is selected
  let odds = 1;
  let postfix = "";

  if (!preventFunny && Math.random() < 0.01) {
    odds *= 0.01;
    for (const emote of EMOTES) {
      if (rand < emote.weight) {
        icon = emote;
        odds *= emote.weight / totalWeight;
        break;
      }
      rand -= emote.weight;
    }
  } else {
    odds *= 0.99;
  }
  // Flipped
  if (!preventFunny && Math.random() < 0.005) {
    odds *= 0.005;
    style.transform = "rotate(180deg)";
    postfix += " [" + t("flipped") + "]";
  } else {
    odds *= 0.995;
  }
  // Shiny
  if (!preventFunny && Math.random() < 1 / 8192) {
    odds *= 1 / 8192;
    style.filter = "hue-rotate(180deg)";
    postfix += " [" + t("shiny") + "]";
  } else {
    odds *= 8191 / 8192;
  }

  if (postfix === "") postfix = " [" + t("default") + "]";

  let oddsText;
  if (odds < 0.0001) {
    oddsText = "1 in " + Math.round(1 / odds).toLocaleString();
  } else {
    oddsText = (odds * 100).toFixed(2) + "%";
  }

  let iconToDisplay = useMemo(() => icon, []);
  let text = useMemo(
    () =>
      t("text", {
        icon: iconToDisplay.alt,
        postfix: postfix,
        odds: oddsText,
        count: loaded,
      }),
    [],
  );
  let styleToDisplay = useMemo(() => style, []);

  const imageElement = (
    <img
      src={"/emotes/" + iconToDisplay.img}
      alt={iconToDisplay.alt}
      style={{
        height: height,
        ...styleToDisplay,
      }}
    />
  );

  if (hideTooltip) return imageElement;

  return <TooltipLineBreaks title={text}>{imageElement}</TooltipLineBreaks>;
}

export const MemoWebsiteIcon = memo(WebsiteIcon);

import { Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCampaignName } from "../../util/data_util";

export function CampaignIcon({ campaign, height = "1.3em", doLink = false, style = {} }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const iconUrl = campaign.icon_url;
  if (iconUrl === null) return null;

  const comp = (
    <Tooltip title={getCampaignName(campaign, t_g)} arrow placement="top">
      <img
        src={iconUrl}
        alt={campaign.name}
        className="outlined"
        style={{
          height: height,
          ...style,
        }}
        loading="lazy"
      />
    </Tooltip>
  );

  return (
    <>
      {doLink ? (
        <Link to={"/campaign/" + campaign.id} style={{ height: height }}>
          {comp}
        </Link>
      ) : (
        comp
      )}
    </>
  );
}

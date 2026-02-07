import { useAppSettings } from "../../hooks/AppSettingsProvider";
import { getPlayerNameColorStyle } from "../../util/data_util";
import { StyledLink } from "../basic/StyledLink";

export function PlayerLink({ player, ...props }) {
  const { settings } = useAppSettings();
  const nameStyle = getPlayerNameColorStyle(player, settings);
  return (
    <StyledLink to={"/player/" + player.id} style={{ whiteSpace: "nowrap", ...nameStyle }}>
      {player.name}
    </StyledLink>
  );
}

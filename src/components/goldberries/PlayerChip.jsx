import { Chip, Stack } from "@mui/material";
import { Link } from "react-router-dom";

import { useAppSettings } from "../../hooks/AppSettingsProvider";
import { getPlayerNameColorStyle } from "../../util/data_util";

import { AccountRoleIcon } from "./AccountRoleIcon";
import { SuspendedIcon } from "./SuspendedIcon";

export function PlayerChip({ player, trimLongNames = false, ...props }) {
  const { settings } = useAppSettings();
  if (player === undefined || player === null) {
    return <Chip label="<not found>" sx={{ mr: 1 }} {...props} />;
  }

  const style = getPlayerNameColorStyle(player, settings);
  if (trimLongNames) {
    style.overflow = "hidden";
    style.maxWidth = "130px";
  }

  return (
    <Link to={"/player/" + player.id}>
      <Chip
        label={
          <Stack direction="row" alignItems="center" gap={1}>
            <span style={style}>{player.name}</span>
            {player.account.is_suspended ? (
              <SuspendedIcon reason={player.account.suspension_reason} />
            ) : (
              <AccountRoleIcon account={player.account} />
            )}
          </Stack>
        }
        {...props}
      />
    </Link>
  );
}

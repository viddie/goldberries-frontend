import { Autocomplete, TextField } from "@mui/material";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";

import { fetchAllPlayers, fetchPlayerList } from "../../util/api";
import { getQueryData } from "../../hooks/useApi";

export function PlayerSelect({ type, value, onChange, label, ...props }) {
  const { t } = useTranslation();
  const queryFn = type === "all" ? fetchAllPlayers : () => fetchPlayerList(type);
  const query = useQuery({
    queryKey: ["player_list", type],
    queryFn: queryFn,
  });

  const players = getQueryData(query) ?? [];
  //Sort alphabetically
  players.sort((a, b) => a.name.localeCompare(b.name));

  const getOptionLabel = (player) => {
    return player?.name ?? "";
  };

  label = label ?? t("general.player", { count: 1 });

  return (
    <Autocomplete
      options={players}
      getOptionLabel={getOptionLabel}
      renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

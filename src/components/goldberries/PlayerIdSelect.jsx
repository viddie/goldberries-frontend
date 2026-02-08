import { Autocomplete, TextField } from "@mui/material";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";

import { fetchAllPlayers, fetchPlayerList } from "../../util/api";
import { getQueryData } from "../../hooks/useApi";

export function PlayerIdSelect({ type, value, onChange, label, ...props }) {
  const { t } = useTranslation();
  const queryFn = type === "all" ? fetchAllPlayers : () => fetchPlayerList(type);
  const query = useQuery({
    queryKey: ["player_list", type],
    queryFn: queryFn,
  });

  const players = getQueryData(query) ?? [];

  //Sort alphabetically
  players.sort((a, b) => a.name.localeCompare(b.name));

  label = label ?? t("general.player", { count: 1 });
  return (
    <Autocomplete
      options={players}
      getOptionLabel={(player) => player?.name ?? ""}
      renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
      value={players.find((p) => p.id === value) ?? null}
      onChange={(event, newValue) => {
        onChange(event, newValue ? newValue.id : null);
      }}
      {...props}
    />
  );
}

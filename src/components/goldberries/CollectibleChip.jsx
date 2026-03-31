import { Chip } from "@mui/material";

import { getCollectibleIcon, getCollectibleName } from "../forms/Map";

export function CollectibleChip({ collectibleId, count }) {
  const name = getCollectibleName(collectibleId, "");
  const icon = getCollectibleIcon(collectibleId, "");

  return (
    <Chip
      size="small"
      label={`${name}${count && count !== "1" ? ` ×${count}` : ""}`}
      avatar={icon ? <img src={icon} alt={name} style={{ width: 16, height: 16 }} /> : undefined}
    />
  );
}

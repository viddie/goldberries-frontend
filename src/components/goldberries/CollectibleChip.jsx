import { Chip } from "@mui/material";

import { getCollectibleIcon, getCollectibleName } from "../forms/Map";

export function CollectibleChip({ collectibleId, variantId, count }) {
  const name = getCollectibleName(collectibleId, variantId || "");
  const icon = getCollectibleIcon(collectibleId, variantId || "");

  return (
    <Chip
      size="small"
      label={`${name}${count && count !== "1" ? ` ×${count}` : ""}`}
      avatar={icon ? <img src={icon} alt={name} style={{ height: 16, width: "auto" }} /> : undefined}
    />
  );
}

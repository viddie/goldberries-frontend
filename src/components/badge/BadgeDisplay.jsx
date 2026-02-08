import { Stack } from "@mui/material";

import { Badge } from "./Badge";

export function BadgeDisplay({ player }) {
  const badges = player.data?.badges || [];
  return (
    <Stack direction="row" gap={1} alignItems="center">
      {badges.map((badge) => (
        <Badge key={badge.id} badge={badge} />
      ))}
    </Stack>
  );
}

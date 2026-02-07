import { Stack } from "@mui/material";
import { getQueryData, useGetBadge } from "../../hooks/useApi";
import { ErrorDisplay, LoadingSpinner } from "../basic";
import { Badge } from "./Badge";

export function BadgeAsync({ id, inline = true }) {
  const query = useGetBadge(id);

  if (query.isLoading) return <LoadingSpinner />;
  if (query.isError) return <ErrorDisplay error={query.error} />;

  const badge = getQueryData(query);
  return (
    <Stack
      direction="row"
      sx={{ display: inline ? "inline-block" : undefined, verticalAlign: inline ? "middle" : undefined }}
      justifyContent="space-around"
      alignItems="center"
    >
      <Badge badge={badge} />
    </Stack>
  );
}

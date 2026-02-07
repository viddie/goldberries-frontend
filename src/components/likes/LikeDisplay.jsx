import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Stack } from "@mui/material";

export function LikeDisplay({ likes }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      <FontAwesomeIcon icon={faHeart} />
      <span>{likes}</span>
    </Stack>
  );
}

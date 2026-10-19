import { faBan } from "@fortawesome/free-solid-svg-icons";

import { useRestriction } from "../../hooks/useRestriction";
import { NoticeBox } from "../basic";

// Shows a notice if the logged in account has the given restriction (an entry of RESTRICTIONS), otherwise nothing
export function RestrictionNotice({ restriction, value, sx }) {
  const { isRestricted, message } = useRestriction(restriction, value);
  if (!isRestricted) return null;
  return (
    <NoticeBox severity="error" icon={faBan} sx={sx}>
      {message}
    </NoticeBox>
  );
}

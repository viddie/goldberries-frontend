import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StyledLink } from "../basic/StyledLink";
import { getPlatformIcon } from "./LinkIcon";

export function ProofExternalLinkButton({ url }) {
  return (
    <StyledLink to={url} target="_blank">
      <FontAwesomeIcon icon={getPlatformIcon(url)} />
    </StyledLink>
  );
}

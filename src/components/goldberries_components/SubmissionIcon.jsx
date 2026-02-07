import { faBook } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "@emotion/react";
import { Link } from "react-router-dom";

export function SubmissionIcon({ submission }) {
  const theme = useTheme();
  return (
    <Link to={"/submission/" + submission.id} style={{ color: theme.palette.links.main }}>
      <FontAwesomeIcon icon={faBook} />
    </Link>
  );
}

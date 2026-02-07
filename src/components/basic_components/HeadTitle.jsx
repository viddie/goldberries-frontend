import { Helmet } from "react-helmet";
import { APP_NAME_LONG, IS_DEBUG } from "../../util/constants";

export function HeadTitle({ title }) {
  title = IS_DEBUG ? `[DEV] ${title}` : title;
  return (
    <Helmet>
      <title>
        {title} - {APP_NAME_LONG}
      </title>
    </Helmet>
  );
}

import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../util/constants";
import { PlaceholderImage } from "../PlaceholderImage";

export function SubmissionEmbed({ submission, noBorderRadius = false, style = {}, ...props }) {
  const { t } = useTranslation();
  const url = API_BASE_URL + "/embed/img/submission.php?id=" + submission.id;
  return (
    <PlaceholderImage
      src={url}
      alt={t("general.submission", { count: 1 })}
      style={{
        borderRadius: noBorderRadius ? 0 : "10px",
        aspectRatio: "1024 / 500",
        ...style,
      }}
      {...props}
    />
  );
}

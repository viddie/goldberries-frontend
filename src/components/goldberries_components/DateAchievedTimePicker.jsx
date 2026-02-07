import dayjs from "dayjs";
import { DateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { useTranslation } from "react-i18next";

export function DateAchievedTimePicker({ value, onChange, sx = {}, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  return (
    <DateTimePicker
      label={t("date_achieved")}
      value={dayjs(value)}
      onChange={(value) => {
        onChange(value.toISOString());
      }}
      viewRenderers={{
        hours: renderTimeViewClock,
        minutes: renderTimeViewClock,
      }}
      maxDateTime={dayjs(new Date())}
      sx={{ width: "100%", ...sx }}
      {...props}
    />
  );
}

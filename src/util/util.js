import { toast } from "react-toastify";

export function jsonDateToJsDate(jsonDate) {
  // jsonDate is an object with these properties:
  /*
    {
      date: string,
      timezone_type: int,
      timezone: string
    }
  */

  //After a new backend update it is now just a string
  return new Date(jsonDate);
}

export function dateToTimeAgoString(date, t_g) {
  //Output: "15 minutes ago", "2 hours ago", "3 days ago", "1 month ago", "1 year ago"

  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return t_g("time_ago.years", { count: years });
  } else if (months > 0) {
    return t_g("time_ago.months", { count: months });
  } else if (days > 0) {
    return t_g("time_ago.days", { count: days });
  } else if (hours > 0) {
    return t_g("time_ago.hours", { count: hours });
  } else if (minutes > 0) {
    return t_g("time_ago.minutes", { count: minutes });
  } else {
    return t_g("time_ago.seconds", { count: seconds });
  }
}

export function errorToast(axiosError) {
  toast.error(getAxiosErrorMessage(axiosError));
}

export function getAxiosErrorMessage(axiosError) {
  console.log("Axios error:", axiosError);
  return axiosError.response.data?.error ?? axiosError.message;
}

export function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

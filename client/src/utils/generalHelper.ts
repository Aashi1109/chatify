import { ChatDeliveryStatus } from "@/definitions/enums";

/**
 * Returns the icon URL corresponding to the given chat delivery status.
 * @param {ChatDeliveryStatus} deliveryStatus - The delivery status of the chat message.
 * @returns {string|null} The URL of the icon corresponding to the delivery status, or null if no icon is found.
 */
const iconUrlFromDeliveryStatus = (deliveryStatus: ChatDeliveryStatus) => {
  switch (deliveryStatus) {
    // If the message is unsent, return the URL for the waiting-retry icon.
    case ChatDeliveryStatus.Sending:
      return "/assets/waiting-timer.png";
    // If the message is sent but not yet delivered, return the URL for the single-tick icon.
    case ChatDeliveryStatus.Sent:
      return "/assets/single-tick.png";
    // If the message is delivered but not yet read, return the URL for the double-tick icon.
    case ChatDeliveryStatus.Delivered:
      return "/assets/double-tick.png";
    // If the message is delivered and read, return the URL for the blue-tick icon.
    case ChatDeliveryStatus.DeliveredRead:
      return "/assets/sent-tick.png";
    // If the message delivery status is unknown or invalid, return null.
    case ChatDeliveryStatus.Failed:
      return "/assets/retry.png";
    default:
      return null;
  }
};

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const handleOnunloadLTClear = (e: any) => {
  localStorage.clear();
};

const getToken = () => {
  return getLocalStorageItem("token");
};

const getLocalStorageItem = (key: string) => {
  return localStorage.getItem(key);
};

const updateQueryString = (
  searchParams: any,
  name: string,
  value: string,
  optype: "upadd" | "remove"
) => {
  const params = new URLSearchParams(Array.from(searchParams.entries()));

  switch (optype) {
    case "upadd":
      params.set(name, value);
      break;
    case "remove":
      params.delete(name);
      break;
    default:
      break;
  }
  return params.toString();
};

const createUrlWithQueryParams = (url: string, queryParams: any): string => {
  let isInitial = true;

  for (const query in queryParams) {
    if (Object.prototype.hasOwnProperty.call(queryParams, query)) {
      const queryValue = queryParams[query];
      if (isInitial) {
        url += "?" + query + "=" + queryValue;
        isInitial = false;
      } else {
        url += "&" + query + "=" + queryValue;
      }
    }
  }

  return url;
};
export {
  createUrlWithQueryParams,
  formatBytes,
  getLocalStorageItem,
  getToken,
  handleOnunloadLTClear,
  iconUrlFromDeliveryStatus,
  updateQueryString,
};

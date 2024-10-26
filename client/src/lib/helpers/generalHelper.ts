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

const handleOnunloadLTClear = () => {
  localStorage.clear();
};

const getToken = () => {
  return getLocalStorageItem("token");
};

export const getUserId = () => {
  return getLocalStorageItem("userId");
};

const getLocalStorageItem = (key: string) => {
  return localStorage.getItem(key);
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

const debounce = function <T extends (...args: any[]) => any>(
  func: T,
  delay = 3000
): T {
  let timer: NodeJS.Timeout | undefined = undefined;

  return function (...args: Parameters<T>) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  } as T;
};

export {
  createUrlWithQueryParams,
  debounce,
  formatBytes,
  getLocalStorageItem,
  getToken,
  handleOnunloadLTClear,
};

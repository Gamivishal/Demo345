

import axios from "axios";

// Download a file (e.g., Excel) from the backend and trigger browser download
export async function exportToExcel(url, filename = "data.xlsx", config = {}) {
  const response = await axiosApi.get(url, {
    ...config,
    responseType: "blob",
  });
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function exportToFile(url, filename, config = {}) {
  const response = await axiosApi.get(url, {
    ...config,
    responseType: "blob",
  });

  const urlObj = window.URL.createObjectURL(response.data);

  const link = document.createElement("a");
  link.href = urlObj;
  link.setAttribute("download", filename);

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(urlObj);
}

//apply base url for axios
const API_URL = "https://localhost:7281/api";

const axiosApi = axios.create({
  baseURL: API_URL,
});

let lastApiResponseData = null;

axiosApi.interceptors.request.use(
  config => {
    const tokenData = localStorage.getItem("data");
    const parsedData = tokenData ? JSON.parse(tokenData) : null;
    const token = parsedData?.data;

    config.headers = {
      ...(config.headers || {}),
    };

    // Only attach auth header when a token exists.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Content-Type is needed only for body requests.
    const method = (config.method || "get").toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  error => Promise.reject(error)
);
axiosApi.interceptors.response.use(
  (response) => {
    lastApiResponseData = response?.data ?? null;
    return response;
  },
  (error) => {
    lastApiResponseData = error?.response?.data ?? null;
    return Promise.reject(error);
  }
);

export const consumeLastApiResponseData = () => {
  const recentResponseData = lastApiResponseData;
  lastApiResponseData = null;
  return recentResponseData;
};

export async function get(url, config = {}) {
  return await axiosApi
    .get(url, { ...config })
    .then((response) => response.data);
}

export async function post(url, data, config = {}) {
  return axiosApi
    .post(url, { ...data }, { ...config })
    .then((response) => response.data);
}

export async function put(url, data, config = {}) {
  return axiosApi
    .put(url, { ...data }, { ...config })
    .then((response) => response.data);
}

export async function del(url, config = {}) {
  return await axiosApi
    .delete(url, { ...config })
    .then((response) => response.data);
}
export async function getBlob(url, config = {}) {
  return await axiosApi.get(url, {
    ...config,
    responseType: "blob",
  });
}

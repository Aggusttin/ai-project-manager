import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:3001";

export const api = axios.create({
  baseURL: API_URL,

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: false,
});

// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token");

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  }
);

// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error(
      "AXIOS ERROR:",
      error?.response || error
    );

    if (typeof window !== "undefined") {
      if (
        error?.response?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        localStorage.removeItem(
          "userRol"
        );

        window.location.href =
          "/login";
      }
    }

    return Promise.reject(error);
  }
);
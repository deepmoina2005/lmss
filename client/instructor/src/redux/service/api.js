import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: backendUrl,
});

export const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const appConfig = {
  backendUrl,
  currency: import.meta.env.VITE_CURRENCY,
};

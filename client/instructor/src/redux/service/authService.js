import { api, authHeaders } from "./api";

export const loginApi = async (payload) => {
  const { data } = await api.post("/api/auth/login", payload);
  return data;
};

export const registerApi = async (payload) => {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
};

export const verifyAuthApi = async (token) => {
  const { data } = await api.get("/api/auth/verify", authHeaders(token));
  return data;
};

export const requestInstructorRoleApi = async (token) => {
  const { data } = await api.get("/api/educator/update-role", authHeaders(token));
  return data;
};

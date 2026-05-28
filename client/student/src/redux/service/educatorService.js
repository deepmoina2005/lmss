import { api, authHeaders } from "./api";

export const addCourseApi = async (token, formData) => {
  const { data } = await api.post("/api/educator/add-course", formData, authHeaders(token));
  return data;
};

export const fetchEducatorCoursesApi = async (token) => {
  const { data } = await api.get("/api/educator/courses", authHeaders(token));
  return data;
};

export const fetchEducatorDashboardApi = async (token) => {
  const { data } = await api.get("/api/educator/dashboard", authHeaders(token));
  return data;
};

export const fetchEducatorStudentsApi = async (token) => {
  const { data } = await api.get("/api/educator/enrolled-students", authHeaders(token));
  return data;
};

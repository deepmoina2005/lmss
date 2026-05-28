import { api, authHeaders } from "./api";

export const addCourseApi = async (token, formData) => {
  const { data } = await api.post("/api/educator/add-course", formData, authHeaders(token));
  return data;
};

export const fetchEducatorCoursesApi = async (token) => {
  const { data } = await api.get("/api/educator/courses", authHeaders(token));
  return data;
};

export const updateEducatorCourseApi = async (token, id, formData) => {
  const { data } = await api.patch(`/api/educator/courses/${id}`, formData, authHeaders(token));
  return data;
};

export const deleteEducatorCourseApi = async (token, id) => {
  const { data } = await api.delete(`/api/educator/courses/${id}`, authHeaders(token));
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

export const fetchInstructorDoubtsApi = async (token) => {
  const { data } = await api.get("/api/educator/doubts", authHeaders(token));
  return data;
};

export const replyInstructorDoubtApi = async (token, id, reply) => {
  const { data } = await api.patch(`/api/educator/doubts/${id}/reply`, { reply }, authHeaders(token));
  return data;
};

import { api, authHeaders } from "./api";

export const fetchAllCoursesApi = async () => {
  const { data } = await api.get("/api/course/all");
  return data;
};

export const fetchCourseByIdApi = async (id) => {
  const { data } = await api.get(`/api/course/${id}`);
  return data;
};

export const purchaseCourseApi = async (token, courseId) => {
  const { data } = await api.post("/api/user/purchase", { courseId }, authHeaders(token));
  return data;
};

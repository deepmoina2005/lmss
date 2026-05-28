import { api, authHeaders } from "./api";

export const fetchEnrolledCoursesApi = async (token) => {
  const { data } = await api.get("/api/user/enrolled-courses", authHeaders(token));
  return data;
};

export const fetchUserProfileApi = async (token) => {
  const { data } = await api.get("/api/user/data", authHeaders(token));
  return data;
};

export const fetchCourseProgressApi = async (token, courseId) => {
  const { data } = await api.post("/api/user/get-course-progress", { courseId }, authHeaders(token));
  return data;
};

export const updateCourseProgressApi = async (token, payload) => {
  const { data } = await api.post("/api/user/update-course-progress", payload, authHeaders(token));
  return data;
};

export const addRatingApi = async (token, payload) => {
  const { data } = await api.post("/api/user/add-rating", payload, authHeaders(token));
  return data;
};

export const updateUserProfileApi = async (token, formData) => {
  const { data } = await api.put("/api/user/update-profile", formData, authHeaders(token));
  return data;
};

export const changePasswordApi = async (token, payload) => {
  const { data } = await api.post("/api/user/change-password", payload, authHeaders(token));
  return data;
};

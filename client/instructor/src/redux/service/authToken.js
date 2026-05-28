export const getAuthToken = () => localStorage.getItem("token") || "";

export const clearAuthToken = () => localStorage.removeItem("token");
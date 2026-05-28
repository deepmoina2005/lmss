import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api, authHeaders } from "../service/api";

const defaultAdminProfile = {
  name: "LMS Admin",
  email: "",
  phone: "",
  imageUrl: "",
};

const getStoredAdminProfile = () => {
  try {
    return {
      ...defaultAdminProfile,
      ...JSON.parse(localStorage.getItem("adminProfile") || "{}"),
    };
  } catch {
    return defaultAdminProfile;
  }
};

const initialState = {
  token: localStorage.getItem("adminToken") || "",
  profile: getStoredAdminProfile(),
  users: [],
  pendingInstructors: [],
  loading: false,
  error: null,
};

export const adminLogin = createAsyncThunk("admin/login", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/api/admin/login", payload);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    localStorage.setItem("adminToken", data.token);
    return { token: data.token, admin: data.admin };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchAdminUsers = createAsyncThunk("admin/fetchUsers", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("adminToken");
    const { data } = await api.get("/api/admin/users", authHeaders(token));
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.users;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchAdminProfile = createAsyncThunk("admin/fetchProfile", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("adminToken");
    const { data } = await api.get("/api/admin/profile", authHeaders(token));
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.admin;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchPendingInstructors = createAsyncThunk("admin/fetchPending", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("adminToken");
    const { data } = await api.get("/api/admin/instructors/pending", authHeaders(token));
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.instructors;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const reviewInstructor = createAsyncThunk("admin/reviewInstructor", async ({ id, action }, thunkAPI) => {
  try {
    const token = localStorage.getItem("adminToken");
    const { data } = await api.patch(`/api/admin/instructors/${id}/${action}`, {}, authHeaders(token));
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return { id, action, message: data.message };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateUserStatus = createAsyncThunk("admin/updateUserStatus", async ({ id, action }, thunkAPI) => {
  try {
    const token = localStorage.getItem("adminToken");
    const { data } = await api.patch(`/api/admin/users/${id}/${action}`, {}, authHeaders(token));
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return { user: data.user, message: data.message };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteAdminUser = createAsyncThunk("admin/deleteUser", async (id, thunkAPI) => {
  try {
    const token = localStorage.getItem("adminToken");
    const { data } = await api.delete(`/api/admin/users/${id}`, authHeaders(token));
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return { id, message: data.message };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const changeAdminPassword = createAsyncThunk("admin/changePassword", async (payload, thunkAPI) => {
  try {
    const token = localStorage.getItem("adminToken");
    const { data } = await api.patch("/api/admin/profile/password", payload, authHeaders(token));
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.message;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    updateAdminProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
      localStorage.setItem("adminProfile", JSON.stringify(state.profile));
    },
    logoutAdmin: (state) => {
      localStorage.removeItem("adminToken");
      state.token = "";
      state.users = [];
      state.pendingInstructors = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.profile = {
          ...state.profile,
          email: state.profile.email || action.payload.admin?.email || "",
        };
        localStorage.setItem("adminProfile", JSON.stringify(state.profile));
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.profile = {
          ...state.profile,
          email: action.payload?.email || state.profile.email,
        };
        localStorage.setItem("adminProfile", JSON.stringify(state.profile));
      })
      .addCase(fetchPendingInstructors.fulfilled, (state, action) => {
        state.pendingInstructors = action.payload;
      })
      .addCase(reviewInstructor.fulfilled, (state, action) => {
        state.pendingInstructors = state.pendingInstructors.filter((u) => u.id !== action.payload.id);
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.users = state.users.map((user) => (user.id === action.payload.user.id ? action.payload.user : user));
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload.id);
      });
  },
});

export const { logoutAdmin, updateAdminProfile } = adminSlice.actions;
export default adminSlice.reducer;

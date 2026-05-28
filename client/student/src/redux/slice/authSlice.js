import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginApi, registerApi, requestInstructorRoleApi, verifyAuthApi } from "../service/authService";
import { clearAuthToken, getAuthToken } from "../service/authToken";
import { changePasswordApi, fetchUserProfileApi, updateUserProfileApi } from "../service/learningService";

const token = getAuthToken();

const initialState = {
  token,
  user: null,
  isAuthenticated: Boolean(token),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk("auth/loginUser", async (payload, thunkAPI) => {
  try {
    const data = await loginApi(payload);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    localStorage.setItem("token", data.token);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const registerUser = createAsyncThunk("auth/registerUser", async (payload, thunkAPI) => {
  try {
    const data = await registerApi(payload);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const verifyAuth = createAsyncThunk("auth/verifyAuth", async (_, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await verifyAuthApi(tk);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return { token: tk, user: data.user };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchMyProfile = createAsyncThunk("auth/fetchMyProfile", async (_, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await fetchUserProfileApi(tk);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const requestInstructorRole = createAsyncThunk("auth/requestInstructorRole", async (_, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await requestInstructorRoleApi(tk);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.message;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateMyProfile = createAsyncThunk("auth/updateMyProfile", async (payload, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await updateUserProfileApi(tk, payload);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const changeMyPassword = createAsyncThunk("auth/changeMyPassword", async (payload, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await changePasswordApi(tk, payload);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.message;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      clearAuthToken();
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addCourseApi,
  fetchEducatorCoursesApi,
  fetchEducatorDashboardApi,
  fetchEducatorStudentsApi,
} from "../service/educatorService";
import { getAuthToken } from "../service/authToken";

const initialState = {
  courses: [],
  dashboard: null,
  enrolledStudents: [],
  loading: false,
  error: null,
};

export const addCourse = createAsyncThunk("educator/addCourse", async (formData, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await addCourseApi(tk, formData);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchEducatorCourses = createAsyncThunk("educator/fetchCourses", async (_, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await fetchEducatorCoursesApi(tk);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.courses;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchEducatorDashboard = createAsyncThunk("educator/fetchDashboard", async (_, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await fetchEducatorDashboardApi(tk);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.dashboardData;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchEducatorStudents = createAsyncThunk("educator/fetchStudents", async (_, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await fetchEducatorStudentsApi(tk);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return [...(data.enrolledStudents || [])].reverse();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const educatorSlice = createSlice({
  name: "educator",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEducatorCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEducatorCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchEducatorCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEducatorDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      .addCase(fetchEducatorStudents.fulfilled, (state, action) => {
        state.enrolledStudents = action.payload;
      });
  },
});

export default educatorSlice.reducer;

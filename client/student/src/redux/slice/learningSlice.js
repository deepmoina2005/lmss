import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addRatingApi,
  fetchCourseDoubtsApi,
  fetchCourseProgressApi,
  fetchEnrolledCoursesApi,
  submitCourseDoubtApi,
  updateCourseProgressApi,
} from "../service/learningService";
import { getAuthToken } from "../service/authToken";

const initialState = {
  enrolledCourses: [],
  doubtsByCourse: {},
  progressByCourse: {},
  loading: false,
  error: null,
};

export const fetchEnrolledCourses = createAsyncThunk("learning/fetchEnrolledCourses", async (_, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await fetchEnrolledCoursesApi(tk);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return [...(data.enrolledCourses || [])].reverse();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchCourseProgress = createAsyncThunk("learning/fetchCourseProgress", async (courseId, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await fetchCourseProgressApi(tk, courseId);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return { courseId, progressData: data.progressData };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateCourseProgress = createAsyncThunk("learning/updateCourseProgress", async (payload, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await updateCourseProgressApi(tk, payload);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return payload.courseId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addCourseRating = createAsyncThunk("learning/addCourseRating", async (payload, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await addRatingApi(tk, payload);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.message;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const submitCourseDoubt = createAsyncThunk("learning/submitCourseDoubt", async (payload, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await submitCourseDoubtApi(tk, payload);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.message;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchCourseDoubts = createAsyncThunk("learning/fetchCourseDoubts", async (courseId, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await fetchCourseDoubtsApi(tk, courseId);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return { courseId, doubts: data.doubts || [] };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const learningSlice = createSlice({
  name: "learning",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.enrolledCourses = action.payload;
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCourseProgress.fulfilled, (state, action) => {
        state.progressByCourse[action.payload.courseId] = action.payload.progressData;
      })
      .addCase(fetchCourseDoubts.fulfilled, (state, action) => {
        state.doubtsByCourse[action.payload.courseId] = action.payload.doubts;
      });
  },
});

export default learningSlice.reducer;

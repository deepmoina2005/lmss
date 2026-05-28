import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAllCoursesApi, fetchCourseByIdApi, purchaseCourseApi } from "../service/courseService";
import { getAuthToken } from "../service/authToken";
import { appConfig } from "../service/api";

const initialState = {
  allCourses: [],
  currentCourse: null,
  purchaseSessionUrl: null,
  currency: appConfig.currency,
  loading: false,
  error: null,
};

export const fetchAllCourses = createAsyncThunk("course/fetchAllCourses", async (_, thunkAPI) => {
  try {
    const data = await fetchAllCoursesApi();
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.courses;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchCourseById = createAsyncThunk("course/fetchCourseById", async (id, thunkAPI) => {
  try {
    const data = await fetchCourseByIdApi(id);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.courseData;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const purchaseCourse = createAsyncThunk("course/purchaseCourse", async (courseId, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("Please login first");
    const data = await purchaseCourseApi(tk, courseId);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.session_url;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.allCourses = action.payload;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.currentCourse = action.payload;
      })
      .addCase(purchaseCourse.fulfilled, (state, action) => {
        state.purchaseSessionUrl = action.payload;
      });
  },
});

export default courseSlice.reducer;

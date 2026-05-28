import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addCourseApi,
  deleteEducatorCourseApi,
  fetchEducatorCoursesApi,
  fetchEducatorDashboardApi,
  fetchEducatorStudentsApi,
  fetchInstructorDoubtsApi,
  replyInstructorDoubtApi,
  updateEducatorCourseApi,
} from "../service/educatorService";
import { getAuthToken } from "../service/authToken";

const initialState = {
  courses: [],
  dashboard: null,
  enrolledStudents: [],
  doubts: [],
  loading: false,
  coursesLoaded: false,
  studentsLoaded: false,
  doubtsLoaded: false,
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

export const updateEducatorCourse = createAsyncThunk("educator/updateCourse", async ({ id, formData }, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await updateEducatorCourseApi(tk, id, formData);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return { course: data.course, message: data.message };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteEducatorCourse = createAsyncThunk("educator/deleteCourse", async (id, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await deleteEducatorCourseApi(tk, id);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return { id, message: data.message };
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

export const fetchInstructorDoubts = createAsyncThunk("educator/fetchDoubts", async (_, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await fetchInstructorDoubtsApi(tk);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return data.doubts || [];
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const replyInstructorDoubt = createAsyncThunk("educator/replyDoubt", async ({ id, reply }, thunkAPI) => {
  try {
    const tk = getAuthToken();
    if (!tk) return thunkAPI.rejectWithValue("No token");
    const data = await replyInstructorDoubtApi(tk, id, reply);
    if (!data.success) return thunkAPI.rejectWithValue(data.message);
    return { doubt: data.doubt, message: data.message };
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
        state.coursesLoaded = false;
      })
      .addCase(fetchEducatorCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.coursesLoaded = true;
        state.courses = action.payload;
      })
      .addCase(fetchEducatorCourses.rejected, (state, action) => {
        state.loading = false;
        state.coursesLoaded = true;
        state.error = action.payload;
      })
      .addCase(updateEducatorCourse.fulfilled, (state, action) => {
        state.courses = state.courses.map((course) =>
          course._id === action.payload.course._id ? action.payload.course : course
        );
      })
      .addCase(deleteEducatorCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter((course) => course._id !== action.payload.id);
      })
      .addCase(fetchEducatorDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      .addCase(fetchEducatorStudents.pending, (state) => {
        state.loading = true;
        state.studentsLoaded = false;
      })
      .addCase(fetchEducatorStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.studentsLoaded = true;
        state.enrolledStudents = action.payload;
      })
      .addCase(fetchEducatorStudents.rejected, (state, action) => {
        state.loading = false;
        state.studentsLoaded = true;
        state.error = action.payload;
      })
      .addCase(fetchInstructorDoubts.pending, (state) => {
        state.loading = true;
        state.doubtsLoaded = false;
      })
      .addCase(fetchInstructorDoubts.fulfilled, (state, action) => {
        state.loading = false;
        state.doubtsLoaded = true;
        state.doubts = action.payload;
      })
      .addCase(fetchInstructorDoubts.rejected, (state, action) => {
        state.loading = false;
        state.doubtsLoaded = true;
        state.error = action.payload;
      })
      .addCase(replyInstructorDoubt.fulfilled, (state, action) => {
        state.doubts = state.doubts.map((doubt) =>
          doubt._id === action.payload.doubt._id ? action.payload.doubt : doubt
        );
      });
  },
});

export default educatorSlice.reducer;

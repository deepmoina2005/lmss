import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/authSlice";
import courseReducer from "../slice/courseSlice";
import learningReducer from "../slice/learningSlice";
import educatorReducer from "../slice/educatorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    learning: learningReducer,
    educator: educatorReducer,
  },
});

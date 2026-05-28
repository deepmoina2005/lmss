import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/authSlice";
import educatorReducer from "../slice/educatorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    educator: educatorReducer,
  },
});

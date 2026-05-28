import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchAllCourses } from "../slice/courseSlice";
import { fetchEnrolledCourses } from "../slice/learningSlice";
import { verifyAuth } from "../slice/authSlice";
import { getAuthToken } from "./authToken";

const AppBootstrap = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  useEffect(() => {
    const tk = getAuthToken();
    if (!tk) return;
    dispatch(verifyAuth());
    dispatch(fetchEnrolledCourses());
  }, [dispatch]);

  return children;
};

export default AppBootstrap;

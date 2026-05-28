import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Educator from "./pages/educator/Educator";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import Profile from "./pages/educator/Profile";
import Doubts from "./pages/educator/Doubts";
import InstructorLogin from "./pages/auth/InstructorLogin";
import InstructorRegister from "./pages/auth/InstructorRegister";

const ProtectedInstructorRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const token = localStorage.getItem("token");
  const isInstructor = user?.role === "instructor";

  if (!token && !isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user && !isInstructor) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/educator" replace />} />
    <Route path="/auth/login" element={<InstructorLogin />} />
    <Route path="/auth/register" element={<InstructorRegister />} />

    <Route
      path="/educator"
      element={
        <ProtectedInstructorRoute>
          <Educator />
        </ProtectedInstructorRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="add-course" element={<AddCourse />} />
      <Route path="my-courses" element={<MyCourses />} />
      <Route path="student-enrolled" element={<StudentsEnrolled />} />
      <Route path="doubts" element={<Doubts />} />
      <Route path="profile" element={<Profile />} />
    </Route>
  </Routes>
);

export default App;

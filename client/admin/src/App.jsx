import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./pages/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PendingInstructors from "./pages/PendingInstructors";
import AdminUsers from "./pages/AdminUsers";
import AdminProfile from "./pages/AdminProfile";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="pending-instructors" element={<PendingInstructors />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
};

export default App;

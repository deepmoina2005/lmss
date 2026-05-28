import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import { fetchAdminProfile } from "../redux/slice/adminSlice";

const AdminLayout = () => {
  const token = localStorage.getItem("adminToken");
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(fetchAdminProfile());
    }
  }, [dispatch, token]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminTopbar />
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

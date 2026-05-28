import React, { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminUsers } from "../redux/slice/adminSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.admin.users);

  useEffect(() => {
    dispatch(fetchAdminUsers()).then((result) => {
      if (fetchAdminUsers.rejected.match(result)) toast.error(result.payload || "Failed to fetch users");
    });
  }, [dispatch]);

  const stats = useMemo(() => ({
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    instructors: users.filter((u) => u.role === "instructor").length,
    pending: users.filter((u) => u.role === "instructor" && u.status === "pending").length,
    approved: users.filter((u) => u.status === "approved").length,
    blocked: users.filter((u) => u.status === "blocked").length,
    rejected: users.filter((u) => u.status === "rejected").length,
  }), [users]);

  const getPercentage = (value) => (stats.total ? Math.round((value / stats.total) * 100) : 0);

  const cards = [
    { label: "Total Users", value: stats.total, helper: `${stats.approved} approved accounts` },
    { label: "Students", value: stats.students, helper: `${getPercentage(stats.students)}% of users` },
    { label: "Instructors", value: stats.instructors, helper: `${stats.pending} pending approval` },
  ];

  const roleChart = [
    { label: "Students", value: stats.students, color: "bg-blue-600" },
    { label: "Instructors", value: stats.instructors, color: "bg-emerald-600" },
  ];

  const statusChart = [
    { label: "Approved", value: stats.approved, color: "bg-emerald-600" },
    { label: "Pending", value: stats.pending, color: "bg-amber-500" },
    { label: "Blocked", value: stats.blocked, color: "bg-slate-700" },
    { label: "Rejected", value: stats.rejected, color: "bg-rose-600" },
  ];

  const renderBarChart = (items) => {
    const maxValue = Math.max(...items.map((item) => item.value), 1);

    return (
      <div className="mt-5 h-64 flex items-end gap-4 border-l border-b border-slate-200 px-4 pt-4">
        {items.map((item) => {
          const height = Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0);

          return (
            <div key={item.label} className="flex-1 min-w-0 h-full flex flex-col items-center justify-end">
              <span className="text-sm font-semibold text-slate-800 mb-2">{item.value}</span>
              <div className="w-full max-w-16 h-44 flex items-end">
                <div
                  className={`w-full rounded-t-md ${item.color}`}
                  style={{ height: `${height}%` }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>
              <span className="mt-3 text-xs text-slate-500 text-center truncate w-full">{item.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-slate-800">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-lg p-5">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-3">{card.value}</p>
            <p className="text-xs text-slate-500 mt-2">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-base font-semibold text-slate-800">User Role Chart</h2>
          {renderBarChart(roleChart)}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-base font-semibold text-slate-800">Account Status Chart</h2>
          {renderBarChart(statusChart)}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "../redux/slice/adminSlice";

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menu = [
    { label: "Overview", path: "/admin" },
    { label: "Pending Instructors", path: "/admin/pending-instructors" },
    { label: "All Users", path: "/admin/users" },
    { label: "Profile", path: "/admin/profile" },
  ];

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate("/admin/login");
  };

  return (
    <aside className="w-full md:w-64 border-r border-slate-200 bg-white">
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Admin Panel</h2>
      </div>
      <nav className="p-3 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;

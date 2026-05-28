import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { deleteAdminUser, fetchAdminUsers, updateUserStatus } from "../redux/slice/adminSlice";

const AdminUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.admin.users);

  useEffect(() => {
    dispatch(fetchAdminUsers()).then((result) => {
      if (fetchAdminUsers.rejected.match(result)) toast.error(result.payload || "Failed to fetch users");
    });
  }, [dispatch]);

  const handleStatusAction = async (user) => {
    const action = user.status === "blocked" ? "unblock" : "block";
    const result = await dispatch(updateUserStatus({ id: user.id, action }));

    if (updateUserStatus.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error(result.payload || "Action failed");
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete ${user.name}? This action cannot be undone.`);
    if (!confirmed) return;

    const result = await dispatch(deleteAdminUser(user.id));

    if (deleteAdminUser.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error(result.payload || "Delete failed");
    }
  };

  const statusStyles = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-rose-100 text-rose-700",
    blocked: "bg-slate-200 text-slate-700",
  };

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-slate-800">All Users</h1>
      <div className="mt-5 bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Role</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Created</th><th className="text-left px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3 capitalize text-slate-700">{user.role}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${statusStyles[user.status] || "bg-slate-100 text-slate-700"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusAction(user)}
                      className={`px-3 py-1.5 rounded text-white ${
                        user.status === "blocked" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      {user.status === "blocked" ? "Unblock" : "Block"}
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="px-3 py-1.5 rounded bg-rose-600 text-white hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchPendingInstructors, reviewInstructor } from "../redux/slice/adminSlice";

const PendingInstructors = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.admin.pendingInstructors);

  const fetchPending = () => {
    dispatch(fetchPendingInstructors()).then((result) => {
      if (fetchPendingInstructors.rejected.match(result)) {
        toast.error(result.payload || "Failed to fetch pending instructors");
      }
    });
  };

  const handleAction = async (id, action) => {
    const result = await dispatch(reviewInstructor({ id, action }));
    if (reviewInstructor.fulfilled.match(result)) {
      toast.success(result.payload.message);
      fetchPending();
    } else {
      toast.error(result.payload || "Action failed");
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-slate-800">Pending Instructors</h1>
      <div className="mt-5 bg-white border border-slate-200 rounded-lg overflow-x-auto">
        {items.length === 0 ? (
          <p className="p-4 text-slate-500">No pending instructor requests.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Actions</th></tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-semibold">{user.status}</span></td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => handleAction(user.id, "approve")} className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700">Approve</button>
                    <button onClick={() => handleAction(user.id, "reject")} className="px-3 py-1.5 rounded bg-rose-600 text-white hover:bg-rose-700">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PendingInstructors;

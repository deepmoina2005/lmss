import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { adminLogin } from "../redux/slice/adminSlice";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(adminLogin({ email, password }));
    if (adminLogin.fulfilled.match(result)) {
      toast.success("Admin login successful");
      navigate("/admin");
    } else {
      toast.error(result.payload || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in with .env admin credentials</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800" placeholder="admin@lms.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800" placeholder="********" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white rounded-md py-2.5 font-medium hover:bg-slate-800 disabled:opacity-60">
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

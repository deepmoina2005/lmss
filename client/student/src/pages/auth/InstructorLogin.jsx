import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loginUser } from "../../redux/slice/authSlice";

const InstructorLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (isAuthenticated) navigate("/educator");
  }, [isAuthenticated, navigate]);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const user = result.payload?.user;
      if (user?.role !== "instructor") {
        toast.error("Please login from student portal");
        return;
      }
      toast.success("Instructor login successful");
      navigate("/educator");
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-800">Instructor Login</h1>
        <p className="text-sm text-slate-500 mt-1">Login as instructor</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div><label className="text-sm font-medium text-slate-700">Email</label><input name="email" type="email" value={form.email} onChange={onChange} required className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800" placeholder="instructor@example.com" /></div>
          <div><label className="text-sm font-medium text-slate-700">Password</label><input name="password" type="password" value={form.password} onChange={onChange} required className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800" placeholder="********" /></div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white rounded-md py-2.5 font-medium hover:bg-slate-800 disabled:opacity-60">{loading ? "Signing in..." : "Login"}</button>
        </form>

        <p className="mt-4 text-sm text-slate-600">New instructor? <Link to="/auth/instructor/register" className="text-blue-600 hover:underline">Create instructor account</Link></p>
      </div>
    </div>
  );
};

export default InstructorLogin;

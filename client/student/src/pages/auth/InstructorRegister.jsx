import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { registerUser } from "../../redux/slice/authSlice";

const InstructorRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "instructor" });

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser({ ...form, role: "instructor" }));
    if (registerUser.fulfilled.match(result)) {
      toast.success(result.payload?.message || "Instructor registration submitted");
      navigate("/auth/instructor/login");
    } else {
      toast.error(result.payload || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-800">Instructor Register</h1>
        <p className="text-sm text-slate-500 mt-1">Admin approval required before login</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div><label className="text-sm font-medium text-slate-700">Name</label><input name="name" type="text" value={form.name} onChange={onChange} required className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800" placeholder="Your Name" /></div>
          <div><label className="text-sm font-medium text-slate-700">Email</label><input name="email" type="email" value={form.email} onChange={onChange} required className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800" placeholder="instructor@example.com" /></div>
          <div><label className="text-sm font-medium text-slate-700">Password</label><input name="password" type="password" value={form.password} onChange={onChange} required minLength={6} className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800" placeholder="Minimum 6 characters" /></div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white rounded-md py-2.5 font-medium hover:bg-slate-800 disabled:opacity-60">{loading ? "Creating..." : "Register"}</button>
        </form>

        <p className="mt-4 text-sm text-slate-600">Already have account? <Link to="/auth/instructor/login" className="text-blue-600 hover:underline">Instructor login</Link></p>
      </div>
    </div>
  );
};

export default InstructorRegister;

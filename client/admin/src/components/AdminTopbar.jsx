import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { GraduationCap } from "lucide-react";

const AdminTopbar = () => {
  const profile = useSelector((state) => state.admin.profile);

  const initials = (profile.name || "A")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
          <GraduationCap size={23} strokeWidth={2.5} />
        </span>
        <p className="text-sm md:text-base font-semibold text-slate-800">LMS Administration</p>
      </div>
      <Link
        to="/admin/profile"
        title="Profile"
        className="h-10 w-10 rounded-full border border-slate-200 bg-slate-900 text-white flex items-center justify-center text-sm font-semibold overflow-hidden hover:ring-2 hover:ring-slate-300"
      >
        {profile.imageUrl ? <img src={profile.imageUrl} alt="Profile" className="h-full w-full object-cover" /> : initials}
      </Link>
    </header>
  );
};

export default AdminTopbar;

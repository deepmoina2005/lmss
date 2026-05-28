import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/slice/authSlice";
import { assets } from "../../assets/assets";
import { GraduationCap } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  return (
    <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3">
      <Link to="/" className="flex items-center gap-2">
        <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
          <GraduationCap size={26} strokeWidth={2.5} />
        </span>
        <span className="text-2xl font-bold text-slate-900">VidyaHub</span>
      </Link>

      <div className="flex items-center gap-5 text-gray-500 relative">
        <p>Hi! {user?.name || "Instructor"} </p>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((prev) => !prev)}>
            <img className="w-9 h-9 rounded-full object-cover border border-slate-300" src={user?.imageUrl || assets.profile_img} alt="profile_img" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden z-20">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/educator/profile");
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Profile
              </button>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

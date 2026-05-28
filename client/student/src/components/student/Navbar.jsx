import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, requestInstructorRole } from "../../redux/slice/authSlice";
import { GraduationCap } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isCourseListPage = location.pathname.includes("/course-list");
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isEducator = user?.role === "instructor" && user?.status === "approved";
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (event) => {
      const isInsideDesktop = desktopMenuRef.current?.contains(event.target);
      const isInsideMobile = mobileMenuRef.current?.contains(event.target);
      if (!isInsideDesktop && !isInsideMobile) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const becomeEducator = async () => {
    try {
      if (!isAuthenticated) {
        toast.warn("Please login first");
        return;
      }

      if (isEducator) {
        navigate("/educator");
        return;
      }

      const result = await dispatch(requestInstructorRole());
      if (requestInstructorRole.fulfilled.match(result)) {
        toast.success(result.payload);
      } else {
        toast.error(result.payload || "Request failed");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = () => {
    dispatch(logoutUser());
    window.location.href = "/";
  };

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-3 ${
        isCourseListPage ? "bg-white" : "bg-cyan-100/70"
      } `}
    >
      <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
        <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
          <GraduationCap size={26} strokeWidth={2.5} />
        </span>
        <span className="text-2xl font-bold text-slate-900">VidyaHub</span>
      </div>
      <div className="hidden md:flex items-center gap-5 text-gray-500">
        {isAuthenticated && (
          <>
            {isEducator && <button onClick={becomeEducator}>Educator Dashboard</button>}
            <span className="text-sm">Hi, {user?.name || "User"}</span>
            <div className="relative" ref={desktopMenuRef}>
              <button onClick={() => setMenuOpen((prev) => !prev)}>
                <img
                  src={user?.imageUrl || "/student.png"}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/my-enrollments");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    My Enrollments
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Profile
                  </button>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {!isAuthenticated && (
          <>
            <button onClick={() => navigate("/auth/student/login")} className="bg-blue-600 text-white px-5 py-2 rounded-full">
              Login
            </button>
            <button onClick={() => navigate("/auth/student/register")} className="border border-blue-600 text-blue-600 px-5 py-2 rounded-full">
              Register
            </button>
          </>
        )}
      </div>

      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        {isAuthenticated ? (
          <>
            {isEducator && (
              <button onClick={becomeEducator} className="max-sm:text-xs">
                Educator
              </button>
            )}
            <div className="relative" ref={mobileMenuRef}>
              <button onClick={() => setMenuOpen((prev) => !prev)}>
                <img
                  src={user?.imageUrl || "/student.png"}
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover border border-slate-300"
                />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/my-enrollments");
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Enrollments
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Profile
                  </button>
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button onClick={() => navigate("/auth/student/login")} className="text-xs bg-blue-600 text-white px-3 py-1 rounded">
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;

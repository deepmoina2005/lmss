import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { changeAdminPassword, updateAdminProfile } from "../redux/slice/adminSlice";

const AdminProfile = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.admin.profile);
  const [formData, setFormData] = useState({
    ...profile,
    email: profile.email || "admin@example.com",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const initials = (formData.name || "A")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      email: profile.email || current.email,
    }));
  }, [profile.email]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({ ...current, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    dispatch(
      updateAdminProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        imageUrl: formData.imageUrl.trim(),
      })
    );
    toast.success("Profile updated");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setPasswordLoading(true);
    const result = await dispatch(changeAdminPassword(passwordData));

    if (changeAdminPassword.fulfilled.match(result)) {
      toast.success(result.payload);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(result.payload || "Password change failed");
    }

    setPasswordLoading(false);
  };

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-slate-800">Admin Profile</h1>
      <div className="mt-5 bg-white border border-slate-200 rounded-lg p-5 md:p-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center border-b border-slate-200 pb-5">
          <div className="flex flex-col items-start gap-3">
            {formData.imageUrl ? (
              <img
                src={formData.imageUrl}
                alt={formData.name}
                className="h-20 w-20 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
            )}
            <label className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium cursor-pointer hover:bg-slate-200">
              Upload Photo
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800">{formData.name || "LMS Admin"}</p>
            <p className="text-sm text-slate-500">{formData.email || "admin@example.com"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              placeholder="LMS Admin"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 bg-slate-50 text-slate-500 outline-none"
              placeholder="Current admin email"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Profile Image</label>
            <input
              value={formData.imageUrl ? "Profile photo uploaded" : ""}
              readOnly
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 bg-slate-50 text-slate-500 outline-none"
              placeholder="Upload a profile photo"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="px-5 py-2 rounded-md bg-slate-900 text-white font-medium hover:bg-slate-800">
              Update Profile
            </button>
          </div>
        </form>
      </div>

      <div className="mt-5 bg-white border border-slate-200 rounded-lg p-5 md:p-6 max-w-3xl">
        <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              placeholder="Current password"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              placeholder="New password"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              placeholder="Confirm password"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2 rounded-md bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-60"
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;

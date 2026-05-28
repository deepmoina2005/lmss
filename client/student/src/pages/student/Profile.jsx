import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { changeMyPassword, fetchMyProfile, updateMyProfile } from "../../redux/slice/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!user) dispatch(fetchMyProfile());
  }, [dispatch, user]);

  useEffect(() => {
    setName(user?.name || "");
  }, [user]);

  const imageSrc = useMemo(() => preview || user?.imageUrl || "/student.png", [preview, user?.imageUrl]);

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() && !image) {
      toast.warn("Please update at least one field");
      return;
    }

    const formData = new FormData();
    if (name.trim()) formData.append("name", name.trim());
    if (image) formData.append("image", image);

    setSaving(true);
    const result = await dispatch(updateMyProfile(formData));
    setSaving(false);

    if (updateMyProfile.fulfilled.match(result)) {
      toast.success("Profile updated successfully");
      setImage(null);
      setPreview("");
      return;
    }
    toast.error(result.payload || "Profile update failed");
  };

  const onPasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.warn("Please fill all password fields");
      return;
    }

    setChangingPassword(true);
    const result = await dispatch(changeMyPassword(passwordForm));
    setChangingPassword(false);

    if (changeMyPassword.fulfilled.match(result)) {
      toast.success(result.payload || "Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      return;
    }
    toast.error(result.payload || "Password change failed");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>
      <form onSubmit={onSubmit} className="mt-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          <img src={imageSrc} alt="profile" className="w-20 h-20 rounded-full object-cover border" />
          <label className="cursor-pointer text-sm bg-slate-900 text-white px-4 py-2 rounded-md">
            Change Photo
            <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
          </label>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="mt-1 w-full border border-slate-200 bg-slate-100 rounded-md px-3 py-2 text-slate-600"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-md disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <form onSubmit={onPasswordSubmit} className="mt-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <h2 className="text-xl font-semibold text-slate-900">Change Password</h2>

        <div>
          <label className="text-sm font-medium text-slate-700">Current Password</label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
            placeholder="Current password"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">New Password</label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
            placeholder="New password"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
            placeholder="Confirm new password"
          />
        </div>

        <button
          type="submit"
          disabled={changingPassword}
          className="bg-slate-900 text-white px-5 py-2 rounded-md disabled:opacity-60"
        >
          {changingPassword ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default Profile;

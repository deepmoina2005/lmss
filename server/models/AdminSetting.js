import mongoose from "mongoose";

const adminSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const AdminSetting = mongoose.model("AdminSetting", adminSettingSchema);

export default AdminSetting;

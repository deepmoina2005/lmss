import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      required: true,
      default: "student",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "blocked"],
      default: "approved",
    },
    imageUrl: { type: String, default: "" },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true, trim: true },
    reply: { type: String, default: "", trim: true },
    status: { type: String, enum: ["open", "answered"], default: "open" },
  },
  { timestamps: true }
);

const Doubt = mongoose.model("Doubt", doubtSchema);

export default Doubt;

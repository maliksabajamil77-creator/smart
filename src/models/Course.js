import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    creditHours: { type: Number, default: 3 },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    semester: { type: Number, default: 1 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    sessionsPerWeek: { type: Number, default: 2 },
    sessionDuration: { type: Number, default: 60 },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);

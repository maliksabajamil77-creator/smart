import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    hasConflict: { type: Boolean, default: false },
    conflictReason: { type: String, default: "" },
  },
  { _id: true }
);

const timetableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    semester: { type: Number, default: 1 },
    slots: { type: [slotSchema], default: [] },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", timetableSchema);

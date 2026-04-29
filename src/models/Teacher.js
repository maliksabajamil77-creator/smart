import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: "" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    designation: { type: String, default: "Lecturer" },
    availability: { type: [availabilitySchema], default: [] },
    maxHoursPerWeek: { type: Number, default: 20 },
  },
  { timestamps: true }
);

export default mongoose.model("Teacher", teacherSchema);

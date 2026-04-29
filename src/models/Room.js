import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ["classroom", "lab", "auditorium"], default: "classroom" },
    capacity: { type: Number, default: 30 },
    building: { type: String, default: "" },
    availability: { type: [availabilitySchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);

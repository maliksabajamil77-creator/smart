import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    workingDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    startTime: { type: String, default: "08:00" },
    endTime: { type: String, default: "16:00" },
    slotDuration: { type: Number, default: 60 },
    breakStart: { type: String, default: "12:00" },
    breakEnd: { type: String, default: "13:00" },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    institutionName: { type: String, default: "Smart Time-Table" },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);

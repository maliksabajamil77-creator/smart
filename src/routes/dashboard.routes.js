import { Router } from "express";
import Teacher from "../models/Teacher.js";
import Course from "../models/Course.js";
import Room from "../models/Room.js";
import Department from "../models/Department.js";
import Timetable from "../models/Timetable.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authRequired);

router.get("/stats", async (_req, res, next) => {
  try {
    const [teachers, courses, rooms, departments, timetables] = await Promise.all([
      Teacher.countDocuments(),
      Course.countDocuments(),
      Room.countDocuments(),
      Department.countDocuments(),
      Timetable.find().sort({ createdAt: -1 }).limit(1),
    ]);

    const latest = timetables[0];
    let totalSlots = 0;
    let conflicts = 0;
    let roomUsage = {};

    if (latest) {
      totalSlots = latest.slots.length;
      conflicts = latest.slots.filter((s) => s.hasConflict).length;
      const allRooms = await Room.find();
      allRooms.forEach((r) => {
        roomUsage[r.name] = latest.slots.filter(
          (s) => String(s.room) === String(r._id)
        ).length;
      });
    }

    res.json({
      teachers,
      courses,
      rooms,
      departments,
      totalSlots,
      conflicts,
      roomUsage,
    });
  } catch (err) { next(err); }
});

export default router;

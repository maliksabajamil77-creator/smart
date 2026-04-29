import { Router } from "express";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import Timetable from "../models/Timetable.js";
import Course from "../models/Course.js";
import Teacher from "../models/Teacher.js";
import Room from "../models/Room.js";
import Settings from "../models/Settings.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { generateTimetable, detectConflicts } from "../services/scheduler.js";

const router = Router();
router.use(authRequired);

router.get("/", async (_req, res, next) => {
  try {
    const items = await Timetable.find()
      .populate("department")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const t = await Timetable.findById(req.params.id)
      .populate("department")
      .populate("slots.course")
      .populate("slots.teacher")
      .populate("slots.room");
    if (!t) return res.status(404).json({ message: "Not found" });
    res.json(t);
  } catch (err) { next(err); }
});

router.post("/generate", async (req, res, next) => {
  try {
    const { name = "Timetable", department, semester } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    const courseFilter = {};
    if (department) courseFilter.department = department;
    if (semester) courseFilter.semester = semester;

    const courses = await Course.find(courseFilter).populate("teacher").populate("room");
    const teachers = await Teacher.find();
    const rooms = await Room.find();

    if (courses.length === 0) {
      return res.status(400).json({ message: "No courses found to schedule" });
    }

    const slots = generateTimetable(courses, teachers, rooms, settings);
    const slotsWithConflicts = detectConflicts(slots);

    const tt = await Timetable.create({
      name,
      department: department || undefined,
      semester: semester || 1,
      slots: slotsWithConflicts,
    });

    const populated = await Timetable.findById(tt._id)
      .populate("department")
      .populate("slots.course")
      .populate("slots.teacher")
      .populate("slots.room");

    res.json(populated);
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const t = await Timetable.findById(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });

    if (req.body.name) t.name = req.body.name;
    if (req.body.slots) {
      t.slots = detectConflicts(req.body.slots);
    }
    await t.save();

    const populated = await Timetable.findById(t._id)
      .populate("department")
      .populate("slots.course")
      .populate("slots.teacher")
      .populate("slots.room");

    res.json(populated);
  } catch (err) { next(err); }
});

router.put("/:id/slot/:slotId", async (req, res, next) => {
  try {
    const t = await Timetable.findById(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });

    const slot = t.slots.id(req.params.slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    Object.assign(slot, req.body);
    t.slots = detectConflicts(t.slots);
    await t.save();

    const populated = await Timetable.findById(t._id)
      .populate("department")
      .populate("slots.course")
      .populate("slots.teacher")
      .populate("slots.room");

    res.json(populated);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.get("/:id/export/pdf", async (req, res, next) => {
  try {
    const t = await Timetable.findById(req.params.id)
      .populate("slots.course")
      .populate("slots.teacher")
      .populate("slots.room");
    if (!t) return res.status(404).json({ message: "Not found" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${t.name}.pdf"`);

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
    doc.pipe(res);

    doc.fontSize(20).text(t.name, { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date(t.generatedAt).toLocaleString()}`, { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12).text("Schedule:", { underline: true });
    doc.moveDown();

    t.slots.forEach((s) => {
      const courseName = s.course?.name || "—";
      const teacherName = s.teacher?.name || "—";
      const roomName = s.room?.name || "—";
      doc
        .fontSize(10)
        .fillColor(s.hasConflict ? "red" : "black")
        .text(
          `${s.day} ${s.startTime}-${s.endTime} | ${courseName} | ${teacherName} | ${roomName}${
            s.hasConflict ? "  [CONFLICT: " + s.conflictReason + "]" : ""
          }`
        );
    });

    doc.end();
  } catch (err) { next(err); }
});

router.get("/:id/export/excel", async (req, res, next) => {
  try {
    const t = await Timetable.findById(req.params.id)
      .populate("slots.course")
      .populate("slots.teacher")
      .populate("slots.room");
    if (!t) return res.status(404).json({ message: "Not found" });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(t.name.slice(0, 30));
    ws.columns = [
      { header: "Day", key: "day", width: 14 },
      { header: "Start", key: "startTime", width: 10 },
      { header: "End", key: "endTime", width: 10 },
      { header: "Course", key: "course", width: 28 },
      { header: "Teacher", key: "teacher", width: 24 },
      { header: "Room", key: "room", width: 16 },
      { header: "Conflict", key: "conflict", width: 22 },
    ];

    t.slots.forEach((s) => {
      ws.addRow({
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        course: s.course?.name || "",
        teacher: s.teacher?.name || "",
        room: s.room?.name || "",
        conflict: s.hasConflict ? s.conflictReason : "",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${t.name}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
});

router.post("/suggest-slot", async (req, res, next) => {
  try {
    const { courseId, timetableId } = req.body;
    const course = await Course.findById(courseId).populate("teacher").populate("room");
    if (!course) return res.status(404).json({ message: "Course not found" });

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    const tt = timetableId ? await Timetable.findById(timetableId) : null;
    const occupied = tt ? tt.slots : [];

    const suggestions = [];
    const days = settings.workingDays;
    const startH = parseInt(settings.startTime.split(":")[0], 10);
    const endH = parseInt(settings.endTime.split(":")[0], 10);

    for (const day of days) {
      for (let h = startH; h < endH; h++) {
        const start = `${String(h).padStart(2, "0")}:00`;
        const end = `${String(h + 1).padStart(2, "0")}:00`;
        const conflict = occupied.some(
          (s) =>
            s.day === day &&
            ((s.startTime <= start && s.endTime > start) ||
              (s.startTime < end && s.endTime >= end)) &&
            (String(s.teacher) === String(course.teacher?._id) ||
              String(s.room) === String(course.room?._id))
        );
        if (!conflict) suggestions.push({ day, startTime: start, endTime: end });
        if (suggestions.length >= 5) break;
      }
      if (suggestions.length >= 5) break;
    }

    res.json({ suggestions });
  } catch (err) { next(err); }
});

export default router;

import { Router } from "express";
import Course from "../models/Course.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authRequired);

router.get("/", async (_req, res, next) => {
  try {
    const items = await Course.find()
      .populate("department")
      .populate("teacher")
      .populate("room")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const item = await Course.create(req.body);
    const populated = await Course.findById(item._id)
      .populate("department")
      .populate("teacher")
      .populate("room");
    res.json(populated);
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const item = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("department")
      .populate("teacher")
      .populate("room");
    res.json(item);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;

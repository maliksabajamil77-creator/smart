import { Router } from "express";
import Teacher from "../models/Teacher.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authRequired);

router.get("/", async (_req, res, next) => {
  try {
    const items = await Teacher.find().populate("department").sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const item = await Teacher.create(req.body);
    const populated = await Teacher.findById(item._id).populate("department");
    res.json(populated);
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const item = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("department");
    res.json(item);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;

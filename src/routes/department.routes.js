import { Router } from "express";
import Department from "../models/Department.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authRequired);

router.get("/", async (_req, res, next) => {
  try {
    const items = await Department.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const item = await Department.create(req.body);
    res.json(item);
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const item = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;

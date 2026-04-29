import { Router } from "express";
import Settings from "../models/Settings.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authRequired);

router.get("/", async (_req, res, next) => {
  try {
    let s = await Settings.findOne();
    if (!s) s = await Settings.create({});
    res.json(s);
  } catch (err) { next(err); }
});

router.put("/", async (req, res, next) => {
  try {
    let s = await Settings.findOne();
    if (!s) {
      s = await Settings.create(req.body);
    } else {
      Object.assign(s, req.body);
      await s.save();
    }
    res.json(s);
  } catch (err) { next(err); }
});

export default router;

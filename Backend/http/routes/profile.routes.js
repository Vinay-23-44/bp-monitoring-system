import { Router } from "express";
import { editProfile, getProfile } from "../controllers/profile.controller.js";
const router = Router();
router.get("/", getProfile);
router.post("/", editProfile);

export default router;
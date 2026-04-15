import { Router } from "express";
import {
  createConsultationRequest,
  getConsultationRequests,
} from "../controllers/consultation.controller.js";

const router = Router();

router.get("/", getConsultationRequests);
router.post("/", createConsultationRequest);

export default router;
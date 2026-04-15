import express from "express"

import {
 addMedication,
 getUserMedications,
 markMedicationTaken,
  updateMedicationTime,
  deleteMedication
} from "../controllers/medication.controller.js"

const router = express.Router()

router.post("/",  addMedication)

router.get("/",  getUserMedications)

router.post("/taken", markMedicationTaken)

router.put("/:id",  updateMedicationTime)

router.delete("/:id",  deleteMedication)

export default router
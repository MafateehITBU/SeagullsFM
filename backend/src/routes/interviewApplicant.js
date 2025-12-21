import express from "express";
import {
  createInterviewApplicant,
  getAllInterviewApplicants,
  getInterviewApplicantById,
  updateInterviewApplicantStatus,
  deleteInterviewApplicant,
} from "../controllers/interviewApplicantController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/", createInterviewApplicant);

// Protected routes (Admin, SuperAdmin)
router.use(protect);
router.use(authorize("admin", "superadmin"));

router.get("/", getAllInterviewApplicants);
router.get("/:id", getInterviewApplicantById);
router.put("/:id", updateInterviewApplicantStatus);
router.delete("/:id", deleteInterviewApplicant);

export default router;

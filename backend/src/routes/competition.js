import express from "express";
import {
  createCompetition,
  getAllCompetitions,
  getCompetitionDetailsWithSubmissions,
  getCompetitionById,
  updateCompetition,
  addCompetitionSubmission,
  deleteCompetition,
} from "../controllers/competitionController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/:id", getCompetitionById);

// Protected routes
router.use(protect);
router.post("/:id/submission", authorize("user"), addCompetitionSubmission);

// Admin/SuperAdmin routes
router.use(authorize("admin", "superadmin"));
router.post("/", createCompetition);
router.get("/", getAllCompetitions);
router.get("/:id/submissions", getCompetitionDetailsWithSubmissions);
router.put("/:id", updateCompetition);
router.delete("/:id", deleteCompetition);

export default router;

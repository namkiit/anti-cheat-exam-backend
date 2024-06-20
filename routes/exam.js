const express = require("express");
const { check, validationResult } = require("express-validator");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");

const router = express.Router();

const {
  getExamById,
  getExam,
  getAllExams,
  getAssignedExamList,
  createExam,
  updateExam,
  deleteExam,
  findExam,
} = require("../controllers/exam");

const { getStudentByID } = require("../controllers/student");

router.param("studentId", getStudentByID);
router.param("examId", getExamById);

router.get("/:studentId/exam/:examId", isSignedIn, isAuthenticated, getExam);

router.get(
  "/:studentId/assignedExams/all",
  isSignedIn,
  isAuthenticated,
  getAssignedExamList
);

router.get("/exams", getAllExams)
router.get('/exams/:examId/', getExam)

// TODO: Add isAdmin middleware
router.get("/findExam/:searchString", findExam);
router.post("/exam/create", createExam);
router.post("/exam/update", updateExam);
router.delete("/exam/:id", deleteExam);

module.exports = router;

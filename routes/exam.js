const express = require("express");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");

const router = express.Router();

const {
  getExamById,
  getExam,
  getAllExams,
  getAssignedExamList,
  getSubmittedExamList,
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

router.get(
  "/:studentId/submittedExams/all",
  isSignedIn,
  isAuthenticated,
  getSubmittedExamList
);

router.get("/exams", isSignedIn, isAdmin, getAllExams)
router.get('/exams/:examId/', isSignedIn, isAdmin, getExam)
router.get("/findExam/:searchString", isSignedIn, isAdmin, findExam);
router.post("/exam/create", isSignedIn, isAdmin, createExam);
router.post("/exam/update", isSignedIn, isAdmin, updateExam);
router.delete("/exam/:id", isSignedIn, isAdmin, deleteExam);

module.exports = router;

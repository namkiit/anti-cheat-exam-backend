const express = require("express");
const { check, validationResult } = require("express-validator");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");

const router = express.Router();

const { getStudentByID, submitExam, getAllStudents, createStudent, updateStudent, deleteStudent } = require("../controllers/student");

router.param("studentId", getStudentByID);

router.post("/submitExam/:studentId", isSignedIn, isAuthenticated, submitExam);

router.get("/students", getAllStudents);

router.post('/student/create', createStudent);
router.post('/student/update', updateStudent);

router.delete('/student/:id', deleteStudent);

module.exports = router;

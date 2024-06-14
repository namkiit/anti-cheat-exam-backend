const express = require("express");
const { check, validationResult } = require("express-validator");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");

const router = express.Router();

const { getStudentByID, submitExam, getAllStudents, createStudent } = require("../controllers/student");

router.param("studentId", getStudentByID);

router.post("/submitExam/:studentId", isSignedIn, isAuthenticated, submitExam);

router.post('/students/create', createStudent);

router.get("/students", getAllStudents);

module.exports = router;

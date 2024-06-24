const express = require("express");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");

const router = express.Router();

const { getStudentByID, submitExam, getAllStudents, createStudent, updateStudent, deleteStudent, findStudent } = require("../controllers/student");

router.param("studentId", getStudentByID);
router.post("/submitExam/:studentId", isSignedIn, isAuthenticated, submitExam);

router.get("/students", isSignedIn, isAdmin, getAllStudents);
router.get("/findStudent/:searchString", isSignedIn, isAdmin, findStudent);

router.post('/student/create', isSignedIn, isAdmin, createStudent);
router.post('/student/update', isSignedIn, isAdmin, updateStudent);

router.delete('/student/:id', isSignedIn, isAdmin, deleteStudent);

module.exports = router;

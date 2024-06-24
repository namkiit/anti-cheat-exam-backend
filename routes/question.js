const express = require("express");
const { isSignedIn, isAdmin } = require("../controllers/auth");

const router = express.Router();

const { getAllQuestions, createQuestion, updateQuestion, deleteQuestion, findQuestion } = require("../controllers/question");

router.get("/questions", isSignedIn, isAdmin, getAllQuestions);
router.get("/findQuestion/:searchString", isSignedIn, isAdmin, findQuestion);

router.post('/question/create', isSignedIn, isAdmin, createQuestion);
router.post('/question/update', isSignedIn, isAdmin, updateQuestion);

router.delete('/question/:id', isSignedIn, isAdmin, deleteQuestion);

module.exports = router;

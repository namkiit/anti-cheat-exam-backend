const express = require("express");
const { check, validationResult } = require("express-validator");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");

const router = express.Router();

const { getAllQuestions, createQuestion, updateQuestion, deleteQuestion, findQuestion } = require("../controllers/question");

router.get("/questions", getAllQuestions);
router.get("/findQuestion/:searchString", findQuestion);

router.post('/question/create', createQuestion);
router.post('/question/update', updateQuestion);

router.delete('/question/:id', deleteQuestion);

module.exports = router;

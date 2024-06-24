const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  answers: {
    type: Array,
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  }
});

const answeredQuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    trim: true,
    required: true,
  },
  answer: {
    type: String,
    trim: true,
    required: true,
  }
})

const Question = mongoose.model("Question", QuestionSchema);

module.exports = { Question, answeredQuestionSchema };

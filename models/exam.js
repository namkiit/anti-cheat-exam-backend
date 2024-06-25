const mongoose = require("mongoose");
const { answeredQuestionSchema } = require("./question");

const examSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
    maxlength: 16,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "open",
    enum: ["open", "closed"],
  },
  questions: {
    type: Array,
    required: true,
  },
  questionCount: {
    type: Number,
    min: 0,
    default: 0,
  },
});

const assignedExamSchema = new mongoose.Schema({
  examId: {
    type: String,
    trim: true,
    required: true,
  }
}, { _id: false });

const submittedExamSchema = new mongoose.Schema({
  ...assignedExamSchema.obj,
  answers: {
    type: [answeredQuestionSchema],
    required: true,
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
    required: true,
  },
  credibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
    required: true,
  }
}, { _id: false });


const Exam = mongoose.model("Exam", examSchema);

module.exports = { Exam, assignedExamSchema, submittedExamSchema };

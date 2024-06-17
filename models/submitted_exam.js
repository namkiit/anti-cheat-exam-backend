const mongoose = require("mongoose");

const { ObjectId } = mongoose;

const submittedExamSchema = new mongoose.Schema(
  {
    examId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { strict: false }
);

const SubmittedExam = mongoose.model("SubmittedExam", submittedExamSchema);

module.exports = SubmittedExam;

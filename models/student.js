const mongoose = require("mongoose");
const { assignedExamSchema, submittedExamSchema } = require("./exam");

const studentSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
  },
  fname: {
    type: String,
    required: true,
    trim: true,
  },
  lname: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  assignedExams: {
    type: [assignedExamSchema],
    default: [],
  },
  submittedExams: {
    type: [submittedExamSchema],
    default: [],
  },
});

studentSchema.methods = {
  authenticate: function (plainPassword) {
    return plainPassword === this.password;
  },
};

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;

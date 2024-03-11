const { handleError, handleSuccess } = require("../utils/handleResponse");
const Student = require("../models/student");

exports.getStudentByID = (req, res, next, id) => {
  Student.findById(id, (err, student) => {
    if (err || !student) handleError(res, "Student not found!", 400);
    req.student = student;
    next();
  });
};

exports.submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    const studentId = req.student._id;

    // Remove the assigned exam with the matching examId
    await Student.updateOne(
      { _id: studentId },
      { $pull: { assignedExams: { examId: examId } } }
    );

    // Update the submitted exams for the student
    const updatedStudent = await Student.findOneAndUpdate(
      { _id: studentId },
      { $set: { [`submittedExams.${examId}`]: answers } },
      { new: true, runValidators: true }
    );

    res.json(updatedStudent.submittedExams);
  } catch (err) {
    console.error(err);
    handleError(res, "Error submitting Exam!");
  }
};
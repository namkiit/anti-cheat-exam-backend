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

exports.getAllStudents = (req, res) => {
  Student.find()
    .lean()
    .exec((err, students) => {
      if (err) {
        return handleError(res, "DB Error, cannot retrieve students.", 500);
      }

      return res.json(students);
    });
};

exports.createStudent = (req, res) => {
  const { _id, fname, lname, password, assignedExams } = req.body;

  if (!_id || !fname || !password) {
    return handleError(res, "ID, First Name, and Password are required fields.", 400);
  }

  const newStudent = new Student({
    _id,
    fname,
    lname,
    password,
    assignedExams,
    submittedExams: []
  });

  newStudent.save((err, student) => {
    if (err) {
      return handleError(res, "Error creating Student, please try again.", 400);
    }

    return handleSuccess(res, student, "Student created successfully!");
  });
};

exports.updateStudent = (req, res) => {
  const { _id, fname, lname, password, assignedExams } = req.body;

  if (!_id || !fname || !password) {
    return handleError(res, "ID, First Name, and Password are required fields.", 400);
  }

  const updatedData = {
    fname,
    lname,
    password,
    assignedExams
  };

  Student.findByIdAndUpdate(_id, updatedData, { new: true }, (err, student) => {
    if (err) {
      return handleError(res, "Error updating Student, please try again.", 400);
    }

    if (!student) {
      return handleError(res, "Student not found.", 404);
    }

    return handleSuccess(res, student, "Student updated successfully!");
  });
};

exports.deleteStudent = (req, res) => {
  const _id = req.params.id

  if (!_id) {
    return handleError(res, "ID is a required field.", 400);
  }

  Student.findByIdAndDelete(_id, (err, student) => {
    if (err) {
      return handleError(res, "Error deleting Student, please try again.", 400);
    }

    if (!student) {
      return handleError(res, "Student not found.", 404);
    }

    return handleSuccess(res, null, "Student deleted successfully!");
  });
};

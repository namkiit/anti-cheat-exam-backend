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
    const { examId, answers, score, credibilityScore } = req.body;
    const studentId = req.student._id;

    // Remove the assigned exam with the matching examId
    await Student.updateOne(
      { _id: studentId },
      { $pull: { assignedExams: { examId: examId } } }
    );

    // Check if the examId already exists in submittedExams
    const student = await Student.findById(studentId);
    const existingExamIndex = student.submittedExams.findIndex(exam => exam.examId === examId);

    if (existingExamIndex !== -1) {
      // Update existing entry
      student.submittedExams[existingExamIndex].answers = answers;
      student.submittedExams[existingExamIndex].score = score;
      student.submittedExams[existingExamIndex].credibilityScore = credibilityScore;
    } else {
      // Add new entry
      student.submittedExams.push({ examId, answers, score, credibilityScore });
    }

    await student.save();

    res.json(student.submittedExams);
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

  // Check if all exam IDs exist
  Exam.find({ _id: { $in: assignedExams } }, (err, foundExams) => {
    if (err) {
      return handleError(res, "DB Error while checking exams.", 500);
    }
    if (foundExams.length !== assignedExams.length) {
      return handleError(res, "Some exam IDs are invalid.", 400);
    }

    Student.findById(_id, (err, existingStudent) => {
      if (err) {
        return handleError(res, "DB Error while checking existing student.", 500);
      }
      if (existingStudent) {
        return handleError(res, "A student with this ID already exists.", 400);
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
          return handleError(res, "Error creating Student, please try again later.", 500);
        }

        return handleSuccess(res, student, "Student created successfully!");
      });
    });
  });
};

exports.updateStudent = (req, res) => {
  const { _id, fname, lname, password, assignedExams } = req.body;

  if (!_id || !fname || !password) {
    return handleError(res, "ID, First Name, and Password are required fields.", 400);
  }

  const updatedData = { fname, lname, password };

  const updateStudent = () => {
    if (assignedExams && Array.isArray(assignedExams)) {
      updatedData.assignedExams = assignedExams;
    }

    Student.findByIdAndUpdate(_id, updatedData, { new: true }, (err, student) => {
      if (err) {
        return handleError(res, "Error updating Student, please try again later.", 400);
      }

      if (!student) {
        return handleError(res, "Student not found.", 404);
      }

      return handleSuccess(res, student, "Student updated successfully!");
    });
  };

  if (assignedExams && Array.isArray(assignedExams)) {
    Exam.find({ _id: { $in: assignedExams } }, (err, foundExams) => {
      if (err) {
        return handleError(res, "DB Error while checking exams.", 500);
      }
      if (foundExams.length !== assignedExams.length) {
        return handleError(res, "Some exam IDs are invalid.", 400);
      }
      updateStudent();
    });
  } else {
    updateStudent();
  }
};

exports.deleteStudent = (req, res) => {
  const _id = req.params.id

  if (!_id) {
    return handleError(res, "ID is a required field.", 400);
  }

  Student.findByIdAndDelete(_id, (err, student) => {
    if (err) {
      return handleError(res, "Error deleting Student, please try again later.", 400);
    }

    if (!student) {
      return handleError(res, "Student not found.", 404);
    }

    return handleSuccess(res, null, "Student deleted successfully!");
  });
};

exports.findStudent = async (req, res) => {
  try {
    const searchString = req.params.searchString;
    const searchRegex = new RegExp(searchString, 'i'); // Create a case-insensitive regex from the search string

    // Find students by ID or name using the regex
    const students = await Student.find({
      $or: [
        { _id: { $regex: searchRegex } },
        { fname: { $regex: searchRegex } },
        { lname: { $regex: searchRegex } }
      ]
    });

    return handleSuccess(res, students, "Students found successfully!");
  } catch (err) {
    console.error(err);
    return handleError(res, "Error finding Student.", 500);
  }
};

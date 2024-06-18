const { handleError, handleSuccess } = require("../utils/handleResponse");
const Exam = require("../models/exam");

exports.getExamById = (req, res, next, id) => {
  Exam.findById(id, (err, exam) => {
    if (err) return handleError(res, "Database error, please try again!", 400);

    if (!exam) return handleError(res, "Exam does not exist!", 400);

    req.exam = exam;
    next();
  });
};

exports.getAssignedExamList = (req, res) => {
  const assignedExams = req.student.assignedExams;
  const assignedExamIds = assignedExams.map((exam) => exam.examId);

  Exam.find({ _id: { $in: assignedExamIds } })
    .lean()
    .exec((err, exams) => {
      if (err || !exams)
        handleError(res, "DB Error, cannot get assigned Exams.");

      exams.forEach((_, i) => {
        exams[i].questions = null;
        exams[i].answerKeys = null;
        exams[i].status = assignedExams[i].status;
      });

      return res.json({ exams });
    });
};

exports.getExam = (req, res) => {
  if (!req.exam) return handleError(res, "Cannot get Exam, DB Error!", 500);

  const exam = req.exam;
  exam.answerKeys = null;

  return res.json(exam);
};

exports.getAllExams = (req, res) => {
  Exam.find()
    .lean()
    .exec((err, exams) => {
      if (err) {
        return handleError(res, "DB Error, cannot retrieve exams.", 500);
      }

      exams.forEach(exam => {
        exam.answerKeys = null; // Remove answer keys & questions for security reasons
      });

      return res.json(exams);
    });
};

exports.createExam = (req, res) => {
  const { _id, name, startDate, endDate, duration, questions } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return handleError(res, "Questions must be a non-empty array.", 400);
  }

  const newExam = new Exam({
    _id,
    name,
    startDate,
    endDate,
    duration,
    questions,
    questionCount: questions.length
  });

  newExam.save((err, exam) => {
    if (err) {
      return handleError(res, "Failed to create exam, DB Error.", 500);
    }
    return handleSuccess(res, "Exam created successfully!", 201, exam);
  });
};

exports.updateExam = (req, res) => {
  const { id } = req.params;
  const { name, startDate, endDate, duration, questions } = req.body;

  const updateFields = { name, startDate, endDate, duration };
  if (questions && Array.isArray(questions)) {
    updateFields.questions = questions;
    updateFields.questionCount = questions.length;
  }

  Exam.findByIdAndUpdate(id, { $set: updateFields }, { new: true }, (err, exam) => {
    if (err) {
      return handleError(res, "Failed to update exam, DB Error.", 500);
    }
    if (!exam) {
      return handleError(res, "Exam not found.", 404);
    }
    return handleSuccess(res, "Exam updated successfully!", 200, exam);
  });
};


exports.deleteExam = (req, res) => {
  const { id } = req.params;

  Exam.findByIdAndRemove(id, (err, exam) => {
    if (err) {
      return handleError(res, "Failed to delete exam, DB Error.", 500);
    }
    if (!exam) {
      return handleError(res, "Exam not found.", 404);
    }
    return handleSuccess(res, "Exam deleted successfully!", 200, exam);
  });
};


const { handleError, handleSuccess } = require("../utils/handleResponse");
const Exam = require("../models/exam");
const Question = require("../models/question");


exports.getExamById = (req, res, next, id) => {
  Exam.findById(id, (err, exam) => {
    if (err) return handleError(res, "Database error, please try again!", 400);
    if (!exam) return handleError(res, "Exam does not exist!", 400);

    // Use Promise.all to handle asynchronous operations
    Promise.all(exam.questions.map((questionId) => {
      return Question.findById(questionId).then(question => {
        if (!question) {
          throw new Error(`Question with id ${questionId} does not exist!`);
        }
        return question;
      });
    }))
    .then((questions) => {
      // All questions are found, attach the exam to the request object and proceed
      exam.questions = questions;
      req.exam = exam;
      next();
    })
    .catch((err) => {
      // Handle any errors that occurred during the question lookups
      return handleError(res, err.message || "Database error, please try again!", 400);
    });
  });
};

exports.getAssignedExamList = (req, res) => {
  const assignedExams = req.student.assignedExams;
  const assignedExamIds = assignedExams.map((exam) => exam.examId);
  const now = new Date();

  Exam.find({
    _id: { $in: assignedExamIds },
    status: "open"
  })
    .lean()
    .exec((err, exams) => {
      if (err || !exams) return handleError(res, "DB Error, cannot get assigned Exams.", 500);

      exams = exams.filter((exam) => {
        const startDate = new Date(exam.startDate); // Convert startDate string to Date object
        const endDate = new Date(exam.endDate);     // Convert endDate string to Date object

        return startDate && endDate && now >= startDate && now <= endDate;
      });

      exams.forEach((_, i) => {
        exams[i].questions = undefined;
        exams[i].answerKeys = undefined;
        exams[i].status = assignedExams.find((assignedExam) => assignedExam.examId.toString() === exams[i]._id.toString()).status;
      });

      return res.json({ exams });
    });
};

exports.getExam = (req, res) => {
  if (!req.exam) return handleError(res, "Cannot get Exam, DB Error!", 500);

  const exam = req.exam;

  return res.json(exam);
};

exports.getAllExams = (req, res) => {
  Exam.find()
    .lean()
    .exec((err, exams) => {
      if (err) {
        return handleError(res, "DB Error, cannot retrieve exams.", 500);
      }

      return res.json(exams);
    });
};

exports.createExam = (req, res) => {
  const { _id, name, startDate, endDate, duration, status, questions } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return handleError(res, "Questions must be a non-empty array.", 400);
  }

  Exam.findById(_id, (err, existingExam) => {
    if (err) {
      return handleError(res, "DB Error while checking existing exam.", 500);
    }
    if (existingExam) {
      return handleError(res, "An exam with this ID already exists.", 400);
    }

    const newExam = new Exam({
      _id,
      name,
      startDate,
      endDate,
      duration,
      status,
      questions,
      questionCount: questions.length
    });

    newExam.save((err, exam) => {
      if (err) {
        return handleError(res, "Error creating Exam, please try again later.", 500);
      }
      return handleSuccess(res, exam, "Exam created successfully!");
    });
  });
};

exports.updateExam = (req, res) => {
  const { _id, name, startDate, endDate, duration, status, questions } = req.body;

  const updateFields = { name, startDate, endDate, duration, status };
  if (questions && Array.isArray(questions)) {
    updateFields.questions = questions;
    updateFields.questionCount = questions.length;
  }

  Exam.findByIdAndUpdate(_id, { $set: updateFields }, { new: true }, (err, exam) => {
    if (err) {
      return handleError(res, "Failed to update exam, DB Error.", 500);
    }
    if (!exam) {
      return handleError(res, "Exam not found.", 404);
    }
    return handleSuccess(res, exam, "Exam updated successfully!");
  });
};


exports.deleteExam = (req, res) => {
  const _id = req.params.id;

  Exam.findByIdAndRemove(_id, (err, exam) => {
    if (err) {
      return handleError(res, "Failed to delete exam, DB Error.", 500);
    }
    if (!exam) {
      return handleError(res, "Exam not found.", 404);
    }
    return handleSuccess(res, exam, "Exam deleted successfully!");
  });
};

exports.findExam = async (req, res) => {
  try {
    const searchString = req.params.searchString;
    const searchRegex = new RegExp(searchString, 'i'); // Create a case-insensitive regex from the search string

    // Find exams by ID or name using the regex
    const exams = await Exam.find({
      $or: [
        { _id: { $regex: searchRegex } },
        { name: { $regex: searchRegex } }
      ]
    });

    return handleSuccess(res, exams, "Exams found successfully!");
  } catch (err) {
    console.error(err);
    return handleError(res, "Error finding Exam.", 500);
  }
};
const { handleError, handleSuccess } = require("../utils/handleResponse");
const { Exam } = require("../models/exam");
const { Question } = require("../models/question");

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
      // Function to shuffle an array
      function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }

      const shuffledQuestions = shuffleArray(questions);

      // Attach the shuffled questions to the exam and proceed
      exam.questions = shuffledQuestions;
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
        exams[i].status = assignedExams.find((assignedExam) => assignedExam.examId.toString() === exams[i]._id.toString()).status;
      });

      return res.json({ exams });
    });
};

exports.getSubmittedExamList = (req, res) => {
  const submittedExams = req.student.submittedExams;
  const submittedExamIds = submittedExams.map((exam) => exam.examId);

  Exam.find({
    _id: { $in: submittedExamIds },
  })
    .lean()
    .exec((err, exams) => {
      if (err || !exams) return handleError(res, "DB Error, cannot get submitted Exams.", 500);

      const now = new Date();

      const submittedExamList = exams.map((exam) => {
        const submittedExam = submittedExams.find((subExam) => subExam.examId.toString() === exam._id.toString());
        
        // Convert startDate and endDate to Date objects
        const startDate = new Date(exam.startDate);
        const endDate = new Date(exam.endDate);

        return {
          examId: exam._id,
          title: exam.name,
          startDate: startDate,
          endDate: endDate,
          questionCount: exam.questionCount,
          duration: exam.duration,
          score: submittedExam.score,
          credibilityScore: submittedExam.credibilityScore,
        };
      });

      return res.json({ exams: submittedExamList });
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

  // Check if all question IDs exist
  Question.find({ _id: { $in: questions } }, (err, foundQuestions) => {
    if (err) {
      return handleError(res, "DB Error while checking questions.", 500);
    }
    if (foundQuestions.length !== questions.length) {
      return handleError(res, "Some question IDs are invalid.", 400);
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
  });
};

exports.updateExam = (req, res) => {
  const { _id, name, startDate, endDate, duration, status, questions } = req.body;

  const updateFields = { name, startDate, endDate, duration, status };

  const updateExam = () => {
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

  if (questions && Array.isArray(questions)) {
    Question.find({ _id: { $in: questions } }, (err, foundQuestions) => {
      if (err) {
        return handleError(res, "DB Error while checking questions.", 500);
      }
      if (foundQuestions.length !== questions.length) {
        return handleError(res, "Some question IDs are invalid.", 400);
      }
      updateFields.questions = questions;
      updateFields.questionCount = questions.length;
      updateExam();
    });
  } else {
    updateExam();
  }
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
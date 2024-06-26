const { Question } = require("../models/question");
const { handleError, handleSuccess } = require("../utils/handleResponse");

exports.getAllQuestions = (req, res) => {
    Question.find()
        .lean()
        .exec((err, questions) => {
            if (err) {
                return handleError(res, "DB Error, cannot retrieve questions.", 500);
            }

            return res.json(questions);
        });
};

exports.createQuestion = (req, res) => {
    const { _id, title, type, answers, correctAnswer } = req.body;

    if (!_id || !title || !type || !answers || !correctAnswer) {
        return handleError(res, "Not receiving required fields in payload.", 400);
    }

    Question.findById(_id, (err, existingQuestion) => {
        if (err) {
            return handleError(res, "DB Error while checking existing question.", 500);
        }
        if (existingQuestion) {
            return handleError(res, "A question with this ID already exists.", 400);
        }

        const newQuestion = new Question({
            _id,
            title,
            type,
            answers,
            correctAnswer
        });

        newQuestion.save((err, question) => {
            if (err) {
                return handleError(res, "Error creating Question, please try again later.", 500);
            }

            return handleSuccess(res, question, "Question created successfully!");
        });
    });
};

exports.updateQuestion = (req, res) => {
    const { _id, title, type, answers, correctAnswer } = req.body;

    if (!_id || !title || !type || !answers || !correctAnswer) {
        return handleError(res, "Not receiving required fields in payload.", 400);
    }

    const updatedData = {
        _id,
        title,
        type,
        answers,
        correctAnswer
    };

    Question.findByIdAndUpdate(_id, updatedData, { new: true }, (err, question) => {
        if (err) {
            return handleError(res, "Error updating Question, please try again later.", 400);
        }

        if (!question) {
            return handleError(res, "Question not found.", 404);
        }

        return handleSuccess(res, question, "Question updated successfully!");
    });
};

exports.deleteQuestion = (req, res) => {
    const _id = req.params.id

    if (!_id) {
        return handleError(res, "ID is a required field.", 400);
    }

    Question.findByIdAndDelete(_id, (err, question) => {
        if (err) {
            return handleError(res, "Error deleting Question, please try again later.", 400);
        }

        if (!question) {
            return handleError(res, "Question not found.", 404);
        }

        return handleSuccess(res, null, "Question deleted successfully!");
    });
};

exports.findQuestion = async (req, res) => {
    try {
        const searchString = req.params.searchString;
        const searchRegex = new RegExp(searchString, 'i'); // Create a case-insensitive regex from the search string

        // Find questions by ID or title using the regex
        const questions = await Question.find({
            $or: [
                { _id: { $regex: searchRegex } },
                { title: { $regex: searchRegex } }
            ]
        });

        return handleSuccess(res, questions, "Questions found successfully!");
    } catch (err) {
        console.error(err);
        return handleError(res, "Error finding Question.", 500);
    }
};

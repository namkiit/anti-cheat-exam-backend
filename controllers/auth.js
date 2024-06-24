const { handleError } = require("../utils/handleResponse");
const { check, validationResult } = require("express-validator");
const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");
const Student = require("../models/student");
const Admin = require("../models/admin");

exports.login = (req, res) => {
  const errors = validationResult(req);
  const { id, password } = req.body;

  if (!errors.isEmpty()) {
    return res.json({
      err: errors.errors[0].msg,
    });
  }

  Student.findById(id, (err, student) => {
    if (err) return handleError(res, "Database error, please try again!", 400);

    if (!student) return handleError(res, "Student does not exist!", 400);

    if (!student.authenticate(password))
      return handleError(res, "Incorrect username or password!", 401);

    const { _id, fname, lname, assignedExams } = student;

    // TODO: Set expiry to 1d
    const token = jwt.sign({ id: _id }, process.env.JWT_SECRET, {
      algorithm: "HS256",
    });

    return res.json({ id: _id, fname, lname, assignedExams, token });
  });
};

exports.isSignedIn = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});

exports.isAuthenticated = (req, res, next) => {
  // Consistent "id"

  const isAuthenticated =
    req.student && req.auth && req.student._id === req.auth.id;

  if (!isAuthenticated) {
    return handleError(res, "Access denied, please login!", 403);
  }

  next();
};

exports.loginAdmin = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.json({
      err: errors.errors[0].msg,
    });
  }

  Admin.findOne({ email }, (err, admin) => {
    if (err) {
      console.log('database error')
      return handleError(res, "Database error, please try again!", 400);
    } 

    if (!admin) {
      console.log('Admin does not exist')
      return handleError(res, "Admin does not exist!", 400);
    } 

    if (!admin.authenticate(password)) {
      console.log('Incorrect username or password')
      return handleError(res, "Incorrect username or password!", 401);
    }

    const { _id, name, email } = admin;

    // TODO: Set expiry to 1d
    const token = jwt.sign({ id: _id }, process.env.JWT_SECRET, {
      algorithm: "HS256",
    });

    return res.json({ id: _id, name, email, token });
  });
};

exports.isAdmin = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.id) {
      return handleError(res, "Access denied, please login with admin account!", 403);
    }

    const admin = await Admin.findById(req.auth.id);

    if (!admin) {
      return handleError(res, "Access denied, please login with admin account!", 403);
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error(err);
    return handleError(res, "Server error", 500);
  }
};
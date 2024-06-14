const express = require("express");
const { check, validationResult } = require("express-validator");

const router = express.Router();

const { login, loginAdmin } = require("../controllers/auth");

router.post("/login", login);
router.post("/dashboard/login", loginAdmin);

module.exports = router;

const express = require("express");

const router = express.Router();

const { login, loginAdmin } = require("../controllers/auth");

router.post("/login", login);
router.post("/loginAdmin", loginAdmin);

module.exports = router;

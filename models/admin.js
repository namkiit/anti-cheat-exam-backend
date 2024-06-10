const mongoose = require("mongoose");

// const { ObjectId } = mongoose;

const adminSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
  },
  fname: {
    type: String,
    required: true,
    maxlength: 32,
    trim: true,
  },
  lname: {
    type: String,
    maxlength: 32,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  }
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

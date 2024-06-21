const mongoose = require("mongoose");

// const { ObjectId } = mongoose;

const adminSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
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

adminSchema.methods = {
  authenticate: function (plainPassword) {
    return plainPassword === this.password;
  },
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "You need email to register"],
    unique: true,
  },
  role: {
    type: String,
    default: "customer",
  },
  firstName: String,
  lastName: String,
  phone: Number,
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);

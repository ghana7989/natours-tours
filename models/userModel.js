const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Email is compulsory"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please Provide a valid email address"]
  },
  role: {
    type: String,
    enum: { values: ["user", "guide", "lead-guide", "admin"] },
    default: "user"
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This will only work on CREATE and on SAVE !!
      // This validation will only work initially will not work when
      // user updates password or so.
      validator: function (el) {
        return this.password === el;
      },
      message: "Passwords Don't match make sure you have entered the same password as above.😊"
    }
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next()

  this.passwordChangedAt = Date.now() - 1000;
  next()
})

userSchema.pre("save", async function (next) {

  if (!this.isModified("password")) return next();

  // hashing the password
  const saltingConst = 14;
  this.password = await bcrypt.hash(this.password, saltingConst);
  this.passwordConfirm = undefined;

  next();
})

// QueryMiddleware
userSchema.pre(/^find/, function (next) {
  // this points to query
  this.find({ active: { $ne: false } })
  next()
})


userSchema.methods.correctPassword = async function (postedPassword, userPassword) {
  return await bcrypt.compare(postedPassword, userPassword);
}
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {

  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return JWTTimestamp < changedTimestamp
  }
  return false
}
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;
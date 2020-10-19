const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs")

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
    photo: {
        type: String,
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
    }
});

userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) return next();

    // hashing the password
    const saltingConst = 14;
    this.password = await bcrypt.hash(this.password, saltingConst);
    this.passwordConfirm = undefined;

    next();
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

const User = mongoose.model("User", userSchema);

module.exports = User;
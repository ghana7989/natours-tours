const { promisify } = require('util')
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require("./../utils/appErrors");
const sendEmail = require('../utils/email');

const signToken = id => {
    return jwt.sign(
        {
            id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
}

exports.signUp = catchAsync(
    async (req, res, next) => {
        const newUser = await User.create(
            {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                passwordConfirm: req.body.passwordConfirm,
                role: req.body.role,
            }
        );
        const token = signToken(newUser._id)
        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: newUser
            }
        })
    }
);

exports.login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError("Please provide email and password"), 400);
    }
    const user = await User.findOne({ email }).select("+password")
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError("Incorrect email or password"), 401)
    }
    const token = signToken(user._id)
    res.status(200).json({
        status: "success",
        token
    })
})

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
    }
    if (!token) return next(new AppError("You are not logged in! Please log in first to get access", 401))

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // console.log(decoded)
    const freshUser = await User.findById(decoded.id)
    // check if the user deleted account before the expiration of token
    if (!freshUser) {
        return next(new AppError("The User Belonging to the current token doesnt exist", 401))
    }
    // Check If user changed password after the token is issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError("User recently changed password. Please Login again", 401))
    }
    // Granting permission to the next step i.e to Protected Route
    req.user = freshUser;
    next()
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is an array ["admin","lead-guide"]
        if (!roles.includes(req.user.role)) return next(new AppError("You Don't have permission to access this route", 403))

        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // Get user based on posted email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError(`There is no user with that email address`, 404))
    }
    // Generate a random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false })
    // send it back as an email
    // const resetUrl = 
})
exports.resetPassword = (req, res, next) => {

}
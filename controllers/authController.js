const crypto = require('crypto')
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
const createSendToken = (user, statusCode, res, shouldSendUserData = false) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  }
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions)
  // To not show password in the body of the response
  user.password = "Lol I can't Show Password Here 😁"
  if (shouldSendUserData) {
    res.status(statusCode).json({
      status: "success",
      token,
      data: {
        user
      }
    })
  } else {
    res.status(statusCode).json({
      status: "success",
      token
    })
  }
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
    createSendToken(newUser, 201, res, true)
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
  createSendToken(user, 200, res)
})


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ["admin","lead-guide"]
    if (!roles.includes(req.user.role)) return next(new AppError("You Don't have permission to access this route", 403))

    next();
  }
}


exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }
  if (!token) return next(new AppError("You are not logged in! Please log in first to get access", 401))

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  // console.log(decoded)
  const freshUser = await User.findById(decoded.id)
  // check if the user deleted account before the expiration of token
  if (!freshUser) {
    return next(new AppError("The User Belonging to the current token doesn't exist", 401))
  }
  // Check If user changed password after the token is issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed password. Please Login again", 401))
  }
  // Granting permission to the next step i.e to Protected Route
  req.user = freshUser;
  next()
});


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
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit your new credentials here ${resetUrl}.\n
                  If you didn't asked for reset password simply ignore this email.
  `
  try {
    sendEmail({
      email: user.email,
      subject: "Your Password Reset Token (valid for 10 mins ONLY)",
      message
    })

    res.status(200).json({
      status: "success",
      message: "Token Sent to email!"
    })
  }
  catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save({ validateBeforeSave: false })

    return next(new AppError("There was an error sending email.Try again later", 500))
  }
})
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token

  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })

  // If token not expired and there is a user, set the new password

  if (!user) return next(new AppError("Token is either invalid or expired", 400))
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()
  // Update the changedPasswordAt property for the current user
  // Did that changedPasswordAt property in userModal as a middleware that runs on
  // Log in the user
  createSendToken(user, 200, res)

})

exports.updatePassword = catchAsync(async (req, res, next) => {

  // 1. Get the user from the collection
  const user = await User.findById(req.user.id).select("+password")
  console.log(user)
  // 2. If the posted password is correct
  if (req.body.password === ""
    || req.body.passwordConfirm === ""
    || req.body.passwordCurrent === ""
    || !(await user.correctPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError("Your current password is wrong", 401))
  }
  // 3. If so, Update the Password
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()
  // 4. Log in the user, send JWT
  createSendToken(user, 200, res)
})

// Only For Rendered Pages, no errors
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    const currentUser = await User.findById(decoded.id)
    // check if the user deleted account before the expiration of token
    if (!currentUser) {
      return next()
    }
    // Check If user changed password after the token is issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next()
    }
    // There is a logged in user
    res.locals.user = currentUser
    return next();
  }
  next()
});

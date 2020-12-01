const AppErrors = require("../utils/appErrors")

const handleJWTError = () => new AppErrors("Invalid token, Try Loging in again", 401);
const handleJWTExpiredError = () => new AppErrors("Login Session Expired Please Login again", 401)

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppErrors(message, 400)
}
const handleDuplicateErrorDB = ({ message }) => {
  const value = message.match(/(['"])((\\\1|.)*?)\1/gm);
  const message1 = `Duplicate Field found value:${value} , Please use another value`
  return new AppErrors(message1, 400)
}
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `The updating failed because of ${errors.join(". ")}`
  return new AppErrors(message, 400)
}
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    })
  }
  console.error("ERROR 🤷‍♂️ -> ", err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  })
}
const sendErrorProd = (err, req, res) => {
  // API errors
  if (req.originalUrl.startsWith("/api")) {
    // These are trusted errors and expected errors
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      })
    }
    // These are programming errors and some unknown errors.We don't wanna leak error details to the client
    // 1) Log the error
    console.error("ERROR 🤷‍♂️ -> ", err);
    // 2) Send a generic message
    return res.status(500).json({
      status: "error",
      message: "Something went really wrong from OUR side! Please be patient till we fix it."
    })
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    })
  }
  // These are programming errors and some unknown errors.We don't wanna leak error details to the client
  // 1) Log the error
  console.error("(errorController.js)ERROR -> ", err);
  // 2) Send a generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please Try Again Later'
  })
}
module.exports = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";


  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  }

  else if (process.env.NODE_ENV === "production") {
    let error = { ...err }
    error.message = err.message
    if (error.kind === "ObjectId") {
      error = handleCastErrorDB(error)
    }
    else if (error.code === 11000) {
      error = handleDuplicateErrorDB(err)
    } else if (error._message === "Validation failed") {
      error = handleValidationErrorDB(err)
    }
    else if (error.name === "JsonWebTokenError") error = handleJWTError()
    else if (error.name === "TokenExpiredError") error = handleJWTExpiredError()
    sendErrorProd(error, req, res);

  }
}
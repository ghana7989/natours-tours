const AppErrors = require("../utils/appErrors")

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
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err,
    })
}
const sendErrorProd = (err, res) => {
    // These are trusted errors and expected errors
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }
    // These are programming errrors and some unknown errors.We don't wanna leak error details to the client
    else {
        // 1) Log the error
        console.error("ERROR 🤷‍♂️ -> ", err);
        // 2) Send a generic message
        res.status(500).json({
            status: "error",
            message: "Something went really wrong from OUR side! Please be patient till we fix it."
        })
    }
}
module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    }

    else if (process.env.NODE_ENV === "production") {
        let error = { ...err }
        if (error.kind === "ObjectId") {
            error = handleCastErrorDB(error)
        }
        else if (error.code === 11000) {
            error = handleDuplicateErrorDB(err)
        } else if (error._message === "Validation failed") {
            error = handleValidationErrorDB(err)
        }
        sendErrorProd(error, res);
    }
}
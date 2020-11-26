const path = require("path");
const express = require('express')
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp');

const AppError = require("./utils/appErrors")
const globalErrorHandler = require("./controllers/errorController")
const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")
const reviewRouter = require("./routes/reviewRoutes")

const app = express()

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))

// Serving some static files
app.use(express.static(path.join(__dirname, "public")))
// Global Middle Wares

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Set Security HTTP headers
app.use(helmet())

// Limiting heavy traffic in short span from the same client end point
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP please try again after an hour!"
});
app.use("/api", limiter);

// This is body parser reading data from body to req.body
app.use(express.json({ limit: "10kb" }));

// Data Sanitization against noSQL query injection or poisoning
app.use(mongoSanitize());

// Data Sanitization against XSS (cross site scripting attack)
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp({
  whitelist: [
    "duration",
    "ratingsQuantity",
    "ratingsAverage",
    "maxGroupSize",
    "difficulty",
    "price"
  ]
}))


// Test Middleware
app.use((req, res, next) => {
  req.reqTime = new Date().getMilliseconds()
  next()
})

// Routes
app.get("/overview", (req, res) => {
  res.status(200).render('overview', {
    title: 'All Tours'
  })
});

app.get("/tour", (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker'
  })
});


app.use("/api/v1/tours", tourRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/reviews", reviewRouter)

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this Server 😥`, 404))
})

app.use(globalErrorHandler);


module.exports = app;

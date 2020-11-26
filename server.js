const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({
  path: "./config.env"
})
process.on("uncaughtException", err => {
  console.log("uncaughtException! shutting down the server...")
  console.log(err.name, err.message)
  process.exit(1)
})

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(() => console.log("DB connection successful!"))

const app = require("./app")


const port = process.env.PORT || 8000
const server = app.listen(
  port,
  () => console.log(`Naturos app listening on port 3000!`)
)

// Event listener on unHandledRejection

// process.on("unhandledRejection", err => {
//     console.log("Error ->", err.message)
//     console.log("Shutting down server...")
//     server.close(() => {
//         console.log("Shutting down server: Successful")
//         process.exit(1)
//     })
// })


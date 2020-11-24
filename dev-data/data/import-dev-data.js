const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require("../../models/tourModel")
const Review = require("../../models/reviewModel")
const User = require("../../models/userModel")

dotenv.config({ path: `${__dirname}/../../config.env` })
console.log(process.env)
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).then(() => console.log("DB Connection Established"));

// Read JSON
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"))
// Import Data into Database
const importData = async () => {
  try {

    await Tour.create(tours)
    await User.create(users,{validateBeforeSave: false})
    await Review.create(reviews)
    console.log("Data successfully Loaded");
  } catch (error) {
    console.log(error);
  }
  process.exit()

}
// Delete all Data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data Deleted Successfully");
  } catch (error) {
    console.log(error);
  }
  process.exit()

}
if (process.argv[2] === "--import") {
  importData()
} else if (process.argv[2] === "--delete") {
  deleteData()
}
console.log(process.argv);
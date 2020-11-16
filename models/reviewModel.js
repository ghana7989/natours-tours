const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Review can't be empty"]
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour:
  {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "Review must belong to a tour"]
  },
  user:
  {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user"]
  }
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

const Review = mongoose.model("Review", reviewSchema)

module.exports = Review
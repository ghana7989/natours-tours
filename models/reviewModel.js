const Tour = require("../models/tourModel")
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

reviewSchema.pre(/^find/, function (next) {

  // this.populate({
  //   path: "tour",
  //   select: "name"
  // }).populate({
  //   path: "user",
  //   select: "name photo"
  // })
  this.populate({
    path: "user",
    select: "name photo"
  })

  next()
})

reviewSchema.statics.calculateAverageRatings = async function (tourId) {
  // Here this keyword refers to the Model as This is a static function on Review Model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].nRatings,
      ratingsQuantity: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 3
    });

  }
}

reviewSchema.post("save", function () {
  // this here points to current review

  this.constructor.calculateAverageRatings(this.tour)
})
reviewSchema.post(/^findOneAnd/, async function (reviewDoc, next) {
  await reviewDoc.constructor.calcAverageRating(reviewDoc.tour);
  next();
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

const Review = mongoose.model("Review", reviewSchema)

module.exports = Review
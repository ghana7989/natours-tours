const mongoose = require('mongoose');
var slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A Tour must have a name"],
    unique: true,
    trim: true,
    maxlength: [30, "A Tour must have a name of less than 30 characters"],
    minlength: [10, "A Tour must have a name of less than 10 characters"],
    validate: {
      validator: function (val) {
        return validator.isAlpha(val.replace(/ /g, ""))
      },
      message: "Tour Name must not contain Numbers or special characters"
    }
  },
  duration: {
    type: Number,
    required: [true, "A Tour must have a Duration"]
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A Tour must have a Group Size"]
  },
  difficulty: {
    type: String,
    required: [true, "A Tour must have a Difficulty Mentioned"],
    enum: {
      values: ["easy", "medium", "difficult"],
      message: "Difficulty is either easy or medium or difficult"
    }
  },
  ratingsAverage: {
    type: Number,
    default: 3,
    min: [1, "Ratings must be greater than 1.0"],
    max: [5, "Ratings must be lesser than 5.0"],
    set: value => Math.round(value * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, "A Tour must have a price"],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price
      },
      message: "Discount price ({VAL}) should be less than original price"
    }


  },
  summary: {
    type: String,
    trim: true,
    required: [true, "Summary is needed"]
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, "A Tour must have a Cover Image"]
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: "Point",
      enum: ["Point"]
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User"
    }
  ]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

toursSchema.index({ price: 1, ratingsAverage: -1 })
toursSchema.index({ slug: 1 })
toursSchema.index({ startLocation: "2dsphere" })

toursSchema.virtual("tourDurationInWeeks").get(function () {
  return (this.duration / 7).toFixed(2)
})

// Virtual Populate
toursSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id"
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create() only
toursSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})
// toursSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id))
//   const guides = await Promise.all(guides_promises)
//   next()
// })
// This Document Middleware will run after all the pre middlewares ran
// toursSchema.post("save", function (doc, next) {
//     console.log(doc);
//     next()
// })

// QUERY MIDDLEWARE

toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } })
  this.start = Date.now()
  next();
});
toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt"
  })
  next()
})
toursSchema.post(/^find/, function (docs, next) {
  console.log(`Query Took ${Date.now() - this.start} milliseconds`);
  next();
})
// AGGREGATION MIDDLEWARE
// toursSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//   next()
// })
toursSchema.post("aggregate", function (doc, next) {
  console.log(doc);
  next()
})
const Tour = mongoose.model("Tour", toursSchema)

module.exports = Tour
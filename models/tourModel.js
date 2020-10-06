const mongoose = require('mongoose');
var slugify = require('slugify')

const toursSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A Tour must have a name"],
        unique: true,
        trim: true
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
        required: [true, "A Tour must have a Difficulty Mentioned"]
    },
    ratingsAverage: {
        type: Number,
        default: 3,
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

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
toursSchema.virtual("tourDurationInWeeks").get(function () {
    return (this.duration / 7).toFixed(2)
})
// DOCUMENT MIDDLEWARE: runs before .save() and .create() only
toursSchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
}) 
// This Document Middleware will run after all the pre middlewares ran
// toursSchema.post("save", function (doc, next) {
//     console.log(doc);
//     next()
// })
const Tour = mongoose.model("Tour", toursSchema)

module.exports = Tour
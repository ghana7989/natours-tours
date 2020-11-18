const Tour = require("../models/tourModel")
const APIFeatures = require("../utils/apiFeatures")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appErrors")

exports.aliasTopFiveTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = "-ratingsAverage price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty,duration";
  next();
}

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
  const tours = await features.query;
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours
    }
  })
}
)
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate({
    path: "reviews",
    select: "-__v"
  })
  res.status(200).json({
    status: "success",
    data: {
      tour
    }
  })
}
)

exports.createTour = catchAsync(async (req, res, next) => {

  const newTour = await Tour.create(req.body)
  res.status(201).json({
    status: "success",
    data: {
      tour: newTour
    }
  })
})
exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  if (!tour) {
    return next(new AppError("No tour found with that ID to update.Try checking the ID and try again", 404))
  }
  res.status(200).json({
    status: "success",
    data: updatedTour
  })

}
)
exports.deleteTour = catchAsync(async (req, res, next) => {
  const deletedTour = await Tour.findByIdAndDelete(req.params.id)
  if (!deletedTour) {
    return next(new AppError("No tour found with that ID to delete.Do you want to remove a tour which didn't even exist", 404))
  }
  res.status(204).json({
    status: "success",
    data: null
  })


}
)
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numOfRatins: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" }
      }
    },
    {
      $sort: { avgPrice: 1 }
    },
    // {
    //     $match: {
    //         _id: { $ne: "easy" }
    //     }
    // }
  ])

  res.status(200).json({
    status: "success",
    stats: stats
  })
}
)
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates"
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-1-1`),
          $lt: new Date(`${year + 1}-1-1`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numberOfTourStarts: { $sum: 1 },
        tours: { $push: "$name" }
      }
    },
    {
      $addFields: {
        month: "$_id",
      }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numberOfTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ])

  res.status(200).json({
    status: "success",
    totalResults: plan.length,
    plan
  })
})
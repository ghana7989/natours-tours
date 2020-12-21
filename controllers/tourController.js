const multer = require('multer')
const sharp = require('sharp')
const Tour = require("../models/tourModel")
const catchAsync = require("../utils/catchAsync")
const factory = require("./handlerFactory")
const AppError = require("./../utils/appErrors")


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new AppError('Not an Image! Please upload only images', 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
])
exports.resizeTourImages = (req, res, next) => {
  next()
} 
exports.aliasTopFiveTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = "-ratingsAverage price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty,duration";
  next();
}

exports.getAllTours = factory.getAll(Tour)

exports.getTour = factory.getOne(Tour, { path: "reviews", select: "-__v" })
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)

// Upgraded to handlerFactory

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   })
//   if (!tour) {
//     return next(new AppError("No tour found with that ID to update.Try checking the ID and try again", 404))
//   }
//   res.status(200).json({
//     status: "success",
//     data: updatedTour
//   })

// }
// )

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const deletedTour = await Tour.findByIdAndDelete(req.params.id)
//   if (!deletedTour) {
//     return next(new AppError("No tour found with that ID to delete.Do you want to remove a tour which didn't even exist", 404))
//   }
//   res.status(204).json({
//     status: "success",
//     data: null
//   })


// }
// )



exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numOfRatings: { $sum: "$ratingsQuantity" },
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
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  if (unit !== "mi" || unit !== "km") return next(new AppError("units should be in km or mi format"))

  const radius = unit === "mi" ? distance / 3958.8 : distance / 6378.1;

  if (!lat || !lng) return next(new AppError("Please provide latitude and longitude in the format lat,lng", 400))

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  })


  res.status(200).json({
    status: "success",
    results: tours.length,
    data: { data: tours }
  })

});

exports.getDistances = catchAsync(async (req, res, next) => {

  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",")
  if (!lat || !lng) return next(new AppError("Please provide latitude and longitude in the format lat,lng", 400));

  const multiplier = unit === "mi" ? 0.000621372 : 0.0001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)]
        },
        distanceField: "distance",
        distanceMultiplier: multiplier
      },
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ])
  res.status(200).json({
    status: "success",
    data: { data: distances }
  })
})
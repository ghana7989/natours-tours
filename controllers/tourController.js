const Tour = require("../models/tourModel")
const APIFeatures = require("../utils/apiFeatures")
exports.aliasTopFiveTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = "-ratingsAverage price";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty";
    next();
}

exports.getAllTours = async (req, res) => {
    try {
        // Executing a query
        const features = new APIFeatures(Tour, req.query).filter().sort().limitFields().paginate()
        const tours = await features.query;
        res.status(200).json({
            status: "success",
            results: tours.length,
            data: {
                tours
            }
        })

    } catch (e) {
        res.status(404).json({
            status: "failed",
            message: e.message
        })
    }
}
exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        })

    } catch (e) {
        res.status(404), json({
            status: "failed",
            message: e.message
        })
    }
}
exports.createTour = async (req, res) => {
    try {

        const newTour = await Tour.create(req.body)
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err.message
        })
    }

}
exports.updateTour = async (req, res) => {
    try {
        const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({
            status: "success",
            data: updatedTour
        })

    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err.message
        })
    }
}
exports.deleteTour = async (req, res) => {
    try {
        const deletedTour = await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: "success",
            data: null
        })

    } catch (error) {
        res.status(404).json({
            status: "failed",
            message: error.message
        })
    }
}
exports.getTourStats = async (req, res) => {
    try {
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
            status: "succes",
            stats: stats
        })
    } catch (e) {
        res.status(404).json({
            status: "failed",
            message: e.message
        })
    }
}
exports.getMonthlyPlan = async (req, res) => {
    try {
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
    } catch (e) {
        res.status(404).json({
            status: "failed",
            message: e.message
        })
    }
}
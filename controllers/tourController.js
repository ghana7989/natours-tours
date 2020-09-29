const fs = require("fs")

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

exports.checkId = (req, res, next, val) => {
    if (+val > tours.length) {
        return res.status(400).json({
            status: "fail",
            message: "Inavlid tour id"
        })
    }
    next()
}
exports.checkBody = (req, res, next) => {
    if (req.body.name === null || req.body.price === null) {
        return res.status(400).json({
            status: "Failed",
            message: "Required Data is missing"
        })
    }
    next()
}
exports.getAllTours = (req, res) => {

    res.status(200).json({
        status: "success",
        requestedAt: req.reqTime,
        results: tours.length,
        data: {
            tours
        }
    })
}
exports.getTour = (req, res) => {
    console.log(req.params);
    const tour = tours.find(tour => tour.id === +req.params.id)

    res.status(200).json({
        status: "success",
        data: {
            tour
        }
    })
}
exports.createTour = (req, res) => {

    const newId = tours[tours.length - 1].id + 1
    const newTour = { ...req.body, id: newId }
    tours.push(newTour)
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        })
    })
}
exports.updateTour = (req, res) => {
    res.status(200).json({
        status: "success",
        data: "<Update Tour Here...>"
    })
}
exports.deleteTour = (req, res) => {

    res.status(204).json({
        status: "success",
        data: null
    })
}

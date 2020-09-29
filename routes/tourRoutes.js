const express = require('express');
const tourController = require("./../controllers/tourController")

const router = express.Router();

const { getAllTours, createTour, getTour, updateTour, deleteTour, checkId, checkBody } = tourController


router.param("id", checkId)
router.route("/").get(getAllTours).post(checkBody, createTour)
router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour)

module.exports = router
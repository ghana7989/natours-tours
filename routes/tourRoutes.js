const express = require('express');
const tourController = require("./../controllers/tourController")
const authController = require("./../controllers/authController")
const router = express.Router();

const { getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopFiveTours, getTourStats, getMonthlyPlan } = tourController;
const { protect, restrictTo } = authController

router.route("/top-5-cheap").get(aliasTopFiveTours, getAllTours)
router.route("/tour-stats").get(getTourStats)
router.route("/monthly-plan/:year").get(getMonthlyPlan)
router.route("/").get(protect, getAllTours).post(createTour)
router.route("/:id").get(getTour).patch(updateTour).delete(protect,restrictTo("admin","lead-guide"),deleteTour)

module.exports = router
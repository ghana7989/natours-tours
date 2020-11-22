const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController')

const router = express.Router({ mergeParams: true });

const { getAllReviews, getReview, createReview, deleteReview, updateReview, setTourUserIds } = reviewController
const { protect, restrictTo } = authController

router.route('/').get(getAllReviews).
  post(
    protect,
    restrictTo("user"),
    setTourUserIds,
    createReview
  )
router.route("/:id").get(getReview).delete(deleteReview).patch(updateReview)


module.exports = router

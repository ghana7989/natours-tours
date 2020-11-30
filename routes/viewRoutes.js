const express = require('express');
const { getLoginForm, getOverview, getTour } = require('../controllers/viewsController')
const authController = require("../controllers/authController")
const router = express.Router()

router.use(authController.isLoggedIn)

// Routes
router.get("/", getOverview);

router.get("/tour/:slug", getTour);

router.get("/login", getLoginForm)


module.exports = router;
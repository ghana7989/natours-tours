const express = require('express');
const { getLoginForm, getOverview, getTour, getAccount } = require('../controllers/viewsController')
const authController = require("../controllers/authController")
const router = express.Router()


// Routes
router.get('/me', authController.protect, getAccount)

// Check is Logged in 
router.use(authController.isLoggedIn)

router.get("/", getOverview);

router.get("/tour/:slug", getTour);

router.get("/login", getLoginForm)



module.exports = router;
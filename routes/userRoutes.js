const express = require('express');
const userController = require("./../controllers/userController")
const authController = require("./../controllers/authController")

const router = express.Router();
const { getAllUsers, createUser, getUser, getMe, updateUser, deleteUser, updateMe, deleteMe } = userController;
const { signUp, login, forgotPassword, resetPassword, updatePassword, protect, restrictTo } = authController;

router.post("/signup", signUp)
router.post("/login", login)
router.post("/forgotPassword", forgotPassword)
router.patch("/resetPassword/:token", resetPassword)

// Protect all routes after this middleware
router.use(protect)

router.patch("/updateMyPassword", updatePassword)
router.get("/me", getMe, getUser)
router.patch("/updateMe", updateMe)
router.delete("/deleteMe", deleteMe)

// CAUTION these routes only have admin access
router.use(restrictTo("admin"))
router.route("/").get(getAllUsers).post(createUser)
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser)


module.exports = router;
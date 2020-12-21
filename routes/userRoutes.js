const express = require('express');
const userController = require("./../controllers/userController")
const authController = require("./../controllers/authController")



const router = express.Router();
const { getAllUsers, createUser, getUser, getMe, updateUser, deleteUser, updateMe, deleteMe, userPhotoUpload, resizeUserPhoto } = userController;
const { signUp, login, logout, forgotPassword, resetPassword, updatePassword, protect, restrictTo } = authController;

router.post("/signup", signUp)
router.post("/login", login)
router.get("/logout", logout)
router.post("/forgotPassword", forgotPassword)
router.patch("/resetPassword/:token", resetPassword)

router.patch("/updateMyPassword", protect, updatePassword)
router.get("/me", protect, getMe, getUser)
router.patch("/updateMe", protect, userPhotoUpload, resizeUserPhoto, updateMe)
router.delete("/deleteMe", protect, deleteMe)

// Protect all routes after this middleware
router.use(protect)

// CAUTION these routes only have admin access
router.use(restrictTo("admin"))
router.route("/").get(getAllUsers).post(createUser)
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser)


module.exports = router;
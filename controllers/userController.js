const multer = require('multer')
const sharp = require('sharp')
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/appErrors");
// const authController = require('./../controllers/authController');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`)
//   }
// })

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
})
exports.userPhotoUpload = upload.single('photo')

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toFile(`public/img/users/${req.file.filename}`)
  next()
}

const factory = require("./handlerFactory")

function filterObj(obj, ...allowedFields) {
  const newObj = {}
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el]
    }
  })
  return newObj
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next()
}
exports.updateMe = catchAsync(async (req, res, next) => {

  // 1. Create an error if the user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates use /updateMyPassword", 401))
  }
  // filtered body for acquiring required fields only     
  const filteredBody = filterObj(req.body, "name", "email")
  if (req.file) filteredBody.photo = req.file.filename
  // 3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  })
  res.status(200).json({
    status: "success",
    data: { user: updatedUser }
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {

  await User.findByIdAndUpdate(req.user.id, { active: false })
  res.send(204).json({
    status: "success",
    data: null
  })
})


// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: "Error",
//     message: "This is route is under construction"
//   })
// }

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This is route is under construction. use /signup"
  })
}
exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
exports.deleteUser = factory.deleteOne(User)
// Don't update passwords with below route
exports.updateUser = factory.updateOne(User)

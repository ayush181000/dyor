const router = require('express').Router();

const {
  protect,
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  myProfile,
  userCount,
} = require("../controllers/authController");


router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updatePassword);
router.get('/profile', protect, myProfile);
router.get('/userCheck', userCount);

module.exports = router;
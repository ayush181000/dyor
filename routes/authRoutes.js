const router = require('express').Router();

const { signup } = require("../controllers/authController");

router.post('/signup', signup);
// router.post('/login', login);

module.exports = router;
const router = require('express').Router();

const { protect } = require("../controllers/authController");
const { homepage, dashboard } = require("../controllers/dataController");

router.get('/homepage', homepage);
router.get('/dashboard', dashboard);

module.exports = router;
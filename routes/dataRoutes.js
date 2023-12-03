const router = require('express').Router();

const { protect } = require("../controllers/authController");
const { homepage, dashboard } = require("../controllers/dataController");
const { topApi } = require("../controllers/topApiController");

router.get('/homepage', homepage);
router.get('/dashboard', dashboard);
router.get('/top', topApi);

module.exports = router;
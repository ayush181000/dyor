const router = require('express').Router();

const { protect } = require("../controllers/authController");
const { homepage, dashboard, charts } = require("../controllers/dataController");
const { topApi, topApi1 } = require("../controllers/topApiController");

router.get('/homepage', homepage);
router.get('/dashboard', dashboard);
router.get('/top', topApi);
router.get('/top1', topApi1);
router.get('/charts', charts);

module.exports = router;
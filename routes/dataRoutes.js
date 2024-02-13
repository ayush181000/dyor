const router = require('express').Router();

const { protect } = require("../controllers/authController");
const { homepage, dashboard, charts } = require("../controllers/dataController");
const { topApi, topApi1 } = require("../controllers/topApiController");

router.get('/homepage', protect, homepage);
router.get('/dashboard',protect, dashboard);
router.get('/top',protect, topApi1);
// router.get('/top1', topApi1);
router.get('/charts',protect, charts);
// router.get('/test' , (req , res)=>{res.send("hi")} );

module.exports = router;
const router = require('express').Router();

const { homepage } = require("../controllers/dataController");

router.get('/homepage', homepage);

module.exports = router;
const router = require('express').Router();

const { getData } = require("../controllers/dataController");

router.get('/getData', getData);

module.exports = router;
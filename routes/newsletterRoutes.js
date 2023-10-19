const router = require('express').Router();

const { subscribeNewsletter, unsubscribeNewsletter } = require("../controllers/newsletterController");

router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

module.exports = router;
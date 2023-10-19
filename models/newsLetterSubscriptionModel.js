const mongoose = require('mongoose');

const newsletterSubscriptionSchema = mongoose.Schema({
    email: { type: String, unique: true }
});

const NewsletterSubscription = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);

module.exports = NewsletterSubscription;
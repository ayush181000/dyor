const NewsletterSubscription = require('../models/newsLetterSubscriptionModel');

// error handling
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.subscribeNewsletter = catchAsync(async (req, res, next) => {
    if (!req.body.email) return next(new AppError('No email provided', 400));

    const { email } = req.body;

    if (await NewsletterSubscription.findOne({ email })) return next(new AppError('Already subscribed to newsletter', 400));

    await NewsletterSubscription.create({ email });

    return res.status(200).send({ status: "success", message: 'User has been subscribed to newsletter' });
});

exports.unsubscribeNewsletter = catchAsync(async (req, res, next) => {
    if (!req.body.email) return next(new AppError('No email provided', 400));

    await NewsletterSubscription.findOneAndDelete({ email: req.body.email });

    return res.status(200).send({ status: "success", message: 'User has been unsubscribed from newsletter' });
});
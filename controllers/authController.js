const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const randomstring = require("randomstring");
const { promisify } = require('util');

// models
const User = require('../models/userModel');
const ReferList = require('../models/referListModel');

// utils
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// validations
const { signupSchema, loginSchema } = require("../validations/authValidator");

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createAndSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    // for https only
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // remove password from output
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        user
    });
};

exports.signup = catchAsync(async (req, res, next) => {

    const { error } = signupSchema.validate(req.body);

    if (error) {
        return next(
            new AppError(error.details[0].message, 400)
        );
    }

    const uniqueReferLink = randomstring.generate({
        length: 10,
        charset: ['alphabetic', 'numeric']
    });

    const newUser = await User.create({
        ...req.body,
        uniqueReferLink
    });

    if (req.body.referId) {
        const referedBy = await User.findOne({ uniqueReferLink: req.body.referId });
        if (referedBy) {
            await ReferList.create({
                referedBy: referedBy._id,
                referedTo: newUser._id,
            });
        }
    }

    createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { error } = loginSchema.validate(req.body);

    if (error) {
        return next(
            new AppError(error.details[0].message, 400)
        );
    }

    const { email, password } = req.body;

    // 1) check if email and password exists
    if (!email || !password) {
        next(new AppError('Please provide email and password', 400));
    }

    // 2) check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) if everything ok , send token to client
    createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it exists
    let token = '';
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('You are not logged in. Please login to get access', 401)
        );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    // 3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(
            new AppError('The token belonging to this user no longer exists', 401)
        );
    }

    // 4) Check if user changed password after token was issued
    if (!freshUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password! Please login again.', 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        next(new AppError('There is no user with this email address', 404));
    }

    // 2) Generate a random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // we didnt save the document when added fields, validateBeforeSave set to false to avoid error in saving without required fields

    // 3) Send it to users email
    try {
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/resetPassword/${await resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        // return next(new AppError(`${error}`), 500);
        return next(
            new AppError('There was an error sending the email. Try again later'),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new passwordResetToken
    if (!user) {
        return next(new AppError('Token is invalid or expired', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // reseting from user model
    // 4) Log the user in , send the JWT
    createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user._id).select('+password');

    // 2) check if POSTed current password is correctPassword
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    await user.save();

    // $) Log in user, send JWT
    createAndSendToken(user, 200, res);
});
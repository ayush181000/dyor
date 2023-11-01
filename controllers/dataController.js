const TokenData = require('../models/tokenData');

// error handling
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getData = catchAsync(async (req, res, next) => {
    console.log(req.query);

    if (!req.query)
        return next(new AppError('Error', 404));

    res.send({ srtatus: "success" });
});


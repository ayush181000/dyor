const TokenData = require('../models/tokenData');

// error handling
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const getLocalDate = require("../utils/getLocalDate");

const chainNames = ["Optimism", "Arbitrum", "Polygon", "Ethereum", "Lido", "Uniswap", "Maker", "Aave", "curve-dex", "Compound", "Gravivty-Finance", "Synthetix", "Liquity", "Kyberswap-Elastic", "Bancor", "The Graph", "Chainlink", "TruFi", "Centrifuge", "Ankr", "Loopring", "Render", "Rocket-Pool", "Frax", "Rollbit"];

exports.homepage = catchAsync(async (req, res, next) => {
    const data = await TokenData.find({
        tokenName: { $in: chainNames },
        date: getLocalDate()
    });

    res.send({ srtatus: "success", data: data });
});


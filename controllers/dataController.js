const TokenData = require('../models/tokenData');

// error handling
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getLocalDate, getOlderDate } = require("../utils/dateUtil");
const { historicalStaticData, tokenTradingVolMetric } = require("./historicalDataUtil");

const tokenNames = ["Optimism", "Arbitrum", "Polygon", "Ethereum", "Lido", "Uniswap", "Maker", "Aave", "curve-dex", "Compound", "Gravivty-Finance", "Synthetix", "Liquity", "Kyberswap-Elastic", "Bancor", "The Graph", "Chainlink", "TruFi", "Centrifuge", "Ankr", "Loopring", "Render", "Rocket-Pool", "Frax", "Rollbit"];

exports.homepage = catchAsync(async (req, res, next) => {
    let chainNames = tokenNames;

    if (req.query.tokenName) {
        chainNames = req.query.tokenName.split(",");
        console.log(chainNames);
    }

    const data = await TokenData.find({
        tokenName: { $in: chainNames },
        date: getLocalDate()
    });

    if (data.length == 0) {
        return next(new AppError('Requested data does not exist', 400));
    }

    res.send({ status: "success", data });
});

exports.dashboard = catchAsync(async (req, res, next) => {
    if (!req.query.tokenName) {
        return next(new AppError('No token name provided', 400));
    }

    let tokenName = req.query.tokenName;
    console.log(tokenName)


    const priceMetric = await historicalStaticData(tokenName);
    const ttvMetric = await tokenTradingVolMetric(tokenName);



    res.send({ status: "success", tokenName, ...priceMetric, ttvMetric });
})

// const priceData = await getPrice('24h', chainName);
// const priceChange = await getPriceChange('24h', chainName);

const getPrice = async (time, chainNames) => {
    // time = enum [latest , 24h , 30d , 90d , 365d]
    pipeline = [
        {
            $match: {
                tokenName: { $in: chainNames },
                date: new Date(getOlderDate(time))
            }
        },
        { $project: { price: 1, date: 1, tokenName: 1 } }
    ];

    return await TokenData.aggregate(pipeline);
}

const getPriceChange = async (time = '24h', chainNames) => {
    // time = enum [24h , 30d , 90d , 365d] default = 24h

    let pipeline = [{ $match: { tokenName: { $in: chainNames } } }];

    const olderDate = new Date(getOlderDate(time));

    pipeline.push(...[
        { $match: { date: { $gt: olderDate } } },
        { $sort: { date: -1 } },
        {
            $group: {
                _id: '$tokenName',
                latestPrice: { $first: '$price' },
                previousPrice: { $last: '$price' }
            }
        },
        {
            $project: {
                tokenName: '$_id',
                percentageChange: {
                    $subtract: [
                        {
                            $divide: [
                                {
                                    $subtract: [
                                        '$latestPrice',
                                        '$previousPrice'
                                    ]
                                },
                                '$previousPrice'
                            ]
                        },
                        1
                    ]
                },
                _id: 0
            }
        }
    ]);

    // console.log(pipeline);


    return { time, data: await TokenData.aggregate(pipeline) };
}


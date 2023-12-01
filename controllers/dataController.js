const TokenData = require('../models/tokenData');

// error handling
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getOlderDate } = require("../utils/dateUtil");
const { historicalStaticData } = require("./historicalDataUtil");

const tokenNames = ["Optimism", "Arbitrum", "Polygon", "Ethereum", "Lido", "Uniswap", "Maker", "Aave", "curve-dex", "Compound", "Synthetix", "Liquity", "Kyberswap-Elastic", "Chainlink",
    // new chains added
    "Avalanche", "Fantom", "Gnosis", "Osmosis", "PancakeSwap"
];

exports.homepage = catchAsync(async (req, res, next) => {
    let chainNames = tokenNames;
    // let chainNames = ["Chainlink"];
    let data = [];

    if (req.query.tokenName) {
        chainNames = req.query.tokenName.split(",");
        console.log(chainNames);
    }

    runAllFetch(chainNames).then(promise => {
        promise.forEach((el) => {
            // console.log(el);

            let tempData = {
                tvl: null,
                fdv: null,
                holders: null,
                activeHolders: null,
                totalSupply: null,
                daily_fee: null,
                price: null,
                ttv: null,
                circulatingSupply: null,
                stakingRatio: null,
                marketCap: null
            };

            for (let i = 0; i < el.length; i++) {
                const { _doc } = el[i];

                tempData = {
                    tokenName: _doc['tokenName'],
                    date: tempData['date'] || _doc['date'],

                    tvl: tempData['tvl'] == null && _doc['tvl'] && (_doc['tvl'] > 0) ? _doc['tvl'] : tempData['tvl'],

                    fdv: tempData['fdv'] == null && _doc['fdv'] && (_doc['fdv'] > 0) ? _doc['fdv'] : tempData['fdv'],

                    holders: tempData['holders'] == null && _doc['holders'] && (_doc['holders'] > 0) ? _doc['holders'] : tempData['holders'],

                    activeHolders: tempData['activeHolders'] == null && _doc['activeHolders'] && (_doc['activeHolders'] > 0) ? _doc['activeHolders'] : tempData['activeHolders'],

                    totalSupply: tempData['totalSupply'] == null && _doc['totalSupply'] && (_doc['totalSupply'] > 0) ? _doc['totalSupply'] : tempData['totalSupply'],
                    daily_fee: tempData['daily_fee'] == null && _doc['daily_fee'] && (_doc['daily_fee'] > 0) ? _doc['daily_fee'] : tempData['daily_fee'],

                    price: tempData['price'] == null && _doc['price'] && (_doc['price'] > 0) ? _doc['price'] : tempData['price'],

                    ttv: tempData['ttv'] == null && _doc['ttv'] && (_doc['ttv'] > 0) ? _doc['ttv'] : tempData['ttv'],

                    circulatingSupply: tempData['circulatingSupply'] == null && _doc['circulatingSupply'] && (_doc['circulatingSupply'] > 0) ? _doc['circulatingSupply'] : tempData['circulatingSupply'],

                    stakingRatio: tempData['stakingRatio'] == null && _doc['stakingRatio'] && (_doc['stakingRatio'] > 0) ? _doc['stakingRatio'] : tempData['stakingRatio'],

                    marketCap: tempData['marketCap'] == null && _doc['marketCap'] && (_doc['marketCap'] > 0) ? _doc['marketCap'] : tempData['marketCap'],
                };
            }

            data.push(tempData);
        });
        res.send({ status: "success", data });
    }).catch(err => {
        console.log(err);
        return next(new AppError('Internal Error', 400));
    }).finally(() => {
        if (data.length == 0) {
            return next(new AppError('Requested data does not exist', 400));
        }
    })
});

function runAllFetch(chainNames) {
    let promises = [];
    for (let i = 0; i < chainNames.length; i++) {
        promises.push(TokenData.find({ tokenName: chainNames[i] }).sort({ date: -1 }).limit(7));
    }
    return Promise.all(promises);
}


exports.dashboard = catchAsync(async (req, res, next) => {
    if (!req.query.tokenName) {
        return next(new AppError('No token name provided', 400));
    }

    let tokenName = req.query.tokenName;
    console.log(tokenName)


    const priceMetric = await historicalStaticData(tokenName);
    // const ttvMetric = await tokenTradingVolMetric(tokenName);



    res.send({ status: "success", tokenName, ...priceMetric });
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


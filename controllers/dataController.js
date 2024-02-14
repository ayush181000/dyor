const TokenData = require('../models/tokenData');

// error handling
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getOlderDate } = require("../utils/dateUtil");
const { historicalStaticData } = require("./historicalDataUtil");

const { tokenNames } = require('./constants');

let cache = null;
let cacheTime = null;
let hoursPassed = null;

const homepage = catchAsync(async (req, res, next) => {
    let chainNames = tokenNames;
    // let chainNames = ["Chainlink"];

    if (req.query.tokenName) {
        chainNames = req.query.tokenName.split(",");
        console.log(chainNames);
    }

    console.log(cache);
    console.log(cacheTime);
    const currTime = Date.now();
    if (cacheTime) {
        hoursPassed = Math.abs(currTime - cacheTime) / 36e5;
    }

    if (cache && cacheTime && hoursPassed < 0.5) {
        res.send({ status: "success", data: cache });
    } else {
        const data = await dataFallback(chainNames);
        cache = data;
        cacheTime = Date.now();
        res.send({ status: "success", data });
    }


})

const dataFallback = async (chainNames) => {
    let data = [];
    for (let chain of chainNames) {
        const abc = await TokenData.aggregate(returnPipeline(chain));
        let tempData = {
            ttv: abc[0]?.total_ttv || "NA",
            daily_fee: abc[0]?.total_fee || "NA",
            fdv: null,
            holders: null,
            activeHolders: null,
            totalSupply: null,
            price: null,
            tvl: null,
            circulatingSupply: null,
            stakingRatio: null,
            marketCap: null
        };

        const result = await TokenData.find({ tokenName: chain }).sort({ date: -1 }).limit(7);
        // console.log(result);

        // console.log(result.length);
        for (let i = 0; i < result.length; i++) {
            const { _doc } = result[i];

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
    }

    return data;
}

const returnPipeline = (tokenName) => {
    return [
        {
            '$match': {
                'tokenName': tokenName,
                'date': {
                    '$gte': getOlderDate('30d')
                }
            }
        }, {
            '$group': {
                '_id': '$tokenName',
                'total_ttv': {
                    '$sum': '$ttv'
                },
                'total_fee': {
                    '$sum': '$daily_fee'
                }
            }
        }
    ]
}

const dashboard = catchAsync(async (req, res, next) => {
    if (!req.query.tokenName) return next(new AppError('No token name provided', 400));

    let tokenName = req.query.tokenName;
    console.log(tokenName)

    const historicalMetric = await historicalStaticData(tokenName);

    res.send({ status: "success", tokenName, ...historicalMetric });
})


let chartCache = {};
let chartCacheTime = null;
let chartHoursPassed = null;

const charts = catchAsync(async (req, res, next) => {
    if (!req.query.tokenName) return next(new AppError('No token name provided', 400));

    let tokenName = req.query.tokenName;

    const currTime = Date.now();
    if (chartCacheTime) {
        chartHoursPassed = Math.abs(currTime - chartCacheTime) / 36e5;
    }

    if (chartCache[tokenName] && chartHoursPassed < 1) {
        console.log("chart cache sent");
        return res.send({ status: "success", tokenName, chart: chartCache[tokenName] });
    } else {
        const chart = await TokenData.find({ tokenName }).sort({ date: -1 }).limit(365).select({
            tvl: 1,
            ttv: 1,
            activeHolders: 1,
            price: 1,
            holders: 1,
            circulatingSupply: 1,
            daily_fee: 1,
            date: 1
        });

        //set cache
        chartCache[tokenName] = chart
        chartCacheTime = Date.now();

        res.send({ status: "success", tokenName, chart });
    }
})

module.exports = { dataFallback, charts, dashboard, homepage }
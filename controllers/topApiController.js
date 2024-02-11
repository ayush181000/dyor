const TokenData = require("../models/tokenData");
const catchAsync = require("../utils/catchAsync");
const { getOlderDate } = require("../utils/dateUtil");
const percChange = require("../utils/percentageChange");
const { promisify } = require('util');
const { historicalDataForTop } = require("./historicalDataUtil");

const { tokenNames } = require('./constants');

let cache = null;

const reduceData = async (tokenNames) => {
    const result = [];

    for (let i = 0; i < tokenNames.length; i++) {
        const token = tokenNames[i];
        const data = await TokenData.find({ tokenName: token }).sort({ date: -1 }).limit(60);

        const initialValue = {
            tvl: 0,
            fee: 0,
            circulatingSupply: 0,
            elementCount: 0,
        }

        const reducer = (accumulator, currentValue) => {
            return {
                tvl: accumulator.tvl + currentValue.tvl !== null ? currentValue.tvl : 0,
                fee: accumulator.fee + currentValue.daily_fee !== null ? currentValue.daily_fee : 0,
                circulatingSupply: accumulator.circulatingSupply + currentValue.circulatingSupply !== null ? currentValue.circulatingSupply : 0,
                elementCount: accumulator.elementCount + 1,
            }
        }

        const data_30_days = data.slice(0, 30).reduce(reducer, initialValue);
        const data_60_days = data.slice(30, 60).reduce(reducer, initialValue);;

        // console.log(data_30_days)
        // console.log(data_60_days)

        result.push({
            tokenName: token,
            feeChange: percChange(data_30_days.fee, data_60_days.fee),
            tvlChange: percChange(data_30_days.tvl, data_60_days.tvl),
            circulatingSupplyChange: percChange(data_30_days.circulatingSupply, data_60_days.circulatingSupply),
        });
    }

    return (result);
}

const reduceData2 = async (tokenNames) => {
  const result = [];
    for (let i = 0; i < tokenNames.length; i++) {
        const token = tokenNames[i];
        const historicalData = await historicalDataForTop(token);
        result.push({
          tokenName: token,
          feeChange: historicalData.feeMetric.percChange30d,
          tvlChange: historicalData.tvlMetric.percChange30d,
          circulatingSupplyChange: historicalData.supplyMetric.percChange30d,
        });
    }

    return result;
};

const topApi1 = catchAsync(async (req, res) => {
    const result = await reduceData2(tokenNames);

    // console.log("Result", result);
    const sortedFee = [...result]
        .filter((el) => el.feeChange !== "∞")
        .sort(customSortMakerAscending('feeChange'))
        .slice(0, 5);

    const sortedTvl = [...result]
        .filter((el) => el.tvlChange !== "∞")
        .sort(customSortMakerAscending('tvlChange'))
        .slice(0, 5);

    const sortedcirculatingSupply = [...result]
        .filter((el) => el.circulatingSupplyChange !== "∞")
        .sort(customSortMakerDecending('circulatingSupplyChange'))
        .slice(0, 5);

    res.json({ sortedFee, sortedTvl, sortedcirculatingSupply });
})

const topApi = catchAsync(async (req, res) => {
    const pipeline = [
        {
            '$match': {
                'tokenName': { '$in': tokenNames },
                'date': {
                    '$gte': getOlderDate('60d')
                }
            }
        },
        {
            '$project': {
                'tokenName': 1,
                'dateRange': {
                    '$cond': {
                        'if': {
                            '$and': [
                                {
                                    '$gte': [
                                        '$date', getOlderDate('60d')
                                    ]
                                }, {
                                    '$lt': [
                                        '$date', getOlderDate('30d')
                                    ]
                                }
                            ]
                        },
                        'then': '30 to 60 days ago',
                        'else': 'up to 30 days ago'
                    }
                },
                'tvl': 1,
                'daily_fee': 1,
                'circulatingSupply': 1,
                'date': 1
            }
        },
        {
            '$group': {
                '_id': {
                    'tokenName': '$tokenName',
                    'dateRange': '$dateRange'
                },
                'tvl': { '$sum': '$tvl' },
                'fee': { '$sum': '$daily_fee' },
                'circulatingSupply': { '$sum': '$circulatingSupply' },
            }
        },
        {
            '$project': {
                'tokenName': '$_id.tokenName',
                'data': {
                    dateRange: '$_id.dateRange',
                    tvl: '$tvl',
                    fee: '$fee',
                    circulatingSupply: '$circulatingSupply'
                }
            }
        },
        {
            '$group': {
                _id: "$tokenName",
                data: {
                    $push: "$data",
                },
            }
        }
    ];

    const total = await TokenData.aggregate(pipeline);

    console.log(total)
    const changePercentages = [];

    total.forEach(element => {
        const range30 = element.data[0].dateRange === 'up to 30 days ago' ? element.data[0] : element.data[1];

        const range60 = element.data[0].dateRange !== 'up to 30 days ago' ? element.data[0] : element.data[1];

        console.log(element)
        // console.log(range30, range60)
        const tempObj = {
            tokenName: element._id,
            feeChange: percChange(range30.fee, range60.fee),
            tvlChange: percChange(range30.tvl, range60.tvl),
            circulatingSupplyChange: percChange(range30.circulatingSupply, range60.circulatingSupply),
        }
        changePercentages.push(tempObj);
    });

    // console.log(changePercentages);

    const sortedFee = [...changePercentages]
        .filter((el) => el.feeChange !== "∞")
        .sort(customSortMakerAscending('feeChange'))
        .slice(0, 5);

    const sortedTvl = [...changePercentages]
        .filter((el) => el.tvlChange !== "∞")
        .sort(customSortMakerAscending('tvlChange'))
        .slice(0, 5);

    const sortedcirculatingSupply = [...changePercentages]
        .filter((el) => el.circulatingSupplyChange !== "∞")
        .sort(customSortMakerDecending('circulatingSupplyChange'))
        .slice(0, 5);

    res.json({ sortedFee, sortedTvl, sortedcirculatingSupply });
}
)

function customSortMakerAscending(value) {
    return function (x, y) {
        if (x[value] > y[value]) {
            return -1;
        }
        if (x[value] < y[value]) {
            return 1;
        }
        return 0;
    };
}

function customSortMakerDecending(value) {
    return function (x, y) {
        if (x[value] > y[value]) {
            return 1;
        }
        if (x[value] < y[value]) {
            return -1;
        }
        return 0;
    };
}


module.exports = { topApi, topApi1 }
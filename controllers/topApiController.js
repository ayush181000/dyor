const TokenData = require("../models/tokenData");
const catchAsync = require("../utils/catchAsync");
const { getOlderDate } = require("../utils/dateUtil");
const percChange = require("../utils/percentageChange");

const tokenNames = ["Optimism", "Arbitrum", "Polygon", "Ethereum", "Lido", "Uniswap", "Maker", "Aave", "curve-dex", "Compound", "Synthetix", "Liquity", "Kyberswap-Elastic", "Chainlink", "Avalanche", "Fantom", "Gnosis", "Osmosis", "PancakeSwap"];

// const topApi = catchAsync(async (req, res) => {
//     const pipeline_30_days = [
//         {
//             '$match': {
//                 'date': {
//                     '$gte': getOlderDate('30d'),
//                     '$lt': getOlderDate(),
//                 }
//             }
//         }, {
//             '$group': {
//                 '_id': '$tokenName',
//                 'tvl': { '$sum': '$tvl' },
//                 'fee': { '$sum': '$daily_fee' },
//                 'circulatingSupply': { '$sum': '$circulatingSupply' },
//             }
//         }, {
//             '$sort': {
//                 '_id': 1
//             }
//         }
//     ];

//     const pipeline_60_days = [
//         {
//             '$match': {
//                 'date': {
//                     '$gte': getOlderDate('60d'),
//                     '$lt': getOlderDate('30d'),
//                 }
//             }
//         }, {
//             '$group': {
//                 '_id': '$tokenName',
//                 'tvl': { '$sum': '$tvl' },
//                 'fee': { '$sum': '$daily_fee' },
//                 'circulatingSupply': { '$sum': '$circulatingSupply' },
//             }
//         }, {
//             '$sort': {
//                 '_id': 1
//             }
//         }
//     ];

//     const data_30days = await TokenData.aggregate(pipeline_30_days);
//     const data_60days = await TokenData.aggregate(pipeline_60_days);

//     // console.log(data_30days, data_60days)

//     const percentageChanges = [];

//     for (let i = 0; i < data_30days.length; i++) {
//         console.log(data_30days[i], data_60days[i])
//         const tempArr = {
//             tokenName: data_30days[i]._id,
//             tvlChange: percChange(data_30days[i].tvl, data_60days[i].tvl),
//             feeChange: percChange(data_30days[i].fee, data_60days[i].fee),
//             circulatingSupplyChange: percChange(data_30days[i].circulatingSupply, data_60days[i].circulatingSupply),
//         }
//         percentageChanges.push(tempArr);
//     }

//     res.json({ percentageChanges });
// })


const topApi = async (req, res) => {
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
        .sort(customSortMaker('feeChange'))
        .slice(0, 5);

    const sortedTvl = [...changePercentages]
        .filter((el) => el.tvlChange !== "∞")
        .sort(customSortMaker('tvlChange'))
        .slice(0, 5);

    const sortedcirculatingSupply = [...changePercentages]
        .filter((el) => el.circulatingSupplyChange !== "∞")
        .sort(customSortMaker('circulatingSupplyChange'))
        .slice(0, 5);

    res.json({ sortedFee, sortedTvl, sortedcirculatingSupply });
}

function customSortMaker(value) {
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


module.exports = { topApi }
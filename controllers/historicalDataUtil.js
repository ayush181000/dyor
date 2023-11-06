const TokenData = require("../models/tokenData");
const { getLocalDate, getOlderDate } = require("../utils/dateUtil");

const historicalStaticData = (async (tokenName) => {
    const nullObject = { price: null, circulatingSupply: null, tvl: null, holders: null };

    const { price: latestPrice, circulatingSupply: latestCirculatingSupply, tvl: latestTvl, holders: latestHolders } = await TokenData.findOne({ tokenName, date: getLocalDate() }) || nullObject;
    const { price: price24h, circulatingSupply: circulatingSupply24h, tvl: tvl24h, holders: holders24h } = await TokenData.findOne({ tokenName, date: getOlderDate('24h') }) || nullObject;
    const { price: price30d, circulatingSupply: circulatingSupply30d, tvl: tvl30d, holders: holders30d } = await TokenData.findOne({ tokenName, date: getOlderDate('30d') }) || nullObject;
    const { price: price60d, circulatingSupply: circulatingSupply60d, tvl: tvl60d, holders: holders60d } = await TokenData.findOne({ tokenName, date: getOlderDate('60d') }) || nullObject;
    const { price: price90d, circulatingSupply: circulatingSupply90d, tvl: tvl90d, holders: holders90d } = await TokenData.findOne({ tokenName, date: getOlderDate('90d') }) || nullObject;
    const { price: price365d, circulatingSupply: circulatingSupply365d, tvl: tvl365d, holders: holders365d } = await TokenData.findOne({ tokenName, date: getOlderDate('365d') }) || nullObject;

    const tokenTradingVolumeMetric = await tokenTradingVolMetricFunc(tokenName);
    const feeMetric = await feeMetricFunc(tokenName);

    return {
        priceMetric: {
            latestPrice,
            price24h,
            price30d,
            price60d,
            price90d,
            price365d,
            percChange24h: percChange(latestPrice, price24h),
            percChange30d: percChange(latestPrice, price30d),
            percChange60d: percChange(latestPrice, price60d),
            percChange90d: percChange(latestPrice, price90d),
            percChange365d: percChange(latestPrice, price365d)
        },
        supplyMetric: {
            latestCirculatingSupply,
            circulatingSupply24h,
            circulatingSupply30d,
            circulatingSupply60d,
            circulatingSupply90d,
            circulatingSupply365d,
            percChange24h: percChange(latestCirculatingSupply, circulatingSupply24h),
            percChange30d: percChange(latestCirculatingSupply, circulatingSupply30d),
            percChange60d: percChange(latestCirculatingSupply, circulatingSupply60d),
            percChange90d: percChange(latestCirculatingSupply, circulatingSupply90d),
            percChange365d: percChange(latestCirculatingSupply, circulatingSupply365d)
        },
        tvlMetric: {
            latestTvl,
            tvl24h,
            tvl30d,
            tvl60d,
            tvl90d,
            tvl365d,
            percChange24h: percChange(latestTvl, tvl24h),
            percChange30d: percChange(latestTvl, tvl30d),
            percChange60d: percChange(latestTvl, tvl60d),
            percChange90d: percChange(latestTvl, tvl90d),
            percChange365d: percChange(latestTvl, tvl365d)
        },
        tokenHolderMetric: {
            latestHolders,
            holders24h,
            holders30d,
            holders60d,
            holders90d,
            holders365d,
            percChange24h: percChange(latestHolders, holders24h),
            percChange30d: percChange(latestHolders, holders30d),
            percChange60d: percChange(latestHolders, holders60d),
            percChange90d: percChange(latestHolders, holders90d),
            percChange365d: percChange(latestHolders, holders365d)
        },
        tokenTradingVolumeMetric,
        feeMetric

    }
});

const tokenTradingVolMetricFunc = async (tokenName) => {
    const { ttv: latestTtv } = await TokenData.findOne({ tokenName, date: getLocalDate() }) || { ttv: null };

    const sum30days = await getTTVinDays(tokenName, '30d');

    const sum60days = await getTTVinDays(tokenName, '60d');

    const sum90days = await getTTVinDays(tokenName, '90d');

    const sum365days = await getTTVinDays(tokenName, '365d');

    const sumOf60daysAfter60days = await getTTVinDaysDiff(tokenName, '120d', '60d');

    const sumOf90daysAfter90days = await getTTVinDaysDiff(tokenName, '180d', '90d');

    const sumOf365daysAfter365days = await getTTVinDaysDiff(tokenName, '730d', '365d');

    return {
        latestTtv,
        sum30days,
        sum60days,
        sum90days,
        sum365days,
        percChange30d: percChange(sum30days, sum60days - sum30days),
        percChange60d: percChange(sum60days, sumOf60daysAfter60days),
        percChange90d: percChange(sum90days, sumOf90daysAfter90days),
        percChange365d: percChange(sum365days, sumOf365daysAfter365days),
    }
};

const feeMetricFunc = async (tokenName) => {

    const { daily_fee: latestFee } = await TokenData.findOne({ tokenName, date: getLocalDate() }) || { daily_fee: null };

    const sum30days = await getFeeInDays(tokenName, '30d');

    const sum60days = await getFeeInDays(tokenName, '60d');

    const sum90days = await getFeeInDays(tokenName, '90d');

    const sum365days = await getFeeInDays(tokenName, '365d');

    const sumOf60daysAfter60days = await getFeeInDaysDiff(tokenName, '120d', '60d');

    const sumOf90daysAfter90days = await getFeeInDaysDiff(tokenName, '180d', '90d');

    const sumOf365daysAfter365days = await getFeeInDaysDiff(tokenName, '730d', '365d');

    return {
        latestFee,
        sum30days,
        sum60days,
        sum90days,
        sum365days,
        percChange30d: percChange(sum30days, sum60days - sum30days),
        percChange60d: percChange(sum60days, sumOf60daysAfter60days),
        percChange90d: percChange(sum90days, sumOf90daysAfter90days),
        percChange365d: percChange(sum365days, sumOf365daysAfter365days),
    }
}

const getTTVinDays = (async (tokenName, days) => {
    return await TokenData.aggregate([
        { $match: { tokenName, date: { $gte: getOlderDate(days) } } },
        {
            $group: {
                _id: "$tokenName",
                total_ttv: {
                    $sum: "$ttv",
                },
            }
        }
    ]).then((arr) => {
        return arr[0]?.total_ttv
    });
})

const getTTVinDaysDiff = (async (tokenName, startDate, endDate) => {
    return await TokenData.aggregate([
        {
            $match:
            {
                tokenName,
                date: {
                    $gte: getOlderDate(startDate),
                    $lt: getOlderDate(endDate)
                }
            }
        },
        {
            $group: {
                _id: "$tokenName",
                total_ttv: {
                    $sum: "$ttv",
                },
            }
        }
    ]).then((arr) => {
        // console.log(arr)
        return arr[0]?.total_ttv || 0
    });
})

const getFeeInDays = (async (tokenName, days) => {
    // console.log(days, getOlderDate(days));
    return await TokenData.aggregate([
        { $match: { tokenName, date: { $gte: getOlderDate(days) } } },
        {
            $group: {
                _id: "$tokenName",
                total_fee: {
                    $sum: "$daily_fee",
                },
            }
        }
    ]).then((arr) => {
        return arr[0]?.total_fee || null;
    });
})

const getFeeInDaysDiff = (async (tokenName, startDate, endDate) => {
    // console.log(startDate, getOlderDate(startDate));
    // console.log(endDate, getOlderDate(endDate));
    return await TokenData.aggregate([
        {
            $match:
            {
                tokenName,
                date: {
                    $gte: getOlderDate(startDate),
                    $lt: getOlderDate(endDate)
                }
            }
        },
        {
            $group: {
                _id: "$tokenName",
                total_fee: {
                    $sum: "$daily_fee",
                },
            }
        }
    ]).then((arr) => {
        // console.log(arr)
        return arr[0]?.daily_fee || 0;
    });
})

const percChange = (a, b) => {
    if (b == 0) {
        // infinity case
        return '∞';
    }
    return (a - b) / b * 100;
}

module.exports = { historicalStaticData }
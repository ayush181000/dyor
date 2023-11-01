const TokenData = require("../models/tokenData");
const { getLocalDate, getOlderDate } = require("../utils/dateUtil");

const historicalStaticData = async (tokenName) => {
    const nullObject = { price: null, circulatingSupply: null, tvl: null, holders: null };

    const { price: latestPrice, circulatingSupply: latestCirculatingSupply, tvl: latestTvl, holders: latestHolders } = await TokenData.findOne({ tokenName, date: getLocalDate() }) || nullObject;
    const { price: price24h, circulatingSupply: circulatingSupply24h, tvl: tvl24h, holders: holders24h } = await TokenData.findOne({ tokenName, date: getOlderDate('24h') }) || nullObject;
    const { price: price30d, circulatingSupply: circulatingSupply30d, tvl: tvl30d, holders: holders30d } = await TokenData.findOne({ tokenName, date: getOlderDate('30d') }) || nullObject;
    const { price: price60d, circulatingSupply: circulatingSupply60d, tvl: tvl60d, holders: holders60d } = await TokenData.findOne({ tokenName, date: getOlderDate('60d') }) || nullObject;
    const { price: price90d, circulatingSupply: circulatingSupply90d, tvl: tvl90d, holders: holders90d } = await TokenData.findOne({ tokenName, date: getOlderDate('90d') }) || nullObject;
    const { price: price365d, circulatingSupply: circulatingSupply365d, tvl: tvl365d, holders: holders365d } = await TokenData.findOne({ tokenName, date: getOlderDate('365d') }) || nullObject;


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
        }
    }
}


const percChange = (a, b) => {
    return (a - b) / b * 100;
}

module.exports = { historicalStaticData }
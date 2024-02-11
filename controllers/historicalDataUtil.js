const TokenData = require("../models/tokenData");
const { getOlderDate } = require("../utils/dateUtil");
const percChange = require('../utils/percentageChange');

const historicalStaticData = (async (tokenName) => {
    const nullObject = { price: null, circulatingSupply: null, tvl: null, holders: null, activeHolders: null };

    const latestData = await dataFallback([tokenName]);

    const latestPrice = latestData[0]?.price || null;
    const latestCirculatingSupply = latestData[0]?.circulatingSupply || null;
    const latestTvl = latestData[0]?.tvl || null;
    const latestHolders = latestData[0]?.holders || null;
    const latestActiveHolders = latestData[0]?.activeHolders || null;

    const { price: price24h, circulatingSupply: circulatingSupply24h, tvl: tvl24h, holders: holders24h, activeHolders: activeHolders24h } = await TokenData.findOne({ tokenName, date: getOlderDate('24h') }) || nullObject;
    const { price: price30d, circulatingSupply: circulatingSupply30d, tvl: tvl30d, holders: holders30d, activeHolders: activeHolders30d } = await TokenData.findOne({ tokenName, date: getOlderDate('30d') }) || nullObject;
    const { price: price60d, circulatingSupply: circulatingSupply60d, tvl: tvl60d, holders: holders60d, activeHolders: activeHolders60d } = await TokenData.findOne({ tokenName, date: getOlderDate('60d') }) || nullObject;
    const { price: price90d, circulatingSupply: circulatingSupply90d, tvl: tvl90d, holders: holders90d, activeHolders: activeHolders90d } = await TokenData.findOne({ tokenName, date: getOlderDate('90d') }) || nullObject;
    const { price: price365d, circulatingSupply: circulatingSupply365d, tvl: tvl365d, holders: holders365d, activeHolders: activeHolders365d } = await TokenData.findOne({ tokenName, date: getOlderDate('365d') }) || nullObject;

    const tokenTradingVolumeMetric = await tokenTradingVolMetricFunc(tokenName);
    const feeMetric = await feeMetricFunc(tokenName);
    const fair_price = fairPriceCalculation(
        percChange(latestTvl, tvl90d),
        tokenTradingVolumeMetric.percChange90d,
        feeMetric.percChange90d,
        percChange(latestActiveHolders, activeHolders90d),
        percChange(latestHolders, holders90d),
        percChange(latestCirculatingSupply, circulatingSupply90d),
        percChange(latestPrice, price90d),
        latestPrice
    );

    return {
        fair_price,
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
        activeHolderMetric: {
            latestActiveHolders,
            activeHolders24h,
            activeHolders30d,
            activeHolders60d,
            activeHolders90d,
            activeHolders365d,
            percChange24h: percChange(latestActiveHolders, activeHolders24h),
            percChange30d: percChange(latestActiveHolders, activeHolders30d),
            percChange60d: percChange(latestActiveHolders, activeHolders60d),
            percChange90d: percChange(latestActiveHolders, activeHolders90d),
            percChange365d: percChange(latestActiveHolders, activeHolders365d)
        },

        tokenTradingVolumeMetric,
        feeMetric,
    }
});

const tokenTradingVolMetricFunc = async (tokenName) => {
    const latestTtv = await getTTVinDays(tokenName, '30d');

    const sum30days = await getTTVinDaysDiff(tokenName, '60d', '30d');

    const sum60days = await getTTVinDaysDiff(tokenName, '90d', '60d');

    const sum90days = await getTTVinDaysDiff(tokenName, '120d', '90d');

    const sum365days = await getTTVinDaysDiff(tokenName, '395d', '365d');

    return {
        latestTtv,
        sum30days,
        sum60days,
        sum90days,
        sum365days,
        percChange30d: percChange(latestTtv, sum30days),
        percChange60d: percChange(latestTtv, sum60days),
        percChange90d: percChange(latestTtv, sum90days),
        percChange365d: percChange(latestTtv, sum365days),
    }
};

const feeMetricFunc = async (tokenName) => {
    const latestFee = await getFeeInDays(tokenName, '30d');

    const sum30days = await getFeeInDaysDiff(tokenName, '60d', '30d');

    const sum60days = await getFeeInDaysDiff(tokenName, '90d', '60d');

    const sum90days = await getFeeInDaysDiff(tokenName, '120d', '90d');

    const sum365days = await getFeeInDaysDiff(tokenName, '395d', '365d');

    return {
        latestFee,
        sum30days,
        sum60days,
        sum90days,
        sum365days,
        percChange30d: percChange(latestFee, sum30days),
        percChange60d: percChange(latestFee, sum60days),
        percChange90d: percChange(latestFee, sum90days),
        percChange365d: percChange(latestFee, sum365days),
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
        return arr[0]?.total_ttv || 0
    });
})

const getFeeInDays = (async (tokenName, days) => {
    return await TokenData.aggregate([
        {
            $match:
            {
                tokenName,
                date: { $gte: getOlderDate(days) }
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
        return arr[0]?.total_fee || 0;
    });
})

const fairPriceCalculation = (tvl, ttv, fee, dau, holder, circulatingSupply, pricePerc, price) => {
    // console.log(tvl, ttv, fee, dau, pricePerc)
    // console.log((tvl === '∞' || null ? 0 : tvl + ttv || 0 + fee || 0 + dau || 0));
    const average_demand_change_perc = (
        (tvl === '∞' || null ? 0 : tvl) +
        (ttv === '∞' || null ? 0 : ttv) +
        (fee === '∞' || null ? 0 : fee) +
        (dau === '∞' || null ? 0 : dau) +
        (holder === '∞' || null ? 0 : holder)
    ) / (
            (tvl === '∞' || null ? 0 : 1) +
            (ttv === '∞' || null ? 0 : 1) +
            (fee === '∞' || null ? 0 : 1) +
            (dau === '∞' || null ? 0 : 1) +
            (holder === '∞' || null ? 0 : 1)
        );
    const average_supply_change_perc = circulatingSupply;

    const fair_price_percentage = average_demand_change_perc - average_supply_change_perc - pricePerc;

    if (fair_price_percentage < -0) {
        //C/{1-(G/100)}
        return price / (1 - (fair_price_percentage / 100));
    }
    else {
        return price + (price * fair_price_percentage / 100);
    }
}

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

const historicalDataForTop = async (tokenName) => {
  const nullObject = {
    price: null,
    circulatingSupply: null,
    tvl: null,
    holders: null,
    activeHolders: null,
  };

  const latestData = await dataFallback([tokenName]);

  const latestCirculatingSupply = latestData[0]?.circulatingSupply || null;
  const latestTvl = latestData[0]?.tvl || null;

  const {
    price: price24h,
    circulatingSupply: circulatingSupply24h,
    tvl: tvl24h,
    holders: holders24h,
    activeHolders: activeHolders24h,
  } = (await TokenData.findOne({ tokenName, date: getOlderDate("24h") })) ||
  nullObject;
  const {
    price: price30d,
    circulatingSupply: circulatingSupply30d,
    tvl: tvl30d,
    holders: holders30d,
    activeHolders: activeHolders30d,
  } = (await TokenData.findOne({ tokenName, date: getOlderDate("30d") })) ||
  nullObject;

  const feeMetric = await feeMetricFuncForTOP(tokenName);

  return {
    supplyMetric: {
      latestCirculatingSupply,
      circulatingSupply24h,
      circulatingSupply30d,
      percChange24h: percChange(latestCirculatingSupply, circulatingSupply24h),
      percChange30d: percChange(latestCirculatingSupply, circulatingSupply30d),
    },
    tvlMetric: {
      latestTvl,
      tvl24h,
      tvl30d,
      percChange24h: percChange(latestTvl, tvl24h),
      percChange30d: percChange(latestTvl, tvl30d),
    },
    feeMetric,
  };
};
const feeMetricFuncForTOP = async (tokenName) => {
  const latestFee = await getFeeInDays(tokenName, "30d");

  const sum30days = await getFeeInDaysDiff(tokenName, "60d", "30d");


  return {
    latestFee,
    sum30days,
    percChange30d: percChange(latestFee, sum30days)
  };
};

module.exports = { historicalStaticData, historicalDataForTop };
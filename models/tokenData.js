const mongoose = require('mongoose');

const tokenDataSchema = mongoose.Schema({
    tokenName: { type: String, required: true },
    date: { type: Date },
    tvl: Number,

    fdv: Number,
    holders: Number,
    activeHolders: Number,


    totalSupply: Number,
    daily_fee: Number,

    price: Number,
    priceChangePercentages: String,

    ttv: Number,
    ttvChangePercentages: String,

    circulatingSupply: Number,
    circulatingSupplyChangePercentages: String,

    stakingRatio: Number,
    stakingRatioChangePercentages: String,

    marketCap: Number
});

tokenDataSchema.index(
    { tokenName: 1, date: 1 },
    { unique: true }
);

const TokenData = mongoose.model('tokenData', tokenDataSchema);

module.exports = TokenData;
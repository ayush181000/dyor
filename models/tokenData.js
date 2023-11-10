const mongoose = require('mongoose');

const tokenDataSchema = mongoose.Schema({
    tokenName: { type: String, required: true },
    date: { type: Date },
    price: Number,
    tvl: Number,
    ttv: Number,
    ttvChangePercentages: String,
    fdv: Number,
    holders: Number,
    activeHolders: Number,
    circulatingSupply: Number,
    circulatingSupplyChangePercentages: String,
    totalSupply: Number,
    active_users: Number,
    daily_fee: Number,

    stakingRatio: Number,
    stakingRatioChangePercentages: String
});

tokenDataSchema.index({ tokenName: 1, date: 1 }, { unique: true });

const TokenData = mongoose.model('tokenData', tokenDataSchema);

module.exports = TokenData;
const mongoose = require('mongoose');

const tokenDataSchema = mongoose.Schema({
    tokenName: { type: String, required: true },
    date: Date,
    price: Number,
    tvl: Number,
    ttv: Number,
    fdv: Number,
    holders: Number,
    activeHolders: Number,
    circulatingSupply: Number,
    totalSupply: Number,
    active_users: Number,
    daily_fee: Number,
});

tokenDataSchema.index({ tokenName: 1, date: -1 });

const TokenData = mongoose.model('tokenData', tokenDataSchema);

module.exports = TokenData;
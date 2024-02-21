const TokenData = require('../models/tokenData');
const mongoose = require('mongoose');
const { getLocalDate } = require("../utils/dateUtil");
const { cmcDataPull } = require('./cmcScript.js');
const {
    syncActive,
    syncHolder,
    syncFee,
    syncTVL,
    syncTTV
} = require('../flipside/ttSync');
require('dotenv').config({ path: '../.env' });

const dummyToken = {
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
}

const addNewToken = async (tokenName, cmcId, ttslug) => {
    try {
        mongoose
            .connect(process.env.DATABASE, {
                useNewUrlParser: true,
            })
            .then(async () => {
                // 1.) BLANK ENTRIES

                var d = getLocalDate();
                d.setDate(d.getDate() - 1);

                for (let i = 0; i < 365; i++) {
                    TokenData.create({
                        tokenName, date: new Date(d),
                        ...dummyToken
                    });
                    d.setDate(d.getDate() - 1);
                }

                await delay(5000);
                console.log("here")

                // 2.) pull from cmc

                await cmcDataPull(cmcId, tokenName, process.env.CMC_KEY);

                // 3.) ttsync

                const ttObject = {
                    "NAME": tokenName,
                    "TTSLUG": ttslug
                }
                const time = '365d';
                // console.log(process.env.TT_BEARER);

                await syncActive(ttObject, time, process.env.TT_BEARER)
                await syncHolder(ttObject, time, process.env.TT_BEARER)
                await syncFee(ttObject, time, process.env.TT_BEARER)
                await syncTVL(ttObject, time, process.env.TT_BEARER)
                await syncTTV(ttObject, time, process.env.TT_BEARER)
            });
    } catch (error) {
        console.log(error);
    }

}

addNewToken("dYdX", "28324", "dydx");
const delay = ms => new Promise(res => setTimeout(res, ms));



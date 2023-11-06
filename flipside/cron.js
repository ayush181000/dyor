const mongoose = require('mongoose');
const { CronJob } = require('cron');

const dailyData = require("./dailyData");
const CONFIG = require("./config");

const TokenData = require('../models/tokenData');

console.log('Cron script executed')

const job = new CronJob(
    '0 12 * * *', // cronTime
    dailyCron, // onTick
    function () {
        console.log("Cron Job Succesfull")
    }, // onComplete
    true, // start
    'Asia/Kolkata' // timeZone
);


async function dailyCron() {
    // Database connection
    mongoose
        .connect(process.env.DATABASE, {
            useNewUrlParser: true
        })
        .then(() => {
            console.log('DB connection successful');
        });
    const date = getLocalDate();


    let data = {};
    // console.log(date);
    // return;


    //TVL DATA
    const tvlData = await dailyData.dailyTVLALL();

    //PRICE AND SUPPLY DATA
    let id = '';
    for (const TOKEN in CONFIG) {
        id = id + "," + CONFIG[TOKEN].CMC_ID;
    }
    const priceAndSupply = await dailyData.getSupplyAndPrice(id.substring(1));

    for (const TOKEN in CONFIG) {

        // const ttvData = await dailyData.dailyTTV(CONFIG[TOKEN]);
        const feeAndUserData = await dailyData.dailyFeeAndUser(CONFIG[TOKEN]);

        let tvl = 0;

        for (const item of tvlData) {
            if (
                CONFIG[TOKEN].SYMBOL == item.symbol ||
                CONFIG[TOKEN].SYMBOL == item.tokenSymbol
            ) {
                tvl += item.tvl;
            }
        }

        let price = 0;
        let circulatingSupply = 0;
        let totalSupply = 0;
        let fdv = 0
        let mcap = 0
        let volume = 0;

        const cmcData = priceAndSupply[CONFIG[TOKEN].CMC_ID];
        if (cmcData) {
            circulatingSupply = cmcData.circulating_supply;
            price = cmcData.quote.USD.price;
            totalSupply = cmcData.total_supply;
            fdv = cmcData.quote.USD.fully_diluted_market_cap;
            mcap = cmcData.quote.USD.market_cap;
            volume = cmcData.quote.USD.volume_24h;
        }

        const holders = await dailyData.dailyHolderData(CONFIG[TOKEN].CHAIN_ID, CONFIG[TOKEN].ADDRESS);

        const writtenData = await TokenData.create({
            tokenName: CONFIG[TOKEN].NAME,
            date: date,
            price: price === 'NA' ? null : price,
            tvl: tvl === 'NA' ? null : tvl,
            ttv: volume === 'NA' ? null : volume,
            fdv: fdv === 'NA' ? null : fdv,
            holders: holders === 'NA' ? null : holders,
            circulatingSupply: circulatingSupply === 'NA' ? null : circulatingSupply,
            totalSupply: totalSupply === 'NA' ? null : totalSupply,
            active_users: feeAndUserData.active_users === 'NA' ? null : feeAndUserData.active_users,
            daily_fee: feeAndUserData.daily_fee === 'NA' ? null : feeAndUserData.daily_fee,
        });

        data[TOKEN] = {
            date: date,
            name: CONFIG[TOKEN].NAME,
            tvl: tvl,
            price: price,
            circulatingSupply: circulatingSupply,
            totalSupply: totalSupply,
            ttv: volume,
            fdv: fdv,
            holders: holders,
            active_users: feeAndUserData.active_users,
            daily_fee: feeAndUserData.daily_fee,
        };

        // throw new Error("MAnually triggered");
    }

    console.log(data);

}

function getLocalDate() {
    // Create a new Date object for the current date and time
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const timeZoneOffsetInMinutes = -new Date().getTimezoneOffset();
    // console.log(currentDate)
    // console.log(timeZoneOffsetInMinutes)

    // Adjust the current date and time based on the time zone offset
    const currentDateInIndia = new Date(currentDate.getTime() + timeZoneOffsetInMinutes * 60000);


    return currentDateInIndia;
}

// dailyCron()
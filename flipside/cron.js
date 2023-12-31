const mongoose = require('mongoose');
const { CronJob } = require('cron');

const dailyData = require("./dailyData");
const CONFIG = require("./config");

const TokenData = require('../models/tokenData');
require("dotenv").config({ path: "../.env" });

console.log('Cron script executed')

const job = new CronJob(
  "0 * * * *", // cronTime
  dailyCron, // onTick
  function () {
    console.log("Cron Job Succesfull");
  }, // onComplete
  true, // start
  "Asia/Kolkata" // timeZone
);


async function dailyCron() {
  // Database connection
  mongoose
    .connect(process.env.DATABASE, {
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("DB connection successful");
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
        CONFIG[TOKEN].CMC_ID == item.cmcId ||
        CONFIG[TOKEN].CMC_ID == item.cmcId
      ) {
        console.log("LOOK HERE FOR TVL");
        console.log(item);
        tvl == 0 ? (tvl = item.tvl) : console.log("repeat tvl check");
      }
    }
    if (tvl == 0) {
      tvl = await dailyData.backupTVL(CONFIG[TOKEN]);
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
    let holders = 0;
    if (CONFIG[TOKEN].IDENTIFIER == "PROTOCOL")
      holders = await dailyData.dailyHolderData(CONFIG[TOKEN].CHAIN_ID, CONFIG[TOKEN].ADDRESS);


    //write staking ratio code foe avl lines
    const writtenData = await TokenData.findOneAndUpdate(
      { tokenName: CONFIG[TOKEN].NAME, date: date },
      {
        tokenName: CONFIG[TOKEN].NAME,
        date: date,
        price: price === "NA" ? null : price,
        tvl: tvl === "NA" ? null : tvl,
        ttv: volume === "NA" ? null : volume,
        fdv: fdv === "NA" ? null : fdv,
        holders: holders === "NA" ? null : holders,
        circulatingSupply:
          circulatingSupply === "NA" ? null : circulatingSupply,
        totalSupply: totalSupply === "NA" ? null : totalSupply,
        activeHolders:
          feeAndUserData.active_users === "NA"
            ? null
            : feeAndUserData.active_users,
        daily_fee:
          feeAndUserData.daily_fee === "NA"
            ? null
            : feeAndUserData.daily_fee,
      },
      { upsert: true }
    );

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
      activeHolders: feeAndUserData.active_users,
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
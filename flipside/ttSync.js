//This is a sync file that we run every 2 days to get sync data from TT
const CONFIG = require("./config");
const axios = require("axios");
const mongoose = require("mongoose");
const TokenData = require("../models/tokenData");
const { getCorrectedDate } = require("../utils/dateUtil");
const { CronJob } = require("cron");
require('dotenv').config({ path: '../.env' });


const delay = (ms) => new Promise((res) => setTimeout(res, ms));

console.log("TT SYNC IMPORT");

const job = new CronJob(
  "0 14 * * *", // cronTime
  TT, // onTick
  function () {
    console.log("TT SYNC COMPLETED");
  }, // onComplete
  true, // start
  "Asia/Kolkata" // timeZone
);

async function TT() {
  mongoose
    .connect(process.env.DATABASE, {
      useNewUrlParser: true,
    })
    .then(async () => {
      console.log("connected to db");

      for (const [key, value] of Object.entries(CONFIG)) {
        //add await with cron script
        await syncActive(value);
        await syncHolder(value);
        await syncFee(value);
        await syncTVL(value);
      }
    });

}


async function syncActive(value, time = '7d', TT_BEARER = process.env.TT_BEARER) {
  try {
    const name = value.NAME;

    const ttData = await axios.get(
      `https://api.tokenterminal.com/v2/internal/metrics/user_dau?project_ids=${value.TTSLUG}&interval=${time}`,
      {
        headers: {
          Authorization: TT_BEARER,
        },
      }
    );

    console.log("fetched active user data for " + name);

    ttData.data.data.forEach(async (el) => {
      const date = getCorrectedDate(el.timestamp);

      const newObject = {
        date: new Date(date),

        activeHolders: el.value,
      };

      // console.log("new object");
      // console.log(newObject);

      // const oldMongoEntry = await TokenData.findOne({ tokenName: name, date }) || {};

      const updatedMongoEntry = await TokenData.findOneAndUpdate(
        { tokenName: name, date: new Date(date) },
        { ...newObject },
        { new: true, upsert: true }
      );

      // console.log("updated mongo entry ");
      // console.log(updatedMongoEntry);
    });
    console.log("finished updating active user " + name);
    await delay(5000);


  } catch (error) {
    console.log(error);
  }

}

async function syncHolder(value, time = '7d', TT_BEARER = process.env.TT_BEARER) {
  try {
    const name = value.NAME;

    const ttData = await axios.get(
      `https://api.tokenterminal.com/v2/internal/metrics/tokenholders?project_ids=${value.TTSLUG}&interval=${time}`,
      {
        headers: {
          Authorization: TT_BEARER,
        },
      }
    );

    console.log("fetched holder data for " + name);

    ttData.data.data.forEach(async (el) => {
      const date = getCorrectedDate(el.timestamp);

      const newObject = {
        date: new Date(date),

        holders: el.value,
      };

      // console.log("new object");
      // console.log(newObject);

      // const oldMongoEntry = await TokenData.findOne({ tokenName: name, date }) || {};

      const updatedMongoEntry = await TokenData.findOneAndUpdate(
        { tokenName: name, date: new Date(date) },
        { ...newObject },
        { new: true, upsert: true }
      );

      // console.log("updated mongo entry ");
      // console.log(updatedMongoEntry);
    });
    console.log("finished updating holder " + name);
    await delay(5000);
  } catch (error) {
    console.log(error);
  }
}
async function syncFee(value, time = '7d', TT_BEARER = process.env.TT_BEARER) {
  try {
    const name = value.NAME;

    const ttData = await axios.get(
      `https://api.tokenterminal.com/v2/internal/metrics/fees?project_ids=${value.TTSLUG}&interval=${time}`,
      {
        headers: {
          Authorization: TT_BEARER,
        },
      }
    );

    console.log("fetched fee for " + name);

    ttData.data.data.forEach(async (el) => {
      const date = getCorrectedDate(el.timestamp);

      const newObject = {
        date: new Date(date),

        daily_fee: el.value,
      };

      // console.log("new object");
      // console.log(newObject);

      // const oldMongoEntry = await TokenData.findOne({ tokenName: name, date }) || {};

      const updatedMongoEntry = await TokenData.findOneAndUpdate(
        { tokenName: name, date: new Date(date) },
        { ...newObject },
        { new: true, upsert: true }
      );

      // console.log("updated mongo entry ");
      console.log(updatedMongoEntry);
    });
    console.log("finished updating fee " + name);
    await delay(5000);


  } catch (error) {
    console.log(error);
  }

}

async function syncTVL(value, time = '7d', TT_BEARER = process.env.TT_BEARER) {
  try {
    const name = value.NAME;

    const ttData = await axios.get(
      `https://api.tokenterminal.com/v2/internal/metrics/tvl?project_ids=${value.TTSLUG}&interval=${time}`,
      {
        headers: {
          Authorization: TT_BEARER,
        },
      }
    );

    console.log("fetched tvl for " + name);

    ttData.data.data.forEach(async (el) => {
      const date = getCorrectedDate(el.timestamp);

      const newObject = {
        date: new Date(date),

        tvl: el.value,
      };

      // console.log("new object");
      // console.log(newObject);

      // const oldMongoEntry = await TokenData.findOne({ tokenName: name, date }) || {};

      const updatedMongoEntry = await TokenData.findOneAndUpdate(
        { tokenName: name, date: new Date(date) },
        { ...newObject },
        { new: true, upsert: true }
      );

      // console.log("updated mongo entry ");
      // console.log(updatedMongoEntry);
    });
    console.log("finished updating tvl " + name);
    await delay(5000);
  } catch (error) {
    console.log(error);
  }
}


async function syncTTV(value, time = '7d', TT_BEARER = process.env.TT_BEARER) {
  try {
    const name = value.NAME;

    const ttData = await axios.get(
      `https://api.tokenterminal.com/v2/internal/metrics/token_trading_volume?project_ids=${value.TTSLUG}&interval=${time}`,
      {
        headers: {
          Authorization: TT_BEARER,
        },
      }
    );

    console.log("fetched ttv for " + name);

    ttData.data.data.forEach(async (el) => {
      const date = getCorrectedDate(el.timestamp);

      const newObject = {
        date: new Date(date),

        ttv: el.value,
      };

      // console.log("new object");
      // console.log(newObject);

      // const oldMongoEntry = await TokenData.findOne({ tokenName: name, date }) || {};

      const updatedMongoEntry = await TokenData.findOneAndUpdate(
        { tokenName: name, date: new Date(date) },
        { ...newObject },
        { new: true, upsert: true }
      );

      // console.log("updated mongo entry ");
      // console.log(updatedMongoEntry);
    });
    console.log("finished updating ttv " + name);
    await delay(5000);
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  syncActive,
  syncHolder,
  syncFee,
  syncTVL,
  syncTTV
}
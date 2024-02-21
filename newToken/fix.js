const TokenData = require("../models/tokenData");
const mongoose = require("mongoose");
const { getLocalDate, getCorrectedDate } = require("../utils/dateUtil");
const config = require("../flipside/config");
const axios = require('axios');
require("dotenv").config({ path: "../.env" });


const fix = async () =>{
    try {
      mongoose
        .connect(
          process.env.DATABASE,
          {
            useNewUrlParser: true,
          }
        )
        .then(async () => {

          for(const entry of res.data){
            console.log(entry);
            const correctedDate = getCorrectedDate(entry.labels);
            const updatedMongoEntry = await TokenData.findOneAndUpdate(
              { tokenName: "dYdX", date: new Date(correctedDate) },
              { activeHolders: entry.active_users }
            );
            await delay(1000);
          }


        });
    } catch (error) {
      console.log(error);
    }
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

fix();
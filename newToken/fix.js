const TokenData = require("../models/tokenData");
const mongoose = require("mongoose");
const { getLocalDate } = require("../utils/dateUtil");
const config = require("../flipside/config");


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
          for (const [key, value] of Object.entries(config)) {
              let token4 = await TokenData.find({
                tokenName: value.NAME,
                date: new Date("2024-01-04T00:00:00.000+00:00"),
              });
              token4 = token4[0];
              console.log(token4);
              const update = await TokenData.findOneAndUpdate(
                {
                  tokenName: value.NAME,
                  date: new Date("2024-01-07T00:00:00.000+00:00"),
                },
                {
                  circulatingSupply: token4.circulatingSupply,
                  fdv: token4.fdv,
                  price: token4.price,
                  totalSupply: token4.totalSupply,
                  ttv: token4.ttv,
                  tvl: token4.tvl,
                }
              );

              console.log(update);
            await delay(2000);
          }
        });
    } catch (error) {
      console.log(error);
    }
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

fix();
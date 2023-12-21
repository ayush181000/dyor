const axios = require('axios');
const TokenData = require('../models/tokenData');
const { getCorrectedDate } = require("../utils/dateUtil");

const delay = ms => new Promise(res => setTimeout(res, ms));


async function cmcDataPull(cmc_id, name, CMC_KEY) {
    try {

        // run axios
        const cmcData = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical?id=${cmc_id}&interval=24h&count=365`, {
            headers: {
                'X-CMC_PRO_API_KEY': CMC_KEY
            }
        });

        console.log('fetched data for ' + name);

        cmcData.data.data.quotes.forEach(async el => {
            const date = getCorrectedDate(el.timestamp);

            const newObject = {
                date: new Date(date),

                price: el.quote.USD.price,
                priceChangePercentages: `{\"7d\": ${el.quote.USD.percent_change_7d}, \"24h\": ${el.quote.USD.percent_change_24h}, \"30d\": ${el.quote.USD.percent_change_30d}`,

                circulatingSupply: el.quote.USD.circulating_supply,
                totalSupply: el.quote.USD.total_supply,
                ttv: el.quote.USD.volume_24h,
                marketCap: el.quote.USD.market_cap
            }

            // console.log("new object");
            // console.log(newObject);

            // const oldMongoEntry = await TokenData.findOne({ tokenName: name, date }) || {};

            const updatedMongoEntry = await TokenData.findOneAndUpdate({ tokenName: name, date: new Date(date) }, { ...newObject }, { new: true, upsert: true });

            // console.log("updated mongo entry ");
            // console.log(updatedMongoEntry);
        });

        console.log('finished updating ' + name);
        await delay(5000);
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = { cmcDataPull }
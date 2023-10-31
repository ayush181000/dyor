const dailyData = require("./dailyData");
const CONFIG = require("./config");

async function dailyCron(){
    const date = new Date();
    let data = {};

    //TVL DATA
    const tvlData = await dailyData.dailyTVLALL();

    //PRICE AND SUPPLY DATA
    let id = '';
    for(const TOKEN in CONFIG){
        id = id + "," +CONFIG[TOKEN].CMC_ID;
    }
    const priceAndSupply = await dailyData.getSupplyAndPrice(id.substring(1));

    for (const TOKEN in CONFIG) {
        
        // const ttvData = await dailyData.dailyTTV(CONFIG[TOKEN]);
        const feeAndUserData  = await dailyData.dailyFeeAndUser(CONFIG[TOKEN]);

        let tvl = 0;

        for(const item of tvlData ){
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
        if(cmcData){
            circulatingSupply = cmcData.circulating_supply;
            price = cmcData.quote.USD.price;
            totalSupply = cmcData.total_supply;
            fdv = cmcData.quote.USD.fully_diluted_market_cap;
            mcap = cmcData.quote.USD.market_cap;
            volume = cmcData.quote.USD.volume_24h;
        }

        const holders = await dailyData.dailyHolderData(CONFIG[TOKEN].CHAIN_ID,CONFIG[TOKEN].ADDRESS);

        data[TOKEN] = {
          date: date,
          name: CONFIG[TOKEN].NAME,
          tvl: tvl,
          price: price,
          circulatingSupply: circulatingSupply,
          totalSupply: totalSupply,
          ttv: volume,
          fdv : fdv,
          holders : holders,
          active_users: 'NA',
          daily_fee: feeAndUserData.daily_fee,
        };
    }

    console.log(data);

}


dailyCron()
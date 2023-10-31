const CONFIG = require("./config");
const TvlUtil = require("./tvlUtil");
const FeeProcessor = require("./charts/FeeAndUserDataChart");
const CmcProcessor = require("./processor/CmcProcessor");
const HolderDataProcessor = require("./processor/HolderDataProcessor");
const TTVProcessor = require("./processor/TokenTradingProcessor");

let data = {};

//This is referenced data fetched as curr - days.
async function referenceData(){
for (const TOKEN in CONFIG) {
  //TVL DATA
  const tvlDailyData = await TvlUtil.getHistoricalTVL(CONFIG[TOKEN].CHAIN);
  const calculatedTVL = TvlUtil.getTVLDataWithComparison(tvlDailyData);

  //FEE AND USER DATA
  const monthlyFee = await FeeProcessor.getFeeAndUserDataMonthly(
    CONFIG[TOKEN].CHAIN
  );
  const quaterlyFee = await FeeProcessor.getFeeAndUserDataQuaterly(
    CONFIG[TOKEN].CHAIN
  );
  const yearlyFee = await FeeProcessor.getFeeAndUserDataYearly(
    CONFIG[TOKEN].CHAIN
  );
  const last60Fee = await FeeProcessor.getFeeAndUserData60Days(
    CONFIG[TOKEN].CHAIN
  );

  //HOLDER COUNT DATA
  const holderData = await HolderDataProcessor(CONFIG[TOKEN]);

  //TTV DATA
  const ttvData = await TTVProcessor(CONFIG[TOKEN]);

  data[TOKEN] = {
    TVL: calculatedTVL,
    HOLDER: holderData,
    TTV: ttvData,
    FEE_USER: {
      monthly: monthlyFee,
      quater: quaterlyFee,
      year: yearlyFee,
      "60Day": last60Fee,
    },
  };

  console.log(data[TOKEN]);
}
}

//This data is fetched directly from cmc : PRICE
async function liveData(){
    let id = '';
    for(const TOKEN in CONFIG){
        id = id + "," +CONFIG[TOKEN].CMC_ID;
    }
    const data = await CmcProcessor(id.substring(1));
}

// script();
liveData();



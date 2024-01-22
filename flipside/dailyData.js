const flipside = require("./flipside");
const axios = require("axios");
const CONFIG = require("./config");


async function callFlipside(sql){
    try {
       const res = await flipside.query.run({ sql: sql });
       console.log(res.records);
       return res.records;
     } catch (error) {
       console.log(error);
     }
}

async function dailyFeeAndUser(CONFIG){

  if (CONFIG.NAME == "Osmosis") {
    const sql = `SELECT
     COUNT(DISTINCT TX_FROM) AS active_users
     FROM
     osmosis.core.fact_transactions
     WHERE
     DATE(BLOCK_TIMESTAMP) = CURRENT_DATE();`;

    try {
      // const res = await callFlipside(sql);
      // console.log(res[0]);
      const res2 = await axios.get(
        `https://api.llama.fi/overview/fees/osmosis?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyFees`
      );
      console.log(res2.data.total24h);
      return { active_users: "NA", daily_fee: res2.data.total24h };
    } catch (error) {
      console.log(error);
      try {
        const res = await axios.get(
          `https://api.llama.fi/summary/fees/${CONFIG.DEFISLUG}?dataType=dailyFees`
        );
        const fee = res.data.total24h;


        return { active_users: "NA", daily_fee: fee };
      } catch (error) {
        console.log(error);
        return { active_users: "NA", daily_fee: "NA" };
      }
    }
  }

    if(CONFIG.IDENTIFIER == "CHAIN"){
        const sql = `SELECT
     COUNT(DISTINCT FROM_ADDRESS) AS active_users,
     SUM(TX_FEE) AS daily_fee
     FROM
     ${CONFIG.CHAIN}.core.fact_transactions
     WHERE
     STATUS = 'SUCCESS' AND DATE(BLOCK_TIMESTAMP) = CURRENT_DATE();`;

        try {
            // const res = await callFlipside(sql);
            // console.log(res[0]);
            const res2 = await axios.get(
              `https://api.llama.fi/summary/fees/${CONFIG.DEFISLUG}?dataType=dailyFees`
            );
            console.log(res2.data.total24h);
            return { active_users: "NA", daily_fee: res2.data.total24h };
        } catch (error) {
            console.log(error);
            try {
              const res = await axios.get(
                `https://api.llama.fi/summary/fees/${CONFIG.DEFISLUG}?dataType=dailyFees`
              );
              const fee = res.data.total24h;
              return { active_users: "NA", daily_fee: fee };
            } catch (error) {
              console.log(error);
              return { active_users: "NA", daily_fee: "NA" };
            }
        }
    }
        //FIND A NEW DAILY ACTIVE USER LOGIC
    else{
        try {
            const res = await axios.get(
              `https://api.llama.fi/summary/fees/${CONFIG.DEFISLUG}?dataType=dailyFees`
            );
            const fee = res.data.total24h;

//             const sql = `SELECT
//   COUNT(DISTINCT FROM_ADDRESS) AS active_users
// FROM
//   ${CONFIG.CHAIN}.core.fact_transactions
// WHERE
//   TO_ADDRESS = '${CONFIG.ADDRESS}'
//   AND STATUS = 'SUCCESS'
//   AND DATE(BLOCK_TIMESTAMP) = CURRENT_DATE();`;
//                 const flip = await callFlipside(sql);
//                 console.log(flip[0]);



            return { active_users: "NA", daily_fee: fee };
        } catch (error) {
            console.log(error);
            return { active_users: "NA", daily_fee: "NA" };
        }

        
    }


    
}

//Deprecated
async function dailyTTV(CONFIG){

    let sql;

    if(CONFIG.SYMBOL == "ETH"){
        sql = `SELECT
    SUM(AMOUNT) AS total_amount
FROM
      ethereum.core.ez_eth_transfers
WHERE
    DATE(BLOCK_TIMESTAMP) = CURRENT_DATE();`;
    }
    else{
        sql = `SELECT
    SUM(RAW_AMOUNT) / POWER(10, ${CONFIG.DECIMAL} ) AS total_amount
FROM
      ${CONFIG.CHAIN}.core.ez_token_transfers
WHERE
    SYMBOL = '${CONFIG.SYMBOL}' AND DATE(BLOCK_TIMESTAMP) = CURRENT_DATE();`
    }

    try {
    const res = await callFlipside(sql);
    console.log(res[0].total_amount);
    return res[0].total_amount;
        
    } catch (error) {
        return 0;
    }
}

//fetches current TVL for all chains / protocol
async function dailyTVLALL(){
    try {
        const res = await axios.get(`https://api.llama.fi/v2/chains`);
        console.log(res.data);

        const res2 = await axios.get(`https://api.llama.fi/protocols`);
        console.log(res2.data);

        const result = res.data.concat(res2.data);
        return result;
    } catch (error) {
        console.log(error);
    }
    

}

//fetches price and Circulating Supply for specified chains and protocols
async function getSupplyAndPrice(ids) {
  try {
    res = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${ids}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.CMC_KEY,
        },
      }
    );

    const data = res.data;
    console.log(data.data);
    return data.data;
  } catch (error) {
    console.log(error);
  }
}

async function dailyHolderData(id ,address){
    // try {
    //     const res = await axios.get(
    //       `https://api.chainbase.online/v1/token/holders?chain_id=${id}&contract_address=${address}`,
    //       {
    //         headers: {
    //           "x-api-key": process.env.CHAINBASE_KEY,
    //         },
    //       }
    //     );

    //     console.log(res.data);
    //     return res.data.count;
        
    // } catch (error) {
    //     console.log(error);
    //     return 0;
    // }
    return 0;
}

async function backupTVL(CONFIG){
  try {
    const res = await axios.get(`https://api.llama.fi/tvl/${CONFIG.DEFISLUG}`);
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}



module.exports = {
  dailyTTV,
  dailyTVLALL,
  getSupplyAndPrice,
  dailyFeeAndUser,
  dailyHolderData,
  backupTVL,
};
// const flipside = require("../flipside");

// function getTTVSQL(days, CONFIG) {
//   if (days == 0) {
//     return `SELECT
//     SUM(RAW_AMOUNT) / POWER(10, ${CONFIG.DECIMAL}) AS total_amount
// FROM
//     ${CONFIG.CHAIN}.core.ez_token_transfers
// WHERE
//     SYMBOL = '${CONFIG.CHAIN}'
// `;
//   } else {
//     return `SELECT
//     SUM(RAW_AMOUNT) / POWER(10, ${CONFIG.DECIMAL}) AS total_amount
// FROM
//     ${CONFIG.CHAIN}.core.ez_token_transfers
// WHERE
//     SYMBOL = '${CONFIG.CHAIN}'
//   AND BLOCK_TIMESTAMP <= DATEADD(DAY, -${days}, CURRENT_TIMESTAMP())

// `;
//   }
// }

// async function getTokenTradingData(CONFIG) {
//   const currentSql = getTTVSQL(0, CONFIG);
//   const last30DaySql = getTTVSQL(30, CONFIG);
//   const last60DaySql = getTTVSQL(60, CONFIG);
//   const last90DaySql = getTTVSQL(90, CONFIG);
//   const last365DaySql = getTTVSQL(365, CONFIG);

//   try {
//     const currentQuery = await flipside.query.run({ sql: currentSql });
//     const last30DayQuery = await flipside.query.run({ sql: last30DaySql });
//     const last60DayQuery = await flipside.query.run({ sql: last60DaySql });
//     const last90DayQuery = await flipside.query.run({ sql: last90DaySql });
//     const last365DayQuery = await flipside.query.run({ sql: last365DaySql });

//     const currTTV = currentQuery.records[0].total_amount;
//     const last30DayTTV = last30DayQuery.records[0].total_amount;
//     const last60DayTTV = last60DayQuery.records[0].total_amount;
//     const last90DayTTV = last90DayQuery.records[0].total_amount;
//     const last365DayTTV = last365DayQuery.records[0].total_amount;

//     const result = {};
//     result.curr = currTTV;
//     result.last30day = last30DayTTV;
//     result.last30dayPerc = ((currTTV - last30DayTTV) / last30DayTTV) * 100;
//     result.last60day = last60DayTTV;
//     result.last60dayPerc = ((currTTV - last60DayTTV) / last60DayTTV) * 100;
//     result.last90day = last90DayTTV;
//     result.last90dayPerc = ((currTTV - last90DayTTV) / last90DayTTV) * 100;
//     result.last365day = last365DayTTV;
//     result.last365dayPerc = ((currTTV - last365DayTTV) / last365DayTTV) * 100;

//     console.log(result);
//     return result;
//   } catch (error) {
//     console.log(error);
//   }
// }

// module.exports = getTokenTradingData;

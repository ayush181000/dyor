// Think later

// const flipside = require("../flipside");

// function getSQL(days, symbol, chain) {
//   if (days == 0) {
//     return `
//     SELECT
//     COUNT(DISTINCT FROM_ADDRESS) AS active_users,
//     SUM(TX_FEE) AS total_fees_collected
//     FROM
//     ${chain}.core.fact_transactions
//     WHERE
//     STATUS = 'SUCCESS'
//     `;
//   } else {
//     return `
//     SELECT
//     COUNT(DISTINCT FROM_ADDRESS) AS active_users,
//     SUM(TX_FEE) AS total_fees_collected
//     FROM
//     ${chain}.core.fact_transactions
//     WHERE
//     STATUS = 'SUCCESS'
//     AND BLOCK_TIMESTAMP <= DATEADD(DAY, -${days}, CURRENT_TIMESTAMP())
//     `;
//   }
// }
// //find a way to speed up
// async function getTokenHolderCountData(CONFIG) {
//   const currentSql = getSQL(0, CONFIG.SYMBOL, CONFIG.CHAIN);
//   const last30DaySql = getSQL(30, CONFIG.SYMBOL, CONFIG.CHAIN);
//   const last60DaySql = getSQL(60, CONFIG.SYMBOL, CONFIG.CHAIN);
//   const last90DaySql = getSQL(90, CONFIG.SYMBOL, CONFIG.CHAIN);
//   const last365DaySql = getSQL(365, CONFIG.SYMBOL, CONFIG.CHAIN);

//   try {
//     const currentQuery = await flipside.query.run({ sql: currentSql });
//     const last30DayQuery = await flipside.query.run({ sql: last30DaySql });
//     const last60DayQuery = await flipside.query.run({ sql: last60DaySql });
//     const last90DayQuery = await flipside.query.run({ sql: last90DaySql });
//     const last365DayQuery = await flipside.query.run({ sql: last365DaySql });

//     const currHolder = currentQuery.records[0].user_count;
//     const last30DayHolder = last30DayQuery.records[0].user_count;
//     const last60DayHolder = last60DayQuery.records[0].user_count;
//     const last90DayHolder = last90DayQuery.records[0].user_count;
//     const last365DayHolder = last365DayQuery.records[0].user_count;

//     const result = {};
//     result.curr = currHolder;
//     result.last30day = last30DayHolder;
//     result.last30dayPerc =
//       ((currHolder - last30DayHolder) / last30DayHolder) * 100;
//     result.last60day = last60DayHolder;
//     result.last60dayPerc =
//       ((currHolder - last60DayHolder) / last60DayHolder) * 100;
//     result.last90day = last90DayHolder;
//     result.last90dayPerc =
//       ((currHolder - last90DayHolder) / last90DayHolder) * 100;
//     result.last365day = last365DayHolder;
//     result.last365dayPerc =
//       ((currHolder - last365DayHolder) / last365DayHolder) * 100;

//     console.log(result);
//     return result;
//   } catch (error) {
//     console.log(error);
//   }
// }

// module.exports = getTokenHolderCountData;

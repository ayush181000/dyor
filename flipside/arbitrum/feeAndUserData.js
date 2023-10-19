const flipside = require("../flipside");

//QueryResultSet
function calculatePercentage(res) {
  for (let i = 0; i < res.records.length; i++) {
    if (i == 0) {
      res.records[0].feeChange = "N.A";
      res.records[0].userChange = "N.A";
    } else {
      res.records[i].feeChange =
        ((res.records[i].total_fees_collected -
          res.records[i - 1].total_fees_collected) /
          res.records[i - 1].total_fees_collected) *
        100;

      res.records[i].userChange =
        ((res.records[i].active_users - res.records[i - 1].active_users) /
          res.records[i - 1].active_users) *
        100;
    }
  }
  console.log(res.records);
  return res.records;
}

async function getFeeAndUserDataQuaterly() {
  const sql = `
    SELECT
    DATE_TRUNC('quarter', BLOCK_TIMESTAMP) AS quarter,
    COUNT(DISTINCT FROM_ADDRESS) AS active_users,
    SUM(TX_FEE) AS total_fees_collected
    FROM
    arbitrum.core.fact_transactions
    WHERE
    STATUS = 'SUCCESS'
    GROUP BY
    quarter
    ORDER BY
    quarter;
    `;
  try {
    const res = await flipside.query.run({ sql: sql });
    return calculatePercentage(res)
  } catch (error) {
    console.log(error);
  }
}

async function getFeeAndUserDataMonthly() {
  const sql = `
    SELECT
    DATE_TRUNC('month', BLOCK_TIMESTAMP) AS month,
    COUNT(DISTINCT FROM_ADDRESS) AS active_users,
    SUM(TX_FEE) AS total_fees_collected
    FROM
    arbitrum.core.fact_transactions
    WHERE
    STATUS = 'SUCCESS'
    GROUP BY
    month
    ORDER BY
    month;
    `;
  try {
    const res = await flipside.query.run({ sql: sql });
    return calculatePercentage(res);
  } catch (error) {
    console.log(error);
  }
}

async function getFeeAndUserDataYearly() {
  const sql = `
    SELECT
    DATE_TRUNC('year', BLOCK_TIMESTAMP) AS year,
    COUNT(DISTINCT FROM_ADDRESS) AS active_users,
    SUM(TX_FEE) AS total_fees_collected
    FROM
    arbitrum.core.fact_transactions
    WHERE
    STATUS = 'SUCCESS'
    GROUP BY
    year
    ORDER BY
    year;
    `;
  try {
    const res = await flipside.query.run({ sql: sql });
    return calculatePercentage(res);
  } catch (error) {
    console.log(error);
  }
}

async function getFeeAndUserData60Days() {
  const sql = `
    SELECT
    DATEADD(DAY, 
            FLOOR(DATEDIFF(DAY, '1970-01-01', BLOCK_TIMESTAMP) / 60) * 60, 
            '1970-01-01') AS period_start,
    COUNT(DISTINCT FROM_ADDRESS) AS active_users,
    SUM(TX_FEE) AS total_fees_collected
    FROM
    arbitrum.core.fact_transactions
    WHERE
    STATUS = 'SUCCESS'
    GROUP BY
    period_start
    ORDER BY
    period_start;
    `;
  try {
    const res = await flipside.query.run({ sql: sql });
    return calculatePercentage(res);
  } catch (error) {
    console.log(error);
  }
}


module.exports = getFeeAndUserData60Days;

const flipside = require("../flipside");

//RENAME ALL FUNCTION TO BE OF ARBITRIUM

function calculatePercentage(res){
  for (let i = 0; i < res.records.length; i++) {
    if (i == 0) {
      res.records[0].change = "N.A";
    } else {
      res.records[i].change =
        ((res.records[i].contract_count - res.records[i - 1].contract_count) /
          res.records[i - 1].contract_count) *
        100;
    }
  }
  console.log(res.records);
  return res.records;
}

async function getContractOriginatedDataQuaterly() {
  const sql = `WITH ContractData AS (
    SELECT
        ADDRESS,
        SYMBOL,
        DECIMALS,
        CREATED_BLOCK_NUMBER,
        DATE_TRUNC('quarter', CREATED_BLOCK_TIMESTAMP) AS quarter
    FROM
        arbitrum.core.dim_contracts
)
SELECT
    quarter,
    COUNT(*) AS contract_count
FROM
    ContractData
GROUP BY
    quarter
ORDER BY
    quarter;
`;

  try {
    const res = await flipside.query.run({ sql: sql });
    return calculatePercentage(res);  
  } catch (e) {
    console.log(e);
  }
}

async function getContractOriginatedDataMonthly() {
  const sql = `WITH ContractData AS (
    SELECT
        ADDRESS,
        SYMBOL,
        DECIMALS,
        CREATED_BLOCK_NUMBER,
        DATE_TRUNC('month', CREATED_BLOCK_TIMESTAMP) AS month
    FROM
        arbitrum.core.dim_contracts
)
SELECT
    month,
    COUNT(*) AS contract_count
FROM
    ContractData
GROUP BY
    month
ORDER BY
    month;
`;

  try {
    const res = await flipside.query.run({ sql: sql });
    return calculatePercentage(res);
  } catch (e) {
    console.log(e);
  }
}

async function getContractOriginatedData60Days() {
  const sql = `WITH ContractData AS (
    SELECT
        ADDRESS,
        SYMBOL,
        DECIMALS,
        CREATED_BLOCK_NUMBER,
        DATEADD(DAY, 
            FLOOR(DATEDIFF(DAY, '1970-01-01', CREATED_BLOCK_TIMESTAMP) / 60) * 60, 
            '1970-01-01') AS period_start
    FROM
        arbitrum.core.dim_contracts
)
SELECT
    period_start AS start_date,
    COUNT(*) AS contract_count
FROM
    ContractData
GROUP BY
    period_start
ORDER BY
    period_start;
`;

  try {
    const res = await flipside.query.run({ sql: sql });
    return calculatePercentage(res);
  } catch (e) {
    console.log(e);
  }
}

async function getContractOriginatedDataYearly() {
  const sql = `WITH ContractData AS (
    SELECT
        ADDRESS,
        SYMBOL,
        DECIMALS,
        CREATED_BLOCK_NUMBER,
        DATE_TRUNC('year', CREATED_BLOCK_TIMESTAMP) AS year
    FROM
        arbitrum.core.dim_contracts
)
SELECT
    year,
    COUNT(*) AS contract_count
FROM
    ContractData
GROUP BY
    year
ORDER BY
    year;
`;

  try {
    const res = await flipside.query.run({ sql: sql });
    return calculatePercentage(res);
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  getContractOriginatedDataQuaterly,
  getContractOriginatedDataMonthly,
  getContractOriginatedData60Days,
  getContractOriginatedDataYearly,
};

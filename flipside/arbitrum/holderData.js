const flipside = require("../flipside");

function getSQL(days){
    if(days==0){
    return `WITH TokenMovements AS (
    SELECT
        FROM_ADDRESS AS USER_ADDRESS,
        SYMBOL,
        SUM(CASE WHEN SYMBOL = 'ARB' THEN -RAW_AMOUNT ELSE 0 END) AS TOKEN_MOVEMENT
    FROM
        arbitrum.core.ez_token_transfers
    WHERE
        SYMBOL = 'ARB'
    GROUP BY
        FROM_ADDRESS,
        SYMBOL

    UNION ALL

    SELECT
        TO_ADDRESS AS USER_ADDRESS,
        SYMBOL,
        SUM(CASE WHEN SYMBOL = 'ARB' THEN RAW_AMOUNT ELSE 0 END) AS TOKEN_MOVEMENT
    FROM
        arbitrum.core.ez_token_transfers
    WHERE
        SYMBOL = 'ARB' 
    GROUP BY
        TO_ADDRESS,
        SYMBOL
)
SELECT
    COUNT(DISTINCT(USER_ADDRESS)) as user_count
FROM
    TokenMovements`;
    }
    else{
         return `WITH TokenMovements AS (
    SELECT
        FROM_ADDRESS AS USER_ADDRESS,
        SYMBOL,
        SUM(CASE WHEN SYMBOL = 'ARB' THEN -RAW_AMOUNT ELSE 0 END) AS TOKEN_MOVEMENT
    FROM
        arbitrum.core.ez_token_transfers
    WHERE
        SYMBOL = 'ARB'
        AND BLOCK_TIMESTAMP <= DATEADD(DAY, -${days}, CURRENT_TIMESTAMP())
    GROUP BY
        FROM_ADDRESS,
        SYMBOL

    UNION ALL

    SELECT
        TO_ADDRESS AS USER_ADDRESS,
        SYMBOL,
        SUM(CASE WHEN SYMBOL = 'ARB' THEN RAW_AMOUNT ELSE 0 END) AS TOKEN_MOVEMENT
    FROM
        arbitrum.core.ez_token_transfers
    WHERE
        SYMBOL = 'ARB' 
        AND BLOCK_TIMESTAMP <= DATEADD(DAY, -${days}, CURRENT_TIMESTAMP())
    GROUP BY
        TO_ADDRESS,
        SYMBOL
)
SELECT
    COUNT(DISTINCT(USER_ADDRESS)) as user_count
FROM
    TokenMovements`;
    }
}
//find a way to speed up
async function getTokenHolderCountData() {
    const currentSql = getSQL(0);
    const last30DaySql = getSQL(30);
    const last60DaySql = getSQL(60);
    const last90DaySql = getSQL(90);
    const last365DaySql = getSQL(365);

  try {
    const currentQuery = await flipside.query.run({ sql: currentSql });
    const last30DayQuery = await flipside.query.run({ sql: last30DaySql });
    const last60DayQuery = await flipside.query.run({ sql: last60DaySql });
    const last90DayQuery = await flipside.query.run({ sql: last90DaySql });
    const last365DayQuery = await flipside.query.run({ sql: last365DaySql });

    const currHolder = currentQuery.records[0].user_count;
    const last30DayHolder = last30DayQuery.records[0].user_count;
    const last60DayHolder = last60DayQuery.records[0].user_count;
    const last90DayHolder = last90DayQuery.records[0].user_count;
    const last365DayHolder = last365DayQuery.records[0].user_count;

    const result = {};
    result.curr = currHolder;
    result.last30day = last30DayHolder;
    result.last30dayPerc = ((currHolder - last30DayHolder)/last30DayHolder) *100;
    result.last60day = last60DayHolder;
    result.last60dayPerc =
      ((currHolder - last60DayHolder) / last60DayHolder) * 100;
    result.last90day = last90DayHolder;
    result.last90dayPerc =
      ((currHolder - last90DayHolder) / last90DayHolder) * 100;
    result.last365day = last365DayHolder;
    result.last365dayPerc =
      ((currHolder - last365DayHolder) / last365DayHolder) * 100;

      console.log(result);
  } catch (error) {
    console.log(error);
  }
}

module.exports = getTokenHolderCountData;
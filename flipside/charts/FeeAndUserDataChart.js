const flipside = require("../flipside");
const feeAndUserDataUtil = require("../feeAndUserDataUtil");

async function getFeeAndUserDataQuaterly(chain) {
  const sql = feeAndUserDataUtil.getQuaterlyFeeAndUserDataSQL(chain);
  try {
    const res = await flipside.query.run({ sql: sql });
    return feeAndUserDataUtil.calculatePercentage(res);
  } catch (error) {
    console.log(error);
  }
}

async function getFeeAndUserDataMonthly(chain) {
  const sql = feeAndUserDataUtil.getMonthlyFeeAndUserDataSQL(chain);
  try {
    const res = await flipside.query.run({ sql: sql });
    return feeAndUserDataUtil.calculatePercentage(res);
  } catch (error) {
    console.log(error);
  }
}

async function getFeeAndUserDataYearly(chain) {
  const sql = feeAndUserDataUtil.getYearlyFeeAndUserDataSQL(chain);
  try {
    const res = await flipside.query.run({ sql: sql });
    return feeAndUserDataUtil.calculatePercentage(res);
  } catch (error) {
    console.log(error);
  }
}

async function getFeeAndUserData60Days(chain) {
  const sql = feeAndUserDataUtil.getLast60DayFeeAndUserDataSQL(chain);
  try {
    const res = await flipside.query.run({ sql: sql });
    return feeAndUserDataUtil.calculatePercentage(res);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getFeeAndUserDataQuaterly,
  getFeeAndUserDataMonthly,
  getFeeAndUserDataYearly,
  getFeeAndUserData60Days,
};

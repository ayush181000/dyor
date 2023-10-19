const flipside = require("../flipside");
const feeAndUserDataUtil = require("../feeAndUserDataUtil");

async function getArbFeeAndUserDataQuaterly() {
  const sql = feeAndUserDataUtil.getQuaterlyFeeAndUserDataSQL("ethereum");
  try {
    const res = await flipside.query.run({ sql: sql });
    return feeAndUserDataUtil.calculatePercentage(res);
  } catch (error) {
    console.log(error);
  }
}

async function getArbFeeAndUserDataMonthly() {
  const sql = feeAndUserDataUtil.getMonthlyFeeAndUserDataSQL("ethereum");
  try {
    const res = await flipside.query.run({ sql: sql });
    return feeAndUserDataUtil.calculatePercentage(res);
  } catch (error) {
    console.log(error);
  }
}

async function getArbFeeAndUserDataYearly() {
  const sql = feeAndUserDataUtil.getYearlyFeeAndUserDataSQL("ethereum");
  try {
    const res = await flipside.query.run({ sql: sql });
    return feeAndUserDataUtil.calculatePercentage(res);
  } catch (error) {
    console.log(error);
  }
}

async function getArbFeeAndUserData60Days() {
  const sql = feeAndUserDataUtil.getLast60DayFeeAndUserDataSQL("ethereum");
  try {
    const res = await flipside.query.run({ sql: sql });
    return feeAndUserDataUtil.calculatePercentage(res);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getArbFeeAndUserDataQuaterly,
  getArbFeeAndUserDataMonthly,
  getArbFeeAndUserDataYearly,
  getArbFeeAndUserData60Days,
};

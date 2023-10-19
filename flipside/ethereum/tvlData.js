const tvlUtil = require("../tvlUtil");

async function getEthTvlData() {
  const historicalTVL = await tvlUtil.getHistoricalTVL("Ethereum");
  const monthlyData = tvlUtil.getMonthlyTVL(historicalTVL);
  const yearlyData = tvlUtil.getYearlyTVL(historicalTVL);
  const quarterlyData = tvlUtil.getQuaterlyTVL(historicalTVL);
  const last60DayData = tvlUtil.get60DaysTVL(historicalTVL);

  return {
    success: true,
    monthlyData,
    yearlyData,
    quarterlyData,
    last60DayData,
  };
}

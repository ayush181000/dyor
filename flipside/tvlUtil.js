const axios = require("axios");

const DEFI_LLAMA_URL = `https://api.llama.fi/`;

async function getHistoricalTVL(chain) {
  try {
    const res = await axios.get(
      `${DEFI_LLAMA_URL}v2/historicalChainTvl/${chain}`
    );
    const convertedData = res.data.map((item) => ({
      date: timestampToDateString(item.date),
      tvl: item.tvl,
    }));
    console.log(convertedData);
    return convertedData;
  } catch (error) {
    console.log(error);
  }
}

function timestampToDateString(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toISOString().slice(0, 10);
}

function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return null;
  return ((newValue - oldValue) / oldValue) * 100;
}

function getTVLDataWithComparison(tvlData) {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const todayDateString = today.toISOString().slice(0, 10);
  const thirtyDaysAgoDateString = thirtyDaysAgo.toISOString().slice(0, 10);
  const sixtyDaysAgoDateString = sixtyDaysAgo.toISOString().slice(0, 10);
  const ninetyDaysAgoDateString = ninetyDaysAgo.toISOString().slice(0, 10);
  const oneYearAgoDateString = oneYearAgo.toISOString().slice(0, 10);

  let todayTVL = null;
  let thirtyDaysAgoTVL = null;
  let sixtyDaysAgoTVL = null;
  let ninetyDaysAgoTVL = null;
  let oneYearAgoTVL = null;

  for (const entry of tvlData) {
    if (entry.date === todayDateString) {
      todayTVL = entry.tvl;
    } else if (entry.date === thirtyDaysAgoDateString) {
      thirtyDaysAgoTVL = entry.tvl;
    } else if (entry.date === sixtyDaysAgoDateString) {
      sixtyDaysAgoTVL = entry.tvl;
    } else if (entry.date === ninetyDaysAgoDateString) {
      ninetyDaysAgoTVL = entry.tvl;
    } else if (entry.date === oneYearAgoDateString) {
      oneYearAgoTVL = entry.tvl;
    }
  }

  const percentageChanges = {
    "30 Days Change": calculatePercentageChange(thirtyDaysAgoTVL, todayTVL),
    "60 Days Change": calculatePercentageChange(sixtyDaysAgoTVL, todayTVL),
    "90 Days Change": calculatePercentageChange(ninetyDaysAgoTVL, todayTVL),
    "1 Year Change": calculatePercentageChange(oneYearAgoTVL, todayTVL),
  };

  return {
    today: todayTVL,
    last30day: thirtyDaysAgoTVL,
    last60day: sixtyDaysAgoTVL,
    last90day: ninetyDaysAgoTVL,
    lasyYear: oneYearAgoTVL,
    comparisons: percentageChanges,
  };
}

module.exports = { getHistoricalTVL, getTVLDataWithComparison };

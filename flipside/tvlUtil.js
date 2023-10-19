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
  return date.toDateString();
}

function getMonthlyTVL(dailyData) {
  const data = dailyData;
  const groupedData = {};
  data.forEach((item) => {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!groupedData[monthKey]) {
      groupedData[monthKey] = {
        month: monthKey,
        totalTvl: 0,
        count: 0,
      };
    }

    groupedData[monthKey].totalTvl += item.tvl;
    groupedData[monthKey].count++;
  });
  const values = Object.values(groupedData);
  for (let i = 0; i < values.length; i++) {
    if (i == 0) {
      values[0].change = "N.A";
    } else {
      values[i].change =
        ((values[i].totalTvl - values[i - 1].totalTvl) /
          values[i - 1].totalTvl) *
        100;
    }
  }

  console.log(values);
  return values;
}

function getYearlyTVL(dailyData) {
  const data = dailyData;
  const groupedData = {};
  data.forEach((item) => {
    const date = new Date(item.date);
    const yearKey = date.getFullYear().toString();

    if (!groupedData[yearKey]) {
      groupedData[yearKey] = {
        month: yearKey,
        totalTvl: 0,
        count: 0,
      };
    }

    groupedData[yearKey].totalTvl += item.tvl;
    groupedData[yearKey].count++;
  });
  const values = Object.values(groupedData);
  for (let i = 0; i < values.length; i++) {
    if (i == 0) {
      values[0].change = "N.A";
    } else {
      values[i].change =
        ((values[i].totalTvl - values[i - 1].totalTvl) /
          values[i - 1].totalTvl) *
        100;
    }
  }
  console.log(values);
  return values;
}

function getQuaterlyTVL(dailyData) {
  const data = dailyData;
  const groupedData = {};
  data.forEach((item) => {
    const date = new Date(item.date);
    const quarterKey = `${date.getFullYear()}-Q${Math.floor(
      (date.getMonth() + 3) / 3
    )}`;

    if (!groupedData[quarterKey]) {
      groupedData[quarterKey] = {
        month: quarterKey,
        totalTvl: 0,
        count: 0,
      };
    }

    groupedData[quarterKey].totalTvl += item.tvl;
    groupedData[quarterKey].count++;
  });
  const values = Object.values(groupedData);
  for (let i = 0; i < values.length; i++) {
    if (i == 0) {
      values[0].change = "N.A";
    } else {
      values[i].change =
        ((values[i].totalTvl - values[i - 1].totalTvl) /
          values[i - 1].totalTvl) *
        100;
    }
  }
  console.log(values);
  return values;
}

function get60DaysTVL(dailyData) {
  const data = dailyData;
  const groupedData = [];
  let currentIntervalStart = new Date(data[0].date);
  let intervalTvl = 0;

  for (const item of data) {
    const currentDate = new Date(item.date);
    while (currentDate - currentIntervalStart >= 60 * 24 * 60 * 60 * 1000) {
      // Push the interval data to the result
      groupedData.push({
        interval_start: currentIntervalStart.toDateString(),
        interval_end: new Date(
          currentIntervalStart.getTime() + 60 * 24 * 60 * 60 * 1000
        ).toDateString(),
        totalTvl: intervalTvl,
      });

      // Move to the next interval
      currentIntervalStart = new Date(
        currentIntervalStart.getTime() + 60 * 24 * 60 * 60 * 1000
      );
      intervalTvl = 0;
    }

    intervalTvl += item.tvl;
  }

  // Handle the last interval
  groupedData.push({
    interval_start: currentIntervalStart.toDateString(),
    interval_end: new Date(
      currentIntervalStart.getTime() + 60 * 24 * 60 * 60 * 1000
    ).toDateString(),
    totalTvl: intervalTvl,
  });

  const values = groupedData;
  for (let i = 0; i < values.length; i++) {
    if (i == 0) {
      values[0].change = "N.A";
    } else {
      values[i].change =
        ((values[i].totalTvl - values[i - 1].totalTvl) /
          values[i - 1].totalTvl) *
        100;
    }
  }
  console.log(values);
  return values;
}

module.exports = { getHistoricalTVL, getMonthlyTVL, getYearlyTVL, getQuaterlyTVL, get60DaysTVL };

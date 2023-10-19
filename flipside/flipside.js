const { Flipside } = require("@flipsidecrypto/sdk");
require("dotenv").config();

const flipside = new Flipside(
  process.env.FLIPSIDE_KEY,
  "https://api-v2.flipsidecrypto.xyz"
);

module.exports = flipside;

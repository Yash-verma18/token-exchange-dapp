const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ExchangeModule", (m) => {
  const exchangeContract = m.contract("Exchange", []);
  console.log("deployed contract Exchange", exchangeContract);
  return { exchangeContract };
});

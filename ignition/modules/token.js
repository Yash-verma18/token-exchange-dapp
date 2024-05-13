const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenModule", (m) => {
  const tokenContract = m.contract("Token", []);
  console.log("deployed contract Token", tokenContract);
  return { tokenContract };
});

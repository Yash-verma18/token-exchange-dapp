const { expect } = require("chai");
const { ethers } = require("hardhat");
// const { utils } = require("ethers");

const tokens = (n) => {
  return ethers.parseUnits(n.toString());
};

describe("Token", () => {
  let token;

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("Raymax", "RMX", 1000000);
  });

  describe("Deployment", () => {
    const name = "Raymax";
    const symbol = "RMX";
    const decimals = 18;
    const totalSupply = "1000000";

    it("has correct name", async () => {
      expect(await token.name()).to.equal(name);
    });

    it("has correct symbol", async () => {
      expect(await token.symbol()).to.equal(symbol);
    });
    it("has correct decimal", async () => {
      expect(await token.decimals()).to.equal(decimals);
    });
    it("has correct total supply", async () => {
      const value = tokens(totalSupply);
      // const value = ethers.parseUnits("1000000");

      expect(await token.totalSupply()).to.equal(value);
    });
  });

  // Describe Spending
  // Describe approving
  // Describe ..
});

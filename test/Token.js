const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.parseUnits(n.toString());
};

describe("Token", () => {
  let token, accounts, deployer;

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("Raymax", "RMX", 1000000);
    accounts = await ethers.getSigners();
    deployer = accounts[0];
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
    it("assigns total supply to deployer", async () => {
      const initialBalance = await token.balanceOf(deployer);
      console.log(`Initial balance: ${initialBalance.toString()}`);

      const value = tokens(totalSupply);
      expect(await token.balanceOf(deployer)).to.equal(value);

      const finalBalance = await token.balanceOf(deployer);
      console.log(`Final balance: ${finalBalance.toString()}`);
    });
  });

  // Describe Spending
  // Describe approving
  // Describe ..
});

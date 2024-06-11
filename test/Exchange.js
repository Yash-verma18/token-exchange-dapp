const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.parseUnits(n.toString());
};

describe("Exchange", () => {
  let deployer, feeAccount, exchange, token1;

  let feePercent = 10;

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory("Exchange");
    const Token = await ethers.getContractFactory("Token");

    token1 = await Token.deploy("Raymax", "RMX", 1000000);

    // deploy this token by user1

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];

    user1 = accounts[2];

    // Give some token to user1
    let transaction = await token1
      .connect(deployer)
      .transfer(user1.address, tokens(100));

    await transaction.wait();
    // await tokenBalanceOfUser1.wait();
    exchange = await Exchange.deploy(feeAccount.address, feePercent);
  });

  describe("Deployment", () => {
    it("tracks the fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });
    it("tracks the fee percent", async () => {
      expect(await exchange.feePercent()).to.equal(feePercent);
    });
  });

  describe("Depositing Token", () => {
    let transaction, result, depositResult;
    let amount = tokens(10);

    describe("Success", () => {
      beforeEach(async () => {
        // Approve Token
        transaction = await token1
          .connect(user1)
          .approve(exchange.target, amount);

        result = await transaction.wait();
        // Deposit Token
        transaction = await exchange
          .connect(user1)
          .depositToken(token1, amount);

        depositResult = await transaction.wait();
      });
      it("tracks the token deposit", async () => {
        expect(await token1.balanceOf(exchange.target)).to.equal(amount);
        expect(await exchange.tokens(token1, user1)).to.equal(amount);
        expect(await exchange.balanceOf(token1, user1)).to.equal(amount);
      });

      it("Emits a Deposit event", async () => {
        const iface = new ethers.Interface([
          "event Deposit(address token, address user, uint256 amount, uint256 balance)",
        ]);

        const depositEvent = await depositResult.logs
          .map((log) => {
            try {
              return iface.parseLog(log);
            } catch (error) {
              return null;
            }
          })
          .find((log) => log && log.name === "Deposit");

        expect(depositEvent).to.exist;
        expect(depositEvent.args.token).to.equal(token1);
        expect(depositEvent.args.user).to.equal(user1);
        expect(depositEvent.args.amount).to.equal(amount);
        expect(depositEvent.args.balance).to.equal(amount);
      });
    });
    describe("Failure", () => {
      it("Fails when no tokens are approved", async () => {
        await expect(
          exchange.connect(deployer).depositToken(token1, amount)
        ).to.be.revertedWith("insufficient allowance");
      });
    });
  });

  describe("Withdrawing Token", () => {
    let transaction, result, depositResult, withdrawResult;
    let amount = tokens(10);

    describe("Success", () => {
      beforeEach(async () => {
        // Approve Token
        transaction = await token1
          .connect(user1)
          .approve(exchange.target, amount);

        result = await transaction.wait();
        // Deposit Token
        transaction = await exchange
          .connect(user1)
          .depositToken(token1, amount);

        depositResult = await transaction.wait();

        // Withdraw Token
        transaction = await exchange
          .connect(user1)
          .withdrawToken(token1, amount);

        withdrawResult = await transaction.wait();
      });
      it("withdraws token funds", async () => {
        expect(await token1.balanceOf(exchange.target)).to.equal(0);
        expect(await exchange.tokens(token1, user1)).to.equal(0);
        expect(await exchange.balanceOf(token1, user1)).to.equal(0);
      });

      it("Emits a Withdraw event", async () => {
        const iface = new ethers.Interface([
          "event Withdraw(address token, address user, uint256 amount, uint256 balance)",
        ]);

        const withdrawEvent = await withdrawResult.logs
          .map((log) => {
            try {
              return iface.parseLog(log);
            } catch (error) {
              return null;
            }
          })
          .find((log) => log && log.name === "Withdraw");

        expect(withdrawEvent).to.exist;
        expect(withdrawEvent.args.token).to.equal(token1);
        expect(withdrawEvent.args.user).to.equal(user1);
        expect(withdrawEvent.args.amount).to.equal(amount);
        expect(withdrawEvent.args.balance).to.equal(0);
      });
    });
    describe("Failure", () => {
      it("Should Revert with Insufficient balance", async () => {
        await expect(
          exchange.connect(deployer).withdrawToken(token1, amount)
        ).to.be.revertedWith("Insufficient balance");
      });
    });
  });

  describe("Checking Balances", () => {
    let transaction, result, depositResult;
    let amount = tokens(1);

    beforeEach(async () => {
      // Approve Token
      transaction = await token1
        .connect(user1)
        .approve(exchange.target, amount);

      result = await transaction.wait();
      // Deposit Token
      transaction = await exchange.connect(user1).depositToken(token1, amount);

      depositResult = await transaction.wait();
    });
    it("returns user balance", async () => {
      expect(await exchange.balanceOf(token1, user1)).to.equal(amount);
    });
  });
});

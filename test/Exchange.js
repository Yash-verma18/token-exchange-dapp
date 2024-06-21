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
    token2 = await Token.deploy("Mock Dai", "mDAI", 1000000);

    // deploy this token by user1

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];

    user1 = accounts[2];
    user2 = accounts[3];

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

  describe("Making Orders", () => {
    let transaction, result;
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
        // Make Order
        transaction = await exchange
          .connect(user1)
          .makeOrder(token2, tokens(1), token1, tokens(1));
        result = await transaction.wait();
      });

      it("tracks the order", async () => {
        expect(await exchange.orderCount()).to.equal(1);
        const order = await exchange.orders(1);
        expect(order.id).to.equal(1);

        expect(order.user).to.equal(user1);
        expect(order.amountGive).to.equal(tokens(1));
        expect(order.amountGet).to.equal(tokens(1));
        expect(order.tokenGet).to.equal(token2);
        expect(order.tokenGive).to.equal(token1);
      });

      it("Emits a Order event", async () => {
        const iface = new ethers.Interface([
          "event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp)",
        ]);

        const orderEvent = await result.logs
          .map((log) => {
            try {
              return iface.parseLog(log);
            } catch (error) {
              return null;
            }
          })
          .find((log) => log && log.name === "Order");

        const args = orderEvent.args;

        console.log("args", args);

        expect(orderEvent).to.exist;
        expect(orderEvent.args.user).to.equal(user1);
        expect(orderEvent.args.tokenGet).to.equal(token2);
        expect(orderEvent.args.amountGet).to.equal(tokens(1));
        expect(orderEvent.args.tokenGive).to.equal(token1);
        expect(orderEvent.args.amountGive).to.equal(tokens(1));
        expect(args.timestamp).to.at.least(1);
      });
    });

    describe("Failure", () => {
      it("Should Revert with Insufficient balance", async () => {
        await expect(
          exchange
            .connect(user1)
            .makeOrder(token2, tokens(1), token1, tokens(1))
        ).to.be.revertedWith("Insufficient balance");
      });
    });
  });

  describe("Order actions", async () => {
    let transaction, result;
    let amount = tokens(10);
    let orderAmount = tokens(1);
    beforeEach(async () => {
      // Approve Token
      transaction = await token1
        .connect(user1)
        .approve(exchange.target, amount);

      result = await transaction.wait();
      // Deposit Token
      transaction = await exchange.connect(user1).depositToken(token1, amount);

      depositResult = await transaction.wait();
      // Make Order
      transaction = await exchange
        .connect(user1)
        .makeOrder(token2, orderAmount, token1, orderAmount);
      result = await transaction.wait();
    });

    describe("Cancelling orders", async () => {
      describe("Success", () => {
        beforeEach(async () => {
          transaction = await exchange.connect(user1).cancelOrder(1);
          result = await transaction.wait();
        });
        it("update canceled orders", async () => {
          expect(await exchange.orderCancelled(1)).to.equal(true);
        });

        it("Emits a Cancel event", async () => {
          const iface = new ethers.Interface([
            "event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp)",
          ]);

          const cancelEvent = await result.logs
            .map((log) => {
              try {
                return iface.parseLog(log);
              } catch (error) {
                return null;
              }
            })
            .find((log) => log && log.name === "Cancel");

          expect(cancelEvent).to.exist;
          expect(cancelEvent.args.user).to.equal(user1);
          expect(cancelEvent.args.tokenGet).to.equal(token2);
          expect(cancelEvent.args.amountGet).to.equal(orderAmount);
          expect(cancelEvent.args.tokenGive).to.equal(token1);
          expect(cancelEvent.args.amountGive).to.equal(orderAmount);
        });
      });
      describe("Failure", () => {
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
          // Make Order
          transaction = await exchange
            .connect(user1)
            .makeOrder(token2, orderAmount, token1, orderAmount);
          result = await transaction.wait();
        });

        it("Rejects invalids order id", async () => {
          const invalidOrderId = 1212;
          await expect(
            exchange.connect(user1).cancelOrder(invalidOrderId)
          ).to.be.revertedWith("Order does not exist");
        });

        it("Rejects if the order is not made by the user", async () => {
          await expect(
            exchange.connect(user2).cancelOrder(1)
          ).to.be.revertedWith("Not your order");
        });
      });
    });
  });
});

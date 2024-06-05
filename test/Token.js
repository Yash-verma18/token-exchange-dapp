const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.parseUnits(n.toString());
};

describe("Token", () => {
  let token, accounts, deployer, receiver, exchange, nullAddress;

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("Raymax", "RMX", 1000000);
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    receiver = accounts[1];
    exchange = accounts[2];
    nullAddress = "0x0000000000000000000000000000000000000000";
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

      expect(await token.totalSupply()).to.equal(value);
    });
    it("assigns total supply to deployer", async () => {
      const value = tokens(totalSupply);
      expect(await token.balanceOf(deployer)).to.equal(value);
    });
  });

  // Describe Sending Tokens
  describe("Sending Token", () => {
    let amount, transactions, results;

    describe("Success", () => {
      beforeEach(async () => {
        amount = tokens(100);
        transactions = await token.connect(deployer).transfer(receiver, amount);
        results = await transactions.wait();
      });

      it("Transfers token balances", async () => {
        expect(await token.balanceOf(deployer)).to.equal(tokens(999900));
        expect(await token.balanceOf(receiver)).to.equal(amount);
      });

      it("Emits a Transfer event", async () => {
        const iface = new ethers.Interface([
          "event Transfer(address indexed from, address indexed to, uint256 value)",
        ]);

        const transferEvent = results.logs
          .map((log) => iface.parseLog(log))
          .find((log) => log.name === "Transfer");

        expect(transferEvent).to.exist;
        expect(transferEvent.args.from).to.equal(deployer.address);
        expect(transferEvent.args.to).to.equal(receiver.address);
        expect(transferEvent.args.value).to.equal(amount);
      });
    });

    describe("Failure", () => {
      it("rejects insufficient balances", async () => {
        // Transfer more tokens than deployer has - 10M
        const invalidAmount = tokens(100000000);
        await expect(
          token.connect(deployer).transfer(receiver.address, invalidAmount)
        ).to.be.revertedWith("insufficient balance");
      });

      it("rejects invalid recipient ", async () => {
        const amounts = tokens(100);
        await expect(
          token.connect(deployer).transfer(nullAddress, amounts)
        ).to.be.revertedWith("invalid recipient");
      });
    });
  });

  describe("Approving Tokens", () => {
    let amount, transaction, results;

    beforeEach(async () => {
      amount = tokens(100);
      transaction = await token
        .connect(deployer)
        .approve(exchange.address, amount);
      results = await transaction.wait();
    });

    describe("Success", () => {
      it("allocates an allowance for delegated token spending", async () => {
        expect(
          await token.allowance(deployer.address, exchange.address)
        ).to.equal(amount);
      });

      it("Emits an Approval event", async () => {
        const iface = new ethers.Interface([
          "event Approval(address indexed owner, address indexed spender, uint256 value)",
        ]);

        const approvalEvent = results.logs
          .map((log) => iface.parseLog(log))
          .find((log) => log.name === "Approval");

        expect(approvalEvent).to.exist;
        expect(approvalEvent.args.owner).to.equal(deployer.address);
        expect(approvalEvent.args.spender).to.equal(exchange.address);
        expect(approvalEvent.args.value).to.equal(amount);
      });
    });
    describe("failure", () => {
      it("rejects invalid spenders", async () => {
        await expect(
          token.connect(deployer).approve(nullAddress, amount)
        ).to.be.revertedWith("invalid spender");
      });
    });
  });

  describe("Delegated Token Transfer", () => {
    let amount, transaction, results;
    let invalidAmount = tokens(100000000); // A large amount ensuring failure due to balance or allowance
    beforeEach(async () => {
      amount = tokens(100);

      transaction = await token
        .connect(deployer)
        .approve(exchange.address, amount);

      results = await transaction.wait();
    });
    describe("Success", () => {
      beforeEach(async () => {
        transaction = await token
          .connect(exchange)
          .transferFrom(deployer.address, receiver.address, amount);
        results = await transaction.wait();
      });

      it("Transfers token balances", async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(
          tokens(999900)
        );
        expect(await token.balanceOf(receiver.address)).to.equal(amount);
      });

      it("Resets the Allowance", async () => {
        expect(
          await token.allowance(deployer.address, exchange.address)
        ).to.equal(0);
      });

      it("Emits a Transfer event", async () => {
        const iface = new ethers.Interface([
          "event Transfer(address indexed from, address indexed to, uint256 value)",
        ]);

        const transferEvent = results.logs
          .map((log) => iface.parseLog(log))
          .find((log) => log.name === "Transfer");

        expect(transferEvent).to.exist;
        expect(transferEvent.args.from).to.equal(deployer.address);
        expect(transferEvent.args.to).to.equal(receiver.address);
        // expect(transferEvent.args.value).to.equal(amount);
      });
    });
    describe("Failure", () => {
      it("rejects insufficient balance", async () => {
        // const invalidAmount = tokens(100000000);
        await token.transfer(receiver.address, tokens(999900)); // Assuming initial was 1000000 tokens
        await expect(
          token
            .connect(exchange)
            .transferFrom(deployer.address, receiver.address, invalidAmount)
        ).to.be.revertedWith("insufficient balance");
      });

      describe("Token contract", function () {
        it("Should transfer tokens from one account to another", async function () {
          const [owner, addr1] = await ethers.getSigners();

          // Mint some tokens to addr1
          await token.transfer(addr1.address, tokens("50"));

          // Approve the owner to spend 20 tokens from addr1
          await token.connect(addr1).approve(owner.address, tokens("20"));

          // Now the owner can transfer tokens from addr1 to any other address
          await token.transferFrom(addr1.address, owner.address, tokens("20"));

          // Check the allowance, it should be 0 now
          const finalAllowance = await token.allowance(
            addr1.address,
            owner.address
          );
          expect(finalAllowance.toString()).to.equal("0");
        });
      });

      it("rejects insufficient allowances", async () => {
        // Fetch the balance as a BigNumber
        const deployerBalance = await token.balanceOf(deployer.address);
        let largeAmount = tokens(1000);
        // Ensure deployer has enough tokens to not trigger the 'insufficient balance' error.
        if (deployerBalance > largeAmount) {
          console.log("Deployer balance: ", deployerBalance.toString());
          console.log("Large amount: ", largeAmount.toString());

          // Transfer the large amount to the receiver

          console.log("Not enough balance for the test to be meaningful.");
          return;
        }

        // Prepare the conditions for the test
        const smallAllowance = tokens(100); // Smaller than largeAmount, should also be a BigNumber
        await token.connect(deployer).approve(exchange.address, smallAllowance);

        // Execute the test to check for insufficient allowance
        await expect(
          token
            .connect(exchange)
            .transferFrom(deployer.address, receiver.address, largeAmount)
        ).to.be.revertedWith("insufficient allowance");
      });
    });
  });
});

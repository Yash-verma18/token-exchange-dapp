const { ethers } = require("hardhat");

const config = require("../config.json");

/**
 * Utility Functions
 */

// Convert number to tokens
const tokens = (n) => {
  return ethers.parseUnits(n.toString());
};

const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/**
 * Main Function
 */
async function main() {
  try {
    console.log("Starting script execution...");

    // get current network chain id
    const chainId = await ethers.provider
      .getNetwork()
      .then((network) => network.chainId.toString());

    console.log("Using chainId", chainId);

    const accounts = await ethers.getSigners();

    // Contract addresses
    const dappAddress = config[chainId].DApp.address;
    const mEthAddress = config[chainId].mEth.address;
    const mDaiAddress = config[chainId].mDai.address;
    const exchangeAddress = config[chainId].exchange.address;

    console.log("DApp Token deployed to:", dappAddress);
    console.log("mEth Token deployed to:", mEthAddress);
    console.log("mDai Token deployed to:", mDaiAddress);
    console.log("Exchange deployed to:", exchangeAddress);

    // Get contract instances
    const DApp = await ethers.getContractAt("Token", dappAddress);
    const MEth = await ethers.getContractAt("Token", mEthAddress);
    const MDai = await ethers.getContractAt("Token", mDaiAddress);
    const Exchange = await ethers.getContractAt("Exchange", exchangeAddress);
    const sender = accounts[0];
    const receiver = accounts[1];
    let amount = tokens(10000);

    // Transfer mEth from user1 to user2
    // user1 transfers 10,000 mETH...
    await transferTokens(MEth, sender, receiver, amount);

    // Set up exchange for user1
    const user1 = accounts[0];
    const user2 = accounts[1];
    amount = tokens(10000);

    // user1 approves 10,000 Dapp..
    transaction = await DApp.connect(user1).approve(Exchange, amount);
    await transaction.wait();
    console.log(`User1 approved ${amount} tokens to exchange`);

    // user1 deposits 10,000 DApp... to exchange
    transaction = await Exchange.connect(user1).depositToken(
      dappAddress,
      amount
    );
    await transaction.wait();
    console.log(`User1 deposited ${amount} tokens to exchange`);

    // User 2 Approves mETH
    transaction = await MEth.connect(user2).approve(Exchange, amount);
    await transaction.wait();
    console.log(`User2 approved ${amount} tokens to exchange`);

    // User 2 Deposits mETH
    transaction = await Exchange.connect(user2).depositToken(
      mEthAddress,
      amount
    );
    await transaction.wait();
    console.log(`User2 deposited ${amount} tokens to exchange`);

    // Create and cancel an order
    await createAndCancelOrder(Exchange, user1, mEthAddress, dappAddress);

    // Create and fill multiple orders
    await createAndFillOrders(Exchange, user1, user2, mEthAddress, dappAddress);

    // Seed open orders
    await seedOpenOrders(Exchange, user1, user2, mEthAddress, dappAddress);

    console.log("successfully executed script...");
  } catch (error) {
    console.error("An error occurred in the main function:", error);
    process.exitCode = 1;
  }
}

// Execute main function
main().catch((error) => {
  console.error("Unhandled error in main function:", error);
  process.exitCode = 1;
});

/**
 * Helper Functions
 */

// Transfer tokens from one user to another
async function transferTokens(token, sender, receiverAddress, amount) {
  try {
    const transaction = await token
      .connect(sender)
      .transfer(receiverAddress, amount);
    await transaction.wait();
    console.log(
      `Transferred ${amount} tokens from ${sender.address} to ${receiverAddress.address}`
    );
  } catch (error) {
    console.error("Error in transferTokens:", error);
  }
}

// Set up exchange for a user
async function setupExchangeForUser(
  token,
  exchange,
  user,
  tokenAddress,
  amount
) {
  try {
    let transaction = await token
      .connect(user)
      .approve(exchange.address, amount);
    await transaction.wait();
    console.log(`User ${user.address} approved ${amount} tokens to exchange`);

    transaction = await exchange
      .connect(user)
      .depositToken(tokenAddress, amount);
    await transaction.wait();
    console.log(`User ${user.address} deposited ${amount} tokens to exchange`);
  } catch (error) {
    console.error("Error in setupExchangeForUser:", error);
  }
}

// Create and cancel an order
async function createAndCancelOrder(exchange, user, tokenGet, tokenGive) {
  try {
    let transaction = await exchange
      .connect(user)
      .makeOrder(tokenGet, tokens(100), tokenGive, tokens(5));
    let result = await transaction.wait();
    console.log("User created an order");

    const iface = new ethers.Interface([
      "event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp)",
    ]);

    // Find the Order event in the transaction receipt
    const orderEvent = result.logs
      .map((log) => {
        try {
          return iface.parseLog(log);
        } catch (error) {
          return null;
        }
      })
      .find((event) => event !== null && event.name === "Order");

    if (orderEvent) {
      console.log("Order ID:", orderEvent.args.id.toString());
    } else {
      console.log("No Order event found!");
    }

    const orderId = orderEvent.args.id.toString();
    transaction = await exchange.connect(user).cancelOrder(orderId);
    await transaction.wait();
    console.log("User cancelled the order");

    await wait(1);
  } catch (error) {
    console.error("Error in createAndCancelOrder:", error);
  }
}

// Create and fill multiple orders
async function createAndFillOrders(
  exchange,
  user1,
  user2,
  tokenGet,
  tokenGive
) {
  try {
    const orderDetails = [
      { amountGet: 100, amountGive: 10 },
      { amountGet: 50, amountGive: 15 },
      { amountGet: 200, amountGive: 20 },
    ];

    for (let i = 0; i < orderDetails.length; i++) {
      const { amountGet, amountGive } = orderDetails[i];

      let transaction = await exchange
        .connect(user1)
        .makeOrder(tokenGet, tokens(amountGet), tokenGive, tokens(amountGive));
      let result = await transaction.wait();
      console.log(`User1 made order ${i + 1}`);

      const iface = new ethers.Interface([
        "event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp)",
      ]);

      // Find the Order event in the transaction receipt
      const orderEvent = result.logs
        .map((log) => {
          try {
            return iface.parseLog(log);
          } catch (error) {
            return null;
          }
        })
        .find((event) => event !== null && event.name === "Order");

      if (orderEvent) {
        console.log("Order ID:", orderEvent.args.id.toString());
      } else {
        console.log("No Order event found!");
      }

      const orderId = orderEvent.args.id.toString();

      transaction = await exchange.connect(user2).fillOrder(orderId);
      await transaction.wait();
      console.log(`User2 filled order ${i + 1}`);

      await wait(1);
    }
  } catch (error) {
    console.error("Error in createAndFillOrders:", error);
  }
}

// Seed open orders
async function seedOpenOrders(exchange, user1, user2, tokenGet, tokenGive) {
  try {
    for (let i = 1; i <= 10; i++) {
      let transaction = await exchange
        .connect(user1)
        .makeOrder(tokenGet, tokens(10 * i), tokenGive, tokens(10));
      await transaction.wait();
      console.log(`User1 made order ${i}`);

      transaction = await exchange
        .connect(user2)
        .makeOrder(tokenGive, tokens(10), tokenGet, tokens(10 * i));
      await transaction.wait();
      console.log(`User2 made order ${i}`);

      await wait(1);
    }
  } catch (error) {
    console.error("Error in seedOpenOrders:", error);
  }
}

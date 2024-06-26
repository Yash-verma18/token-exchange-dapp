const { ethers } = require("hardhat");
const config = require("../config.json");

// Utility Functions
const tokens = (n) => ethers.parseUnits(n.toString());
const wait = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

// Contract Interaction Functions
async function getContractInstance(name, address) {
  try {
    return await ethers.getContractAt(name, address);
  } catch (error) {
    console.error(`Error getting ${name} contract instance:`, error);
    throw error;
  }
}

async function approveTokens(token, user, spender, amount) {
  try {
    const tx = await token.connect(user).approve(spender, amount);
    await tx.wait();
    console.log(
      `User ${user.address} approved ${amount} tokens for ${spender}`
    );
  } catch (error) {
    console.error("Error in approveTokens:", error);
    throw error;
  }
}

async function depositTokens(exchange, user, tokenAddress, amount) {
  try {
    const tx = await exchange.connect(user).depositToken(tokenAddress, amount);
    await tx.wait();
    console.log(
      `User ${user.address} deposited ${amount} tokens to the exchange`
    );
  } catch (error) {
    console.error("Error in depositTokens:", error);
    throw error;
  }
}

async function transferTokens(token, sender, receiver, amount) {
  try {
    const tx = await token.connect(sender).transfer(receiver.address, amount);
    await tx.wait();
    console.log(
      `Transferred ${amount} tokens from ${sender.address} to ${receiver.address}`
    );
  } catch (error) {
    console.error("Error in transferTokens:", error);
    throw error;
  }
}

async function makeOrder(
  exchange,
  user,
  tokenGet,
  amountGet,
  tokenGive,
  amountGive
) {
  try {
    const tx = await exchange
      .connect(user)
      .makeOrder(tokenGet, amountGet, tokenGive, amountGive);
    const receipt = await tx.wait();
    const orderEvent = receipt.logs.find((log) => log.eventName === "Order");
    const orderId = orderEvent.args.id;
    console.log(
      `User ${user.address} made order ${orderId}: ${amountGet} of ${tokenGet} for ${amountGive} of ${tokenGive}`
    );
    return orderId;
  } catch (error) {
    console.error("Error in makeOrder:", error);
    throw error;
  }
}

async function cancelOrder(exchange, user, orderId) {
  try {
    const tx = await exchange.connect(user).cancelOrder(orderId);
    await tx.wait();
    console.log(`User ${user.address} cancelled order ${orderId}`);
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    throw error;
  }
}

async function fillOrder(exchange, user, orderId) {
  try {
    const tx = await exchange.connect(user).fillOrder(orderId);
    await tx.wait();
    console.log(`User ${user.address} filled order ${orderId}`);
  } catch (error) {
    console.error("Error in fillOrder:", error);
    throw error;
  }
}

// Main Functions
async function setupExchange(DApp, MEth, Exchange, user1, user2, amount) {
  console.log("\n--- Setting up exchange ---");
  await approveTokens(DApp, user1, Exchange, amount);
  await depositTokens(Exchange, user1, DApp, amount);
  await approveTokens(MEth, user2, Exchange, amount);
  await depositTokens(Exchange, user2, MEth, amount);
}

async function createAndCancelOrder(Exchange, user, tokenGet, tokenGive) {
  console.log("\n--- Creating and cancelling an order ---");
  const orderId = await makeOrder(
    Exchange,
    user,
    tokenGet,
    tokens(100),
    tokenGive,
    tokens(5)
  );
  await cancelOrder(Exchange, user, orderId);
}

async function createAndFillMultipleOrders(
  Exchange,
  user1,
  user2,
  tokenGet,
  tokenGive
) {
  console.log("\n--- Creating and filling multiple orders ---");
  const orderDetails = [
    { amountGet: 100, amountGive: 10 },
    { amountGet: 50, amountGive: 15 },
    { amountGet: 200, amountGive: 20 },
  ];

  for (let i = 0; i < orderDetails.length; i++) {
    const { amountGet, amountGive } = orderDetails[i];
    const orderId = await makeOrder(
      Exchange,
      user1,
      tokenGet,
      tokens(amountGet),
      tokenGive,
      tokens(amountGive)
    );
    await fillOrder(Exchange, user2, orderId);
    await wait(1);
  }
}

async function seedOpenOrders(Exchange, user1, user2, tokenGet, tokenGive) {
  console.log("\n--- Seeding open orders ---");
  for (let i = 1; i <= 10; i++) {
    await makeOrder(
      Exchange,
      user1,
      tokenGet,
      tokens(10 * i),
      tokenGive,
      tokens(10)
    );
    await makeOrder(
      Exchange,
      user2,
      tokenGive,
      tokens(10),
      tokenGet,
      tokens(10 * i)
    );
    await wait(1);
  }
}

async function main() {
  try {
    console.log("Starting script execution...");

    const [user1, user2] = await ethers.getSigners();
    const chainId = (await ethers.provider.getNetwork()).chainId.toString();
    console.log(`Using chainId: ${chainId}`);

    const { DApp, mEth, mDai, exchange } = config[chainId];

    console.log("\n--- Contract Addresses ---");
    console.log(`DApp Token: ${DApp.address}`);
    console.log(`mEth Token: ${mEth.address}`);
    console.log(`mDai Token: ${mDai.address}`);
    console.log(`Exchange: ${exchange.address}`);

    const DAppContract = await getContractInstance("Token", DApp.address);
    const MEthContract = await getContractInstance("Token", mEth.address);
    const MDaiContract = await getContractInstance("Token", mDai.address);
    const ExchangeContract = await getContractInstance(
      "Exchange",
      exchange.address
    );

    const amount = tokens(10000);

    await transferTokens(MEthContract, user1, user2, amount);
    await setupExchange(
      DAppContract,
      MEthContract,
      ExchangeContract,
      user1,
      user2,
      amount
    );
    await createAndCancelOrder(
      ExchangeContract,
      user1,
      mEth.address,
      DApp.address
    );
    await createAndFillMultipleOrders(
      ExchangeContract,
      user1,
      user2,
      mEth.address,
      DApp.address
    );
    await seedOpenOrders(
      ExchangeContract,
      user1,
      user2,
      mEth.address,
      DApp.address
    );

    console.log("\n--- Script Execution Summary ---");
    console.log("1. Transferred 10,000 mEth tokens from deployer to user2");
    console.log(
      "2. Set up exchange for user1 (DApp tokens) and user2 (mEth tokens)"
    );
    console.log("3. Created and cancelled an order by user1");
    console.log("4. Created and filled 3 orders between user1 and user2");
    console.log("5. Seeded 20 open orders (10 each from user1 and user2)");
    console.log("\nScript executed successfully!");
  } catch (error) {
    console.error("An error occurred in the main function:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Unhandled error in main function:", error);
  process.exitCode = 1;
});

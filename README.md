Welcome to the Token Exchange DApp, an innovative decentralized application inspired by renowned decentralized exchanges like Uniswap and 1inch. This DApp is designed to facilitate seamless token trading on the Ethereum blockchain, allowing users to deposit, withdraw, and make token orders with ease. Powered by Solidity and a tech stack that includes Next.js, Tailwind, and Ether.js, this project exemplifies how modern decentralized finance (DeFi) platforms operate, providing a streamlined user experience with robust security features.


# Token Exchange DApp

## Overview

The Token Exchange DApp is a decentralized application inspired by leading DeFi platforms like Uniswap and 1inch. Built with a combination of Hardhat, Solidity, and Next.js, this DApp provides a user-friendly interface for token trading. Whether you're looking to deposit, withdraw, or trade tokens, this platform is designed to make your decentralized trading experience as smooth as possible. The project showcases the power of Ethereum smart contracts and modern web development frameworks in creating secure and efficient decentralized exchanges.

## Features

- **Deposit Tokens**: Securely deposit your tokens into the exchange contract.
- **Withdraw Tokens**: Withdraw your tokens from the exchange with ease.
- **Make Orders**: Create buy or sell orders for tokens, allowing for peer-to-peer trading.

## Tech Stack

- **Next.js**: Frontend framework for building fast and scalable web applications.
- **Shadcn**: A Tailwind CSS integrated design system for streamlined UI development.
- **Tailwind CSS**: Utility-first CSS framework for custom design.
- **Solidity**: Programming language used for writing the Ethereum smart contracts.
- **TypeScript**: Ensures type safety across the entire project.
- **Ether.js**: Library for interacting with the Ethereum blockchain.
- **Redux**: Manages the global state of the application, ensuring seamless user interactions.

## Getting Started

### Prerequisites

Before running the project, ensure you have the following installed:

- Node.js (v14 or later)
- Yarn (or npm)
- Hardhat
- MetaMask or an equivalent Ethereum wallet

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Yash-verma18/token-exchange-dapp.git
   cd token-exchange-dapp
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   ```

### Running the Project

1. **Start the Hardhat local node**:

   ```bash
   npx hardhat node
   ```

2. **Deploy the tokens**:

   Deploy the `Token.sol` and `Exchange.sol` contracts to your local Hardhat network:

   ```bash
   npx hardhat ignition deploy ignition/modules/deploy.js --network localhost
   ```

3. **Seed the Exchange Contract**:

   Initialize the exchange with sample data by running:

   ```bash
   npx hardhat run scripts/seed_exchange_modular.js --network localhost
   ```

4. **Run the Next.js development server**:

   ```bash
   yarn dev
   ```

   Navigate to `http://localhost:3000` in your browser to interact with the DApp.

## Project Structure

- **abis/**: Contains the ABI files for the smart contracts.
- **artifacts/**: Generated files from the contract compilation.
- **components/**: Reusable React components.
- **contracts/**: Contains the Solidity smart contracts (`Token.sol`, `Exchange.sol`).
- **ignition/**: Deployment scripts for Hardhat.
- **redux/**: Redux store and slices for state management.
- **scripts/**: Scripts for deploying and seeding contracts.
- **test/**: Unit tests for smart contracts.

## Smart Contracts

### Token.sol

This contract is the core of the DApp, responsible for creating and managing the ERC-20 tokens. Key functions and events include:

- **Functions**:
  - `constructor(string memory _name, string memory _symbol, uint256 _totalSupply)`: Initializes the token with a name, symbol, and total supply.
  - `transfer(address _to, uint256 _value)`: Transfers tokens from the sender's account to the specified address.
  - `approve(address _spender, uint256 _value)`: Allows the specified spender to withdraw from the sender's account multiple times, up to the specified value.
  - `transferFrom(address _from, address _to, uint256 _value)`: Transfers tokens from one account to another using an allowance.

- **Events**:
  - `Transfer(address indexed from, address indexed to, uint256 value)`: Emitted when tokens are transferred.
  - `Approval(address indexed owner, address indexed spender, uint256 value)`: Emitted when a spender is approved to transfer tokens on behalf of the owner.

### Exchange.sol

The Exchange contract facilitates token trading on the platform. Users can deposit, withdraw, and trade tokens using the following functions and events:

- **Functions**:
  - `depositToken(address _token, uint256 _amount)`: Allows users to deposit tokens into the exchange.
  - `withdrawToken(address _token, uint256 _amount)`: Allows users to withdraw tokens from the exchange.
  - `balanceOf(address _token, address _user)`: Returns the balance of a user's tokens in the exchange.
  - `makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive)`: Creates an order for token trading.
  - `cancelOrder(uint256 _id)`: Cancels an open order.
  - `fillOrder(uint256 _id)`: Fills an open order, executing the trade.

- **Events**:
  - `Deposit(address token, address user, uint256 amount, uint256 balance)`: Emitted when a deposit is made.
  - `Withdraw(address token, address user, uint256 amount, uint256 balance)`: Emitted when a withdrawal is made.
  - `Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp)`: Emitted when an order is created.
  - `Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp)`: Emitted when an order is canceled.
  - `Trade(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address creator, uint256 timestamp)`: Emitted when a trade is executed.

### Contributing

Contributions are always welcome! Feel free to fork this repository, submit issues, or create pull requests to help improve the project.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

```

This version includes all the details about your project, including the structure, key functions, and events within your smart contracts. The writing style is crafted to be engaging while still precise and informative. Let me know if you'd like any further adjustments!

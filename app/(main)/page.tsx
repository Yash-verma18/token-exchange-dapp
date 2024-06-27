"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Contract } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import TOKEN_ABI from "../../abis/Token.json";

// Define a type for the structure of each network configuration
interface NetworkConfig {
  DApp: { address: string };
  mEth: { address: string };
  mDai: { address: string };
  exchange: { address: string };
}

// Define the overall configuration type mapping chain IDs to their configs
interface Config {
  [key: string]: NetworkConfig;
}
export default function LandingPage() {
  const config: Config = require("../../config.json");

  console.log("config", config);

  const loadBlockchainData = async () => {
    /* 
      This line of code makes a request to the user's Ethereum provider (typically injected by browser extensions like MetaMask) to enable the app to access the user's Ethereum accounts.
      The 'eth_requestAccounts' method prompts the user to grant your website access to their Ethereum accounts. If the user consents, the promise resolves to an array of account addresses that the app can use.
      This is necessary for interacting with the blockchain on behalf of the user, such as displaying their account balance, initiating transactions, etc.
      The `await` keyword is used here to ensure that the JavaScript execution pauses until the user responds to the MetaMask prompt, allowing the application to behave asynchronously in a more predictable manner.
    */
    if (window.ethereum) {
      const accounts: any = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts[0]);

      // Connect Ethers to blockchain
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const { chainId } = await provider.getNetwork();

      // Token Smart Contract
      const token = new Contract(
        config[chainId].mEth.address,
        TOKEN_ABI,
        signer as any
      );

      const symbol = await token.symbol();
      const name = await token.name();
      const totalSupply = await token.totalSupply();
      const balance = await token.balanceOf(accounts[0]);
      console.log({
        symbol,
        name,
        totalSupply: totalSupply.toString(),
        balance: balance.toString(),
      });
    } else {
      console.error("Ethereum object not found, install MetaMask.");
    }
  };

  useEffect(() => {
    loadBlockchainData();
  });
  return (
    <>
      <h1 className="flex gap-2 items-center">Token Exchange Dapp</h1>
      <p>The best decentralize exchange</p>
    </>
  );
}

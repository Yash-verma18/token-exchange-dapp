"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadAccount,
  loadExchange,
  loadProvider,
  loadTokens,
} from "@/redux/interaction";

export default function LandingPage() {
  const account = useSelector((state: any) => state.account.account);
  const chainId = useSelector((state: any) => state.account.chainId);
  const dispatch = useDispatch();
  const config = require("../../config.json");

  const loadBlockchainData = async () => {
    if (window.ethereum) {
      if (account === null) {
        // Load provider, account, tokens, exchange
        const { provider, chainId } = await loadProvider(dispatch);

        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", () => {
          loadAccount(provider, dispatch);
        });
        const Dapp: any = config[chainId]?.DApp;
        const mEth: any = config[chainId]?.mEth;
        const token = await loadTokens(
          provider,
          [Dapp?.address, mEth?.address],
          dispatch
        );
        const exchange = config[chainId]?.exchange;
        await loadExchange(provider, exchange.address, dispatch);
      }
    } else {
      console.error("Ethereum object not found, install MetaMask.");
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <>
      <h1 className="flex gap-2 items-center">Token Exchange Dapp</h1>
      <p>The best decentralize exchange</p>
      {account && (
        <div>
          <h1>account : {account}</h1>
          <h1>chainId : {chainId}</h1>
        </div>
      )}
    </>
  );
}

"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadAccount, loadProvider, loadToken } from "@/redux/interaction";

export default function LandingPage() {
  const dispatch = useDispatch();
  const config = require("../../config.json");
  const loadBlockchainData = async () => {
    if (window.ethereum) {
      const account = await loadAccount(dispatch);
      const { provider, chainId } = await loadProvider(dispatch);
      const token = await loadToken(
        provider,
        config[chainId]?.mEth?.address,
        dispatch
      );
    } else {
      console.error("Ethereum object not found, install MetaMask.");
    }
  };

  useEffect(() => {
    loadBlockchainData();
  });

  const account = useSelector((state: any) => state.account.account);
  const chainId = useSelector((state: any) => state.account.chainId);

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

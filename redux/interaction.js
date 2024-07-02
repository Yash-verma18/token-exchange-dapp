import { Contract } from "ethers";
import TOKEN_ABI from "@/abis/Token.json";
import EXCHANGE_ABI from "@/abis/Exchange.json";
import { Web3Provider } from "@ethersproject/providers";
import {
  setAccount,
  setChainId,
  setProvider,
  setSigner,
  setBalance,
} from "@/redux/accountSlice";

import { setContract, setSymbol, setLoaded } from "@/redux/tokenSlice";
import { setExchangeContract, setExchangeLoaded } from "@/redux/exchangeSlice";

export const loadProvider = async (dispatch) => {
  const provider = new Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const chainId = await provider
    .getNetwork()
    .then((network) => network.chainId);
  dispatch(setProvider(provider));
  dispatch(setSigner(signer));
  dispatch(setChainId(chainId));
  return { provider, signer, chainId };
};

export const loadAccount = async (provider, dispatch) => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = accounts[0];
  dispatch(setAccount(account));

  // balance
  const balance = await provider.getBalance(account);
  dispatch(setBalance(balance.toString()));

  return account;
};

export const loadTokens = async (providerOrSigner, addresses, dispatch) => {
  const contract1 = new Contract(addresses[0], TOKEN_ABI, providerOrSigner);
  const symbol1 = await contract1.symbol();
  dispatch(setLoaded(true));
  dispatch(setSymbol(symbol1));
  dispatch(setContract(contract1));

  const contract2 = new Contract(addresses[1], TOKEN_ABI, providerOrSigner);
  const symbol2 = await contract2.symbol();
  dispatch(setSymbol(symbol2));
  dispatch(setContract(contract2));
  return [contract1, contract2];
};

export const loadExchange = async (providerOrSigner, address, dispatch) => {
  const contract = new Contract(address, EXCHANGE_ABI, providerOrSigner);
  dispatch(setExchangeLoaded(true));
  dispatch(setExchangeContract(contract));
  return contract;
};

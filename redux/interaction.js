import { Contract } from "ethers";
import TOKEN_ABI from "@/abis/Token.json";
import { Web3Provider } from "@ethersproject/providers";
import {
  setAccount,
  setChainId,
  setProvider,
  setSigner,
} from "@/redux/accountSlice";

import { setContract, setSymbol } from "@/redux/tokenSlice";

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

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = accounts[0];
  dispatch(setAccount(account));
  return account;
};

export const loadToken = async (providerOrSigner, address, dispatch) => {
  const contract = new Contract(address, TOKEN_ABI, providerOrSigner);
  const symbol = await contract.symbol();
  dispatch(setSymbol(symbol));
  dispatch(setContract(contract));
  return contract;
};

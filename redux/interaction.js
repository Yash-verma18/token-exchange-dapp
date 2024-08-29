import { Contract } from 'ethers';
import TOKEN_ABI from '@/abis/Token.json';
import EXCHANGE_ABI from '@/abis/Exchange.json';
import { Web3Provider } from '@ethersproject/providers';
import {
  setAccount,
  setChainId,
  setProvider,
  setSigner,
  setBalance,
} from '@/redux/accountSlice';
import { ethers } from 'ethers';
import {
  setToken1Balance,
  setToken2Balance,
  token1Loaded,
  token2Loaded,
} from '@/redux/tokenSlice';
import {
  addNewOrder,
  setExchangeContract,
  setExchangeLoaded,
  setExchangeToken1Balance,
  setExchangeToken2Balance,
  setTransferFail,
  setTransferRequest,
  setNewOrderFail,
  newOrderRequest,
} from '@/redux/exchangeSlice';

import {
  checkDepositEventEmitted,
  checkWithdrawEventEmitted,
  checkOrderEventEmitted,
} from '@/redux/eventEmitted';

// const formatTokens = (n) => {
//   return ethers.parseUnits(n.toString());
// };

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
    method: 'eth_requestAccounts',
  });
  const account = accounts[0];
  dispatch(setAccount(account));

  // balance
  const balance = await provider.getBalance(account);
  dispatch(setBalance(balance.toString()));

  return account;
};

export const loadTokens = async (providerOrSigner, addresses, dispatch) => {
  try {
    const contract1 = new Contract(addresses[0], TOKEN_ABI, providerOrSigner);
    const symbol1 = await contract1.symbol();
    dispatch(
      token1Loaded({
        contract: contract1,
        symbol: symbol1,
      })
    );

    const contract2 = new Contract(addresses[1], TOKEN_ABI, providerOrSigner);
    const symbol2 = await contract2.symbol();
    dispatch(
      token2Loaded({
        contract: contract2,
        symbol: symbol2,
      })
    );

    return [contract1, contract2];
  } catch (error) {
    console.log('error in loadTokens', error);
  }
};

export const loadExchange = async (providerOrSigner, address, dispatch) => {
  const contract = new Contract(address, EXCHANGE_ABI, providerOrSigner);
  dispatch(setExchangeLoaded(true));
  dispatch(setExchangeContract(contract));
  return contract;
};

// Load User Balances (wallets & exchange)
// export const

export const loadBalances = async (exchange, tokens, account, dispatch) => {
  try {
    const token1 = tokens.token1.contract;
    const token2 = tokens.token2.contract;
    const exchangeContract = exchange.contract;

    const balance1 = ethers.formatUnits(await token1.balanceOf(account), 18);
    const balance2 = ethers.formatUnits(await token2.balanceOf(account), 18);

    dispatch(setToken1Balance(balance1));
    dispatch(setToken2Balance(balance2));

    const exchangeBalanceToken1 = ethers.formatUnits(
      await exchangeContract.balanceOf(token1.target, account),
      18
    );

    const exchangeBalanceToken2 = ethers.formatUnits(
      await exchangeContract.balanceOf(token2.target, account),
      18
    );

    dispatch(setExchangeToken1Balance(exchangeBalanceToken1));
    dispatch(setExchangeToken2Balance(exchangeBalanceToken2));
  } catch (error) {
    console.log('error in loadBalances', error);
  }
};

export const transferTokens = async (
  signer,
  exchange,
  token,
  amount,
  dispatch,
  transferType
) => {
  try {
    dispatch(setTransferRequest());

    let transaction;

    const amountToTransfer = ethers.parseUnits(amount.toString(), 18);

    if (transferType === 'Deposit') {
      transaction = await token
        .connect(signer)
        .approve(exchange.target, amountToTransfer);

      await signer.provider.waitForTransaction(transaction.hash);

      console.log('Approval transaction mined');
      transaction = await exchange
        .connect(signer)
        .depositToken(token.target, amountToTransfer);

      const receipt = await signer.provider.waitForTransaction(
        transaction.hash
      );
      console.log('Deposit transaction mined:', receipt);

      await checkDepositEventEmitted(receipt, dispatch);
    } else {
      transaction = await exchange
        .connect(signer)
        .withdrawToken(token.target, amountToTransfer);

      const receipt = await signer.provider.waitForTransaction(
        transaction.hash
      );

      console.log('Withdraw transaction mined:', receipt);

      await checkWithdrawEventEmitted(receipt, dispatch);
    }
  } catch (error) {
    console.log('error in transferTokens', error);
    dispatch(setTransferFail());
  }
};

//------------ ORDERS (BUY & SELL) ------------
export const makeBuyOrder = async (
  signer,
  exchange,
  tokens,
  order,
  dispatch
) => {
  try {
    dispatch(newOrderRequest());
    const tokenGet = tokens.token1.contract.target;
    const tokenGive = tokens.token2.contract.target;
    const amountGet = ethers.parseUnits(order.amount.toString(), 18);
    const amountGive = ethers.parseUnits(
      (order.amount * order.price).toString(),
      18
    );

    let transaction = await exchange
      .connect(signer)
      .makeOrder(tokenGet, amountGet, tokenGive, amountGive);

    const receipt = await signer.provider.waitForTransaction(transaction.hash);

    console.log('Buy order transaction mined');

    const orderDetails = await checkOrderEventEmitted(receipt, dispatch);

    dispatch(addNewOrder(orderDetails));
  } catch (error) {
    console.log('error in makeBuyOrder', error);
    dispatch(setNewOrderFail());
  }
};
export const makeSellOrder = async (
  signer,
  exchange,
  tokens,
  order,
  dispatch
) => {
  try {
    dispatch(newOrderRequest());
    const tokenGet = tokens.token2.contract.target;
    const tokenGive = tokens.token1.contract.target;

    const amountGet = ethers.parseUnits(
      (order.amount * order.price).toString(),
      18
    );
    const amountGive = ethers.parseUnits(order.amount.toString(), 18);

    let transaction = await exchange
      .connect(signer)
      .makeOrder(tokenGet, amountGet, tokenGive, amountGive);

    const receipt = await signer.provider.waitForTransaction(transaction.hash);

    console.log('Sell order transaction mined');

    const orderDetails = await checkOrderEventEmitted(receipt, dispatch);

    dispatch(addNewOrder(orderDetails));
  } catch (error) {
    console.log('error in makeBuyOrder', error);
    dispatch(setNewOrderFail());
  }
};

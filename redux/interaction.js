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
  setExchangeContract,
  setExchangeLoaded,
  setExchangeToken1Balance,
  setExchangeToken2Balance,
  setTransferFail,
  setTransferRequest,
  setTransferSuccess,
} from '@/redux/exchangeSlice';

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

const checkDepositEventEmitted = async (receipt, dispatch) => {
  try {
    const iface = new ethers.Interface([
      'event Deposit(address token, address user, uint256 amount, uint256 balance)',
    ]);

    const depositEvent = await receipt.logs
      .map((log) => {
        try {
          return iface.parseLog(log);
        } catch (error) {
          return null;
        }
      })
      .find((log) => log && log.name === 'Deposit');

    if (depositEvent) {
      dispatch(setTransferSuccess(depositEvent));
    } else {
      console.log(
        'No Deposit event found in transaction receipt',
        depositEvent
      );
    }
  } catch (error) {
    console.log('Error checking deposit event:', error);
  }
};

const checkWithdrawEventEmitted = async (receipt, dispatch) => {
  try {
    const iface = new ethers.Interface([
      'event Withdraw(address token, address user, uint256 amount, uint256 balance)',
    ]);

    const withdrawEvent = await receipt.logs
      .map((log) => {
        try {
          return iface.parseLog(log);
        } catch (error) {
          return null;
        }
      })
      .find((log) => log && log.name === 'Withdraw');

    if (withdrawEvent) {
      dispatch(setTransferSuccess(withdrawEvent));
    } else {
      console.log(
        'No Withdraw event found in transaction receipt',
        withdrawEvent
      );
    }
  } catch {
    console.log('Error checking Withdraw event:', error);
  }
};

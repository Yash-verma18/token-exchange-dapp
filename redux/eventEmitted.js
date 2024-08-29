import { setTransferSuccess, setNewOrderSuccess } from '@/redux/exchangeSlice';

import { ethers } from 'ethers';

export const checkDepositEventEmitted = async (receipt, dispatch) => {
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

export const checkWithdrawEventEmitted = async (receipt, dispatch) => {
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

export const checkOrderEventEmitted = async (receipt, dispatch) => {
  try {
    const iface = new ethers.Interface([
      'event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp)',
    ]);
    const orderEvent = await receipt.logs
      .map((log) => {
        try {
          return iface.parseLog(log);
        } catch (error) {
          return null;
        }
      })
      .find((log) => log && log.name === 'Order');

    const orderDetails = {
      id: orderEvent.args.id.toString(),
      user: orderEvent.args.user,
      tokenGet: orderEvent.args.tokenGet,
      amountGet: orderEvent.args.amountGet.toString(),
      amountGive: orderEvent.args.amountGive.toString(),
      tokenGive: orderEvent.args.tokenGive,
      amountGetEthers: ethers.formatUnits(
        orderEvent.args.amountGet.toString(),
        18
      ),
      amountGiveEthers: ethers.formatUnits(
        orderEvent.args.amountGive.toString(),
        18
      ),

      timestamp: orderEvent.args.timestamp.toString(),
    };

    if (orderEvent) {
      dispatch(setNewOrderSuccess(orderDetails));
    } else {
      console.log('No Order event found in transaction receipt', orderEvent);
    }

    return orderDetails;
  } catch (error) {
    console.log('Error checking Order event:', error);
  }
};

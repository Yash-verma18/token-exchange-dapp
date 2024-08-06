import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import Image from 'next/image';
import logo from '../public/Images/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { loadBalances, transferTokens } from '@/redux/interaction';
const Balance = () => {
  const tokens = useSelector((state: any) => state.token);
  const provider = useSelector((state: any) => state.account.provider);
  const signer = useSelector((state: any) => state.account.signer);
  const exchange = useSelector((state: any) => state.exchange);
  const transferInProgress = useSelector(
    (state: any) => state.exchange.transferInProgress
  );
  const account = useSelector((state: any) => state.account.account);
  const dispatch = useDispatch();

  const [token1TransferAmount, setToken1TransferAmount] = useState('');

  console.log('token1TransferAmount', token1TransferAmount);

  const amountHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('event.target.value', event.target.value);
    event.preventDefault();
    setToken1TransferAmount(event.target.value);
  };

  const depositHandler = async () => {
    if (account && exchange && tokens) {
      await transferTokens(
        signer,
        exchange.contract,
        tokens.token1.contract,
        token1TransferAmount,
        dispatch
      );
      setToken1TransferAmount('');
    }
  };

  useEffect(() => {
    const loadBalanceFunc = async () => {
      if (account && exchange && tokens) {
        await loadBalances(exchange, tokens, account, dispatch);
      }
    };

    loadBalanceFunc();
  }, [account, exchange, tokens, transferInProgress]);

  return (
    <div className='space-y-3 p-3 rounded-lg'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm text-white'>Balance</h2>

        <Tabs defaultValue='deposit' className='w-[200px]'>
          <TabsList className='text-xs'>
            <TabsTrigger value='deposit' className='px-2 py-1'>
              Deposit
            </TabsTrigger>
            <TabsTrigger value='withdraw' className='px-2 py-1'>
              Withdraw
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className='flex items-center justify-between'>
        <h2 className='text-xs text-white'>Token</h2>
        <h2 className='text-xs text-white'>Wallet</h2>
        <h2 className='text-xs text-white'>Exchange</h2>
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex gap-1'>
          <Image src={logo} alt='logo' width={10} height={10} />
          <h2 className='text-xs text-white'>{tokens.token1.symbol}</h2>
        </div>
        <div>
          <h2 className='text-xs text-white'>{tokens.token1.userBalance}</h2>
        </div>
        <div>
          <h2 className='text-xs text-white'>{exchange.token1Balance}</h2>
        </div>
      </div>
      <h2 className='text-xs text-white'>Dapp Amount</h2>
      <Input
        type='text'
        placeholder='0.0000'
        onChange={amountHandler}
        className='w-full text-xs'
        value={token1TransferAmount}
      />
      <Button
        variant='outline'
        className='w-full'
        onClick={() => {
          depositHandler();
        }}
      >
        Deposit {'>'}
      </Button>
    </div>
  );
};

export default Balance;

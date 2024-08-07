import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import Image from 'next/image';
import Dapplogo from '../public/Images/logo.png';
import Ethlogo from '../public/Images/eth.svg';
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
  const [token2TransferAmount, setToken2TransferAmount] = useState('');

  const amountHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    token: string
  ) => {
    if (token === 'token1') {
      setToken1TransferAmount(event.target.value);
    } else {
      setToken2TransferAmount(event.target.value);
    }
  };

  const depositHandler = async (tokenType: string) => {
    if (tokenType === 'token1') {
      if (account && exchange && tokens) {
        await transferTokens(
          signer,
          exchange.contract,
          tokens.token1.contract,
          token1TransferAmount,
          dispatch,
          'Deposit'
        );
        setToken1TransferAmount('');
      }
    } else {
      if (account && exchange && tokens) {
        await transferTokens(
          signer,
          exchange.contract,
          tokens.token2.contract,
          token2TransferAmount,
          dispatch,
          'Deposit'
        );
        setToken2TransferAmount('');
      }
    }
  };

  const withdrawHandler = async (tokenType: string) => {
    if (tokenType === 'token1') {
      if (account && exchange && tokens) {
        await transferTokens(
          signer,
          exchange.contract,
          tokens.token1.contract,
          token1TransferAmount,
          dispatch,
          'Withdraw'
        );
        setToken1TransferAmount('');
      }
    } else {
      if (account && exchange && tokens) {
        await transferTokens(
          signer,
          exchange.contract,
          tokens.token2.contract,
          token2TransferAmount,
          dispatch,
          'Withdraw'
        );
        setToken2TransferAmount('');
      }
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

  const [selectedTab, setSelectedTab] = useState('deposit');
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <div className=''>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm text-white'>Balance</h2>

        <Tabs
          defaultValue={selectedTab}
          className='w-[200px]'
          onValueChange={(value) => handleTabChange(value)}
        >
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

      {/* Token 1 : Dapp */}
      <div className='space-y-1 p-3 rounded-lg'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xs text-white'>Token</h2>
          <h2 className='text-xs text-white'>Wallet</h2>
          <h2 className='text-xs text-white'>Exchange</h2>
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex gap-1'>
            <Image src={Dapplogo} alt='logo' width={10} height={10} />
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
          onChange={(e) => {
            amountHandler(e, 'token1');
          }}
          className='w-full text-xs'
          value={token1TransferAmount}
        />
        <Button
          variant='outline'
          className='w-full'
          onClick={() =>
            selectedTab === 'deposit'
              ? depositHandler('token1')
              : withdrawHandler('token1')
          }
        >
          {selectedTab === 'deposit' ? 'Deposit' : 'Withdraw'} {'>'}
        </Button>
      </div>

      {/* Token 2 : eth */}
      <div className='space-y-1 p-3 rounded-lg'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xs text-white'>Token</h2>
          <h2 className='text-xs text-white'>Wallet</h2>
          <h2 className='text-xs text-white'>Exchange</h2>
        </div>

        {/* eth  */}
        <div className='flex items-center justify-between'>
          <div className='flex gap-1'>
            <Image src={Ethlogo} alt='logo' width={20} height={20} />
            <h2 className='text-xs text-white'>{tokens.token2.symbol}</h2>
          </div>
          <div>
            <h2 className='text-xs text-white'>{tokens.token2.userBalance}</h2>
          </div>
          <div>
            <h2 className='text-xs text-white'>{exchange.token2Balance}</h2>
          </div>
        </div>
        <h2 className='text-xs text-white'>mEth Amount</h2>
        <Input
          type='text'
          placeholder='0.0000'
          onChange={(e) => {
            amountHandler(e, 'token2');
          }}
          className='w-full text-xs'
          value={token2TransferAmount}
        />
        <Button
          variant='outline'
          className='w-full'
          onClick={() =>
            selectedTab === 'deposit'
              ? depositHandler('token2')
              : withdrawHandler('token2')
          }
        >
          {selectedTab === 'deposit' ? 'Deposit' : 'Withdraw'} {'>'}
        </Button>
      </div>
    </div>
  );
};

export default Balance;

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import Image from 'next/image';
import Dapplogo from '../public/Images/logo.png';
import Ethlogo from '../public/Images/eth.svg';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadBalances,
  makeBuyOrder,
  makeSellOrder,
  transferTokens,
} from '@/redux/interaction';
const Order = () => {
  const [selectedTab, setSelectedTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');

  const tokens = useSelector((state: any) => state.token);
  const provider = useSelector((state: any) => state.account.provider);
  const signer = useSelector((state: any) => state.account.signer);
  const exchange = useSelector((state: any) => state.exchange);
  const dispatch = useDispatch();

  const handleTabChange = (value: any) => {
    setSelectedTab(value);
  };

  const amountHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const priceHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(event.target.value);
  };

  const buyHandler = async () => {
    await makeBuyOrder(
      signer,
      exchange.contract,
      tokens,
      {
        amount,
        price,
      },
      dispatch
    );

    setAmount('');
    setPrice('');
  };

  const sellHandler = async () => {
    await makeSellOrder(
      signer,
      exchange.contract,
      tokens,
      {
        amount,
        price,
      },
      dispatch
    );

    setAmount('');
    setPrice('');
  };
  return (
    <div className=' '>
      <div className='flex items-center justify-between px-4'>
        <h2 className='text-sm text-white'>New Order</h2>

        <Tabs
          defaultValue={selectedTab}
          className='w-[100px]'
          onValueChange={(value) => handleTabChange(value)}
        >
          <TabsList className='text-xs'>
            <TabsTrigger value='buy' className='px-2 py-1'>
              Buy
            </TabsTrigger>
            <TabsTrigger value='sell' className='px-2 py-1'>
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className='space-y-1 p-3 rounded-lg'>
        <label className='space-x-2 text-xs'>
          {selectedTab == 'buy' ? 'Buy' : 'Sell'} Amount
        </label>
        <Input
          type='text'
          placeholder='0.0000'
          onChange={(e) => {
            amountHandler(e);
          }}
          className='w-full text-xs'
          value={amount}
        />
        <label className='space-x-2 text-xs'>
          {selectedTab == 'buy' ? 'Buy' : 'Sell'} Price
        </label>
        <Input
          type='text'
          placeholder='0.0000'
          onChange={(e) => {
            priceHandler(e);
          }}
          className='w-full text-xs'
          value={price}
        />
        <Button
          variant='outline'
          className='w-full'
          onClick={() => (selectedTab === 'buy' ? buyHandler() : sellHandler())}
        >
          {selectedTab === 'buy' ? 'Buy Order' : 'Sell Order'}
        </Button>
      </div>
    </div>
  );
};

export default Order;

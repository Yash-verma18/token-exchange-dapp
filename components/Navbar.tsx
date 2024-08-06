'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import networks from '../public/data/networks.json';
import Blockies from 'react-blockies';
import Image from 'next/image';
import eth from '../public/Images/eth.svg';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Button } from './ui/button';
import { loadAccount } from '@/redux/interaction';
import Link from 'next/link';

const Navbar = () => {
  const account = useSelector((state: any) => state.account.account);
  const balance = useSelector((state: any) => state.account.balance);
  const chainId = useSelector((state: any) => state.account.chainId);
  const provider = useSelector((state: any) => state.account.provider);
  const currentNetwork = networks.find(
    (network) => network.chainId === chainId
  );

  const dispatch = useDispatch();
  const [selectedNetworkName, setSelectedNetworkName] = useState();

  // short the address
  const shortAddress = (account: any) => {
    if (!account) return '';
    return account.slice(0, 5) + '...' + account.slice(-4);
  };

  const shortBalance = (balance: any) => {
    if (!balance) return '';
    const formattedBalance = (balance / 10 ** 18).toFixed(4); // Convert balance to ETH and format to 4 decimal places
    return formattedBalance;
  };

  const connectHandler = async () => {
    console.log('Connect Wallet');
    await loadAccount(provider, dispatch);
  };

  const networkHandler = async (network: any) => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + parseInt(network.chainId).toString(16) }], // Convert chainId to hexadecimal format
        });
        if (network) {
          setSelectedNetworkName(network.name);
        }
      } catch (switchError: any) {
        console.log('switchError', switchError);
      }
    }
  };

  const config = require('../config.json');
  return (
    <div className='flex gap-2 items-center justify-between mb-28'>
      {currentNetwork?.name && (
        <div className='flex gap-2 items-center justify-between'>
          <Image src={eth} alt='logo' width={30} height={30} />
          <Select
            onValueChange={async (value: string) => {
              console.log('value', value);

              const selectedNetwork: any = networks.find(
                (network) => network.name === value
              );

              await networkHandler(selectedNetwork);
            }}
            defaultValue={currentNetwork?.name}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Select Network' />
            </SelectTrigger>
            <SelectContent>
              {networks &&
                networks.map((network) => (
                  <SelectItem key={network.chainId} value={network.name}>
                    {network.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className='flex gap-7 items-center justify-between'>
        <Button size='sm' asChild>
          <div>My Balance : {shortBalance(balance)} ETH</div>
        </Button>
        {account ? (
          <Button size='sm' asChild>
            <div>
              {shortAddress(account)}
              <Link
                href={
                  config[chainId]
                    ? `${config[chainId].explorerURL}/address/${account}`
                    : '#'
                }
              >
                <Blockies
                  seed={account}
                  size={10}
                  scale={3}
                  className='rounded-full ml-2'
                />
              </Link>
            </div>
          </Button>
        ) : (
          <Button
            size='sm'
            asChild
            onClick={() => {
              connectHandler();
            }}
          >
            <div>Connect Wallet</div>
          </Button>
        )}
      </div>
    </div>
  );
};
export default Navbar;

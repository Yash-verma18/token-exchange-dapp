import React, { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDispatch, useSelector } from 'react-redux';
import { loadTokens } from '@/redux/interaction';

const Markets = () => {
  const chainId = useSelector((state: any) => state.account.chainId);
  const provider = useSelector((state: any) => state.account.provider);
  const dispatch = useDispatch();
  const config = require('../config.json');
  const handleMarketChange = useCallback(
    async (value: any) => {
      try {
        console.log('Selected value:', value);
        const addresses = value.trim().split(/\s*,\s*/);
        if (provider && window.ethereum && addresses.length > 0) {
          await loadTokens(provider, addresses, dispatch);
        } else {
          console.log('Provider not found or invalid addresses');
        }
      } catch (error) {
        console.error('Error loading tokens:', error);
      }
    },
    [provider, dispatch]
  );

  if (!chainId || !config[chainId]) {
    return null;
  }

  return (
    <div className='mb-2 mt-2 px-2'>
      {chainId && config[chainId] && (
        <Select
          onValueChange={handleMarketChange}
          defaultValue={`${config[chainId]?.DApp?.address},${config[chainId]?.mEth?.address} `}
        >
          <SelectTrigger className='w-[330px]'>
            <SelectValue placeholder='Select tokens' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value={`${config[chainId]?.DApp?.address},${config[chainId]?.mEth?.address} `}
            >
              Dapp/mEth
            </SelectItem>
            <SelectItem
              value={`${config[chainId]?.DApp?.address},${config[chainId]?.mDai?.address} `}
            >
              Dapp/mDai
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default Markets;

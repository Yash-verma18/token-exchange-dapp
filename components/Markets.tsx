import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { loadTokens } from "@/redux/interaction";
const Markets = () => {
  const config = require("../config.json");
  const chainId = useSelector((state: any) => state.account.chainId);
  const provider = useSelector((state: any) => state.account.provider);
  const dispatch = useDispatch();

  const handleMarketChange = async (value: any) => {
    try {
      const addresses = value.trim().split(/\s*,\s*/);
      if (provider && window.ethereum && addresses.length > 0) {
        await loadTokens(provider, addresses, dispatch);
      } else {
        console.log("provider not found");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div className="mb-2 mt-2">
      {chainId && config[chainId] ? (
        <Select onValueChange={handleMarketChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select tokens" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value={`${config[chainId].DApp.address},${config[chainId].mEth.address} `}
            >
              Dapp/mEth
            </SelectItem>
            <SelectItem
              value={`${config[chainId].DApp.address},${config[chainId].mDai.address} `}
            >
              Dapp/mDai
            </SelectItem>
          </SelectContent>
        </Select>
      ) : (
        "not deployed"
      )}
    </div>
  );
};

export default Markets;

import { useState } from "react";
import {
  GetPoolsPool,
  SupportedNetworks,
  UniswapGraphV3,
} from "../../../scripts/uniswap";

export const useUniswapPools = () => {
  const [data, setData] = useState<GetPoolsPool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);

  const getPools = async (network: SupportedNetworks) => {
    try {
      setLoading(true);
      const sdk = new UniswapGraphV3(network);

      const pools = await sdk.getPools();

      setData(pools);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  return {
    getPools,
    pools: data,
    loading,
    error,
  };
};

import { useEffect, useMemo, useState } from "react";
import { useUniswapPools } from "../../../pages/UniswapHedge/hooks/useUniswapPools";
import { SupportedNetworks } from "../../../scripts/uniswap";
import Select from "../../atom/select";

export interface PoolSelectProps {
  pool: string;
  onPoolChange: (pool: string) => void;
  onNetworkChange: (pool: string) => void;
}

export default function SelectPool({
  pool,
  onPoolChange,
  onNetworkChange,
}: PoolSelectProps) {
  const { getPools, pools, loading } = useUniswapPools();
  const [network, setNetwork] = useState<SupportedNetworks>(
    SupportedNetworks.ethereum
  );
  const [pair, selectedPair] = useState<string>("");

  useEffect(() => {
    console.log("network changed", network);
    getPools(network);
  }, [network]);

  const singlePairs = useMemo(() => {
    const pairs = new Set<string>(); // {token0-token1}

    pools?.forEach((pool) => {
      const pair = `${pool.token0.symbol}-${pool.token1.symbol}`;
      pairs.add(pair);
    });

    return (
      Array.from(pairs)
        //.sort((a, b) => a.localeCompare(b))
        .map((pair) => ({ value: pair, label: pair }))
    );
  }, [pools]);

  const poolsByPair = useMemo(() => {
    const eligiblePools = pools?.filter((pool) => {
      const poolSignature = `${pool.token0.symbol}-${pool.token1.symbol}`;
      return poolSignature === pair;
    });
    return eligiblePools?.map((pool) => ({
      value: pool.id,
      label: `${pool.token0.symbol}-${pool.token1.symbol} - ${
        parseInt(pool.feeTier) / 10000
      } %`,
    }));
  }, [pools, pair]);

  return (
    <div style={{ display: "flex" }}>
      <Select
        onClick={(value) => {
          onNetworkChange(value as SupportedNetworks);
          setNetwork(value as SupportedNetworks);
          selectedPair("");
        }}
        helpText="Select network"
        value={network}
        options={Object.values(SupportedNetworks).map((network) => ({
          label: `Network: ${network}`,
          value: network,
        }))}
      />
      <Select
        disabled={loading}
        style={{
          marginLeft: 8,
          width: 180,
          border: "1px solid #000",
          borderRadius: 2,
        }}
        options={singlePairs}
        value={pair}
        helpText={loading ? "Loading..." : "Select a pair"}
        onClick={(value) => {
          selectedPair(value as string);
        }}
      />
      <Select
        style={{
          marginLeft: 8,
          width: 180,
          border: "1px solid #000",
          borderRadius: 2,
        }}
        options={poolsByPair}
        value={pool}
        helpText={"Select a fee tier"}
        onClick={(value) => {
          onPoolChange(value);
        }}
      />
    </div>
  );
}

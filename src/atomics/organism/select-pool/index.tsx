import { useEffect, useMemo } from "react";
import Select from "../../atom/select";
import { useUniswapPools } from "../../../pages/UniswapHedge/useUniswapPool";

export interface PoolSelectProps {
  pool: string;
  onPoolChange: (pool: string) => void;
}

export default function SelectPool({ pool, onPoolChange }: PoolSelectProps) {
  const { fetch: fetchPools, data: pools } = useUniswapPools();

  useEffect(() => {
    fetchPools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availablePools = useMemo(() => {
    return pools
      ?.map((pool: any) => {
        return {
          label:
            pool.token0.symbol +
            "-" +
            pool.token1.symbol +
            " " +
            pool.feeTier / 10000 +
            "%",
          value: pool.id,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [pools]);

  return (
    <Select
      style={{
        marginLeft: 8,
        width: 180,
        border: "1px solid #000",
        borderRadius: 2,
      }}
      options={availablePools}
      value={pool}
      helpText={"Select a pool"}
      onClick={(value) => {
        onPoolChange(value);
      }}
    />
  );
}

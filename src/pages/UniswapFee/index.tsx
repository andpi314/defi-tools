import { useMemo, useState } from "react";
// import Chart from "../UniswapHedge/components/Chart";
import PoolPicker from "../UniswapHedge/components/PoolPicker";
import { useUniswapPool } from "../UniswapHedge/useUniswapPool";
import {
  computeMetrics,
  discardManyInGroup,
  groupByBlockNumber,
} from "./processing";

export default function UniswapFee() {
  const [pool, setPool] = useState<string>("");

  const {
    transactions: {
      loading,
      // error,
      data: transactions,
      fetch: fetchPoolTransactions,
    },
  } = useUniswapPool();

  const handleFetch = (poolAddress: string) => {
    console.log(`Fetching pool transactions for ${poolAddress}`);
    fetchPoolTransactions(poolAddress, 200);
  };

  // useEffect(() => {
  //   fetchPool();
  // }, []);

  const processedData = useMemo(() => {
    if (!transactions || !transactions.swaps.length) return undefined;

    const data = transactions.swaps;

    const grouped = groupByBlockNumber(data);

    const eligible = discardManyInGroup(grouped);

    return computeMetrics(eligible);
  }, [transactions]);

  return (
    <>
      <p>{"Uniswap Fee"}</p>
      <PoolPicker
        onPoolChange={setPool}
        selectedPool={pool}
        fetchDisabled={loading}
        onFetch={handleFetch}
      />
      <p>{`Processing ${transactions.swaps.length} transactions`}</p>
      <p>{`Computed L is: ${processedData?.lSum || "N/A"}`}</p>

      <div style={{ display: "flex", margin: "auto" }}>
        {/* <Chart loading={loading} error={error} data={transactions} /> */}
      </div>
    </>
  );
}

import { useState } from "react";
import { useUniswapPool } from "./useUniswapPool";
import PoolPicker from "./components/PoolPicker";
import Chart from "./components/Chart";

// const validQueries = [
//   // Get all transactions event (e.g. Swap) with
//   "query transactions {\n  transactions(\n    first: 500\n    orderBy: timestamp\n    orderDirection: desc\n    subgraphError: allow\n  ) {\n    id\n    timestamp\n    mints {\n      pool {\n        token0 {\n          id\n          symbol\n          __typename\n        }\n        token1 {\n          id\n          symbol\n          __typename\n        }\n        __typename\n      }\n      owner\n      sender\n      origin\n      amount0\n      amount1\n      amountUSD\n      __typename\n    }\n    swaps {\n      pool {\n        token0 {\n          id\n          symbol\n          __typename\n        }\n        token1 {\n          id\n          symbol\n          __typename\n        }\n        __typename\n      }\n      origin\n      amount0\n      amount1\n      amountUSD\n      __typename\n    }\n    burns {\n      pool {\n        token0 {\n          id\n          symbol\n          __typename\n        }\n        token1 {\n          id\n          symbol\n          __typename\n        }\n        __typename\n      }\n      owner\n      origin\n      amount0\n      amount1\n      amountUSD\n      __typename\n    }\n    __typename\n  }\n}\n",
//   // Volume in UD for a given pool
//   "query poolDayDatas($startTime: Int!, $skip: Int!, $address: Bytes!) {\n  poolDayDatas(\n    first: 1000\n    skip: $skip\n    where: {pool: $address, date_gt: $startTime}\n    orderBy: date\n    orderDirection: asc\n    subgraphError: allow\n  ) {\n    date\n    volumeUSD\n    tvlUSD\n    feesUSD\n    pool {\n      feeTier\n      __typename\n    }\n    __typename\n  }\n}\n",
//   {
//     address: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
//     skip: 0,
//     startTime: 1619170975,
//   },
// ];

export default function UniswapHedge() {
  // Presumably, the smart contract used for swap can be used to fetch the swap data
  const {
    transactions: {
      loading,
      error,
      data: transactions,
      fetch: fetchPoolTransactions,
    },
  } = useUniswapPool();

  const [position, setPosition] = useState<{
    priceUpper: number;
    priceLower: number;
  }>({
    priceLower: 1226.7,
    priceUpper: 1276.7,
  });

  const handleFetch = (poolAddress: string) => {
    console.log("Fetching pool transactions...", poolAddress);
    fetchPoolTransactions(poolAddress, 200);
  };

  return (
    <div className="App">
      <div>
        <h1 style={{ fontFamily: "sans-serif" }}>Uniswap Hedge</h1>

        <PoolPicker fetchDisabled={loading} onFetch={handleFetch} />
        <div style={{ marginTop: 8 }}>
          <label>{"Position Data: "}</label>
          <label>{"Upper Price"}</label>
          <input
            style={{
              width: 80,
              marginLeft: 8,
              minHeight: 26,
              border: "1px solid #000",
              borderRadius: 2,
            }}
            value={position.priceUpper}
            onChange={(e) =>
              setPosition((prev) => ({
                ...prev,
                priceUpper: parseFloat(e.target.value),
              }))
            }
            step="any"
            type="number"
          />
          <label style={{ marginLeft: 4 }}>{"Lower Price"}</label>
          <input
            style={{
              width: 80,
              marginLeft: 8,
              minHeight: 26,
              border: "1px solid #000",
              borderRadius: 2,
            }}
            step="any"
            value={position.priceLower}
            onChange={(e) =>
              setPosition((prev) => ({
                ...prev,
                priceLower: parseFloat(e.target.value),
              }))
            }
            type="number"
          />
        </div>
      </div>
      <Chart
        position={position}
        loading={loading}
        error={error}
        data={transactions}
      />
    </div>
  );
}

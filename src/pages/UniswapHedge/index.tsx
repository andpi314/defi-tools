import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Loader from "../../atomics/atom/loader";
import {
  transformEvent,
  useUniswapPool,
  useUniswapPools,
} from "./useUniswapPool";

const baseEndpoint =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
const validQueries = [
  // Get all transactions event (e.g. Swap) with
  "query transactions {\n  transactions(\n    first: 500\n    orderBy: timestamp\n    orderDirection: desc\n    subgraphError: allow\n  ) {\n    id\n    timestamp\n    mints {\n      pool {\n        token0 {\n          id\n          symbol\n          __typename\n        }\n        token1 {\n          id\n          symbol\n          __typename\n        }\n        __typename\n      }\n      owner\n      sender\n      origin\n      amount0\n      amount1\n      amountUSD\n      __typename\n    }\n    swaps {\n      pool {\n        token0 {\n          id\n          symbol\n          __typename\n        }\n        token1 {\n          id\n          symbol\n          __typename\n        }\n        __typename\n      }\n      origin\n      amount0\n      amount1\n      amountUSD\n      __typename\n    }\n    burns {\n      pool {\n        token0 {\n          id\n          symbol\n          __typename\n        }\n        token1 {\n          id\n          symbol\n          __typename\n        }\n        __typename\n      }\n      owner\n      origin\n      amount0\n      amount1\n      amountUSD\n      __typename\n    }\n    __typename\n  }\n}\n",
  // Volume in UD for a given pool
  "query poolDayDatas($startTime: Int!, $skip: Int!, $address: Bytes!) {\n  poolDayDatas(\n    first: 1000\n    skip: $skip\n    where: {pool: $address, date_gt: $startTime}\n    orderBy: date\n    orderDirection: asc\n    subgraphError: allow\n  ) {\n    date\n    volumeUSD\n    tvlUSD\n    feesUSD\n    pool {\n      feeTier\n      __typename\n    }\n    __typename\n  }\n}\n",
  {
    address: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
    skip: 0,
    startTime: 1619170975,
  },
];

export interface SelectProps {
  style?: React.CSSProperties;
  options: { label: string; value: string }[];
  value?: string;
  helpText?: string;
  onClick: (value: string) => void;
}
export function Select({
  options,
  onClick,
  helpText,
  value,
  style,
}: SelectProps) {
  const text = helpText ? helpText : "Please choose one option";
  return (
    <select
      style={{ minHeight: 30, paddingRight: 16, ...(style && style) }}
      value={options.find((opt) => opt.value === value)?.value}
      onChange={(e) => {
        onClick(e.target.value);
      }}
    >
      <option>{text}</option>
      {options.map((option, index) => {
        return (
          <option value={option.value} key={index}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
}

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

  const { fetch: fetchPools, data: pools } = useUniswapPools();

  // Default: Uniswap ETH-USDC 1% pool
  const [pool, setPool] = useState<string>(
    "0x7bea39867e4169dbe237d55c8242a8f2fcdcc387"
  );

  const [transactionCount, setTransactionCount] = useState<number>(100);

  const handleFetch = (poolAddress: string) => {
    console.log("Fetching pool transactions...", poolAddress);
    fetchPoolTransactions(poolAddress, transactionCount);
  };

  useEffect(() => {
    handleFetch(pool);
    fetchPools();
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

  const { data, yMin, yMax } = useMemo(() => {
    const data = transformEvent(transactions.swaps).sort(
      (a, b) => a.timestamp - b.timestamp
    );
    const yMin = Math.min(...data.map((d) => d.price));
    const yMax = Math.max(...data.map((d) => d.price));
    return {
      data,
      yMin: Math.ceil(yMin - 0.1 * yMin),
      yMax: Math.ceil(yMax + 0.1 * yMax),
    };
  }, [transactions.swaps]);

  /**
   * Requirements:
   * [x] fetch swap from uniswap pool
   * [x] parse data using a transformer to highlight ETH price
   * [x] display eth price change over chart (understanding data requirements for the chart)
   * [x] understand how to draw horizontal line on chart
   * [ ] display ETH swaps and USDC swaps (to compute different amount of fees)
   */

  // uniswap v3 USDC-ETH 0.03% pool address
  // 0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640
  const staticLines: { yValue: number; label: string; stroke?: string }[] = [
    {
      yValue: 1226.7,
      label: "rMin",
    },
    {
      yValue: 1276.7,
      label: "rMax",
    },
  ];

  const chartConfig = {
    width: 500,
    height: 600,
  };

  return (
    <div className="App">
      <div>
        <h1 style={{ fontFamily: "sans-serif" }}>Uniswap Hedge</h1>

        <div>
          <label>{"Pool Address: "}</label>
          <input
            style={{
              width: 300,
              marginLeft: 8,
              minHeight: 26,
              border: "1px solid #000",
              borderRadius: 2,
            }}
            value={pool}
            onChange={(e) => setPool(e.target.value)}
            type="text"
          />
          <input
            style={{
              width: 30,
              marginLeft: 8,
              minHeight: 26,
              border: "1px solid #000",
              borderRadius: 2,
            }}
            value={transactionCount}
            onChange={(e) => setTransactionCount(parseInt(e.target.value))}
            type="text"
          />
          <Select
            style={{ marginLeft: 8, border: "1px solid #000", borderRadius: 2 }}
            options={availablePools}
            value={pool}
            helpText={"Select a pool"}
            onClick={(value) => {
              setPool(value);
              handleFetch(value);
            }}
          />

          <button
            disabled={loading}
            style={{
              marginLeft: 8,
              minHeight: 30,
              background: "transparent",
              outline: "none",
              border: "1px solid #000",
              borderRadius: 2,
            }}
            onClick={() => handleFetch(pool)}
          >
            {"Fetch Data"}
          </button>
        </div>
      </div>
      {loading ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <Loader />
        </div>
      ) : error ? (
        <div>Error</div>
      ) : (
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <LineChart
            width={500}
            height={600}
            data={data}
            margin={{
              top: 20,
              right: 50,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              style={{ height: 250 }}
              dataKey="createdOn"
              angle={-5}
              textAnchor="end"
              // padding={{ right: 50 }}
            />
            <YAxis
              //   padding={{ bottom: 100, top: 100 }}
              domain={
                //["auto", "auto"],
                [yMin, yMax]
              }
            />
            <Tooltip />
            <Legend />
            {/* Vertical line */}
            {/* <ReferenceLine x="Page C" stroke="red" label="Max PV PAGE" /> */}

            {staticLines.map((line) => (
              <ReferenceLine
                y={line.yValue}
                label={line.label}
                stroke={line.stroke || "red"}
              />
            ))}

            <Line type="monotone" dataKey="price" stroke="#8884d8" />
            {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

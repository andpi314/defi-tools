import { useMemo, useState } from "react";
import { useUniswapPool } from "./useUniswapPool";
import PoolPicker from "./components/PoolPicker";
import Chart from "./components/Chart";
import { cleanEvent } from "../../scripts/uniswap/utils";

/**
 *
 * - Add context state to store data across components
 * - add select to choose month of analysis
 * - create labelled input to improve UI
 * - add multiple pool data on the same chart
 */

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

  const [lFilterDateStart, setLFilterDateStart] = useState<number>(
    1673273963 * 1000
  );

  const [pools, setPools] = useState<string[]>([
    "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
  ]);

  const [position, setPosition] = useState<{
    priceUpper: number;
    priceLower: number;
  }>({
    priceLower: 1310.3,
    priceUpper: 1350.2,
  });

  const handleFetch = (poolAddress: string) => {
    console.log("Fetching pool transactions...", poolAddress);
    fetchPoolTransactions(poolAddress, 200);
  };

  /**
   * Goal: define l as the length in $ that price change has made
   *
   * - check L after uniswap position ()
   *
   */

  const computedData = useMemo(() => {
    let data = cleanEvent(transactions.swaps || []);

    console.log("Cleaned data", data);

    if (!data.length) return { l: 0, count: 0 };

    console.log("startDate", new Date(lFilterDateStart).toISOString());

    //   console.log("DATA Before filter", data);

    data = data
      .filter(
        (d) =>
          d.timestamp > lFilterDateStart / 1000 &&
          d.price <= position.priceUpper &&
          d.price >= position.priceLower
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    if (!data.length) return { l: 0, count: 0 };

    const computed = data.reduce(
      (acc: any, curr, currenIndex) => {
        if (currenIndex === 0) {
          return acc;
        }

        const prev = data[currenIndex - 1];

        const l = Math.abs(curr.price - prev.price);
        const sqrt = Math.abs(
          1 / Math.sqrt(curr.price) - 1 / Math.sqrt(prev.price)
        );

        const feeTier = 0.05 / 100;
        const trxVolume =
          (parseFloat(curr.raw.amount0) / parseFloat(curr.raw.amount1)) * -1;
        const L = 9040.47; // position liquidity / 10^(token0decimals + token1decimals)/2

        const liquidityAmount0 =
          (parseFloat(curr.raw.amount0) *
            (Math.sqrt(position.priceUpper) * Math.sqrt(position.priceLower))) /
          (Math.sqrt(position.priceUpper) - Math.sqrt(position.priceLower));

        const liquidityAmount1 =
          parseFloat(curr.raw.amount1) /
          (Math.sqrt(position.priceUpper) - Math.sqrt(position.priceLower));
        const deltaL = Math.min(
          Math.abs(liquidityAmount0),
          Math.abs(liquidityAmount1)
        );
        const fee = feeTier * trxVolume * (deltaL / (L + deltaL));

        const newL = acc.l + l;
        acc = {
          l: newL,
          sqrt: acc.sqrt + sqrt,
          fee: acc.fee + fee,
          lCum: [...acc.lCum, { l: newL, createdOn: curr.timestamp }],
        };
        return acc;
      },
      {
        l: 0,
        sqrt: 0,
        fee: 0,
        lCum: [],
      }
    );

    const theta = computed.l / 2 / 3;
    return { count: data.length, theta, ...computed };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, lFilterDateStart]);

  return (
    <div className="App">
      <div>
        <h1 style={{ fontFamily: "sans-serif" }}>Uniswap Hedge</h1>

        {pools?.map((pool, index) => {
          // const isLast = index === pools.length - 1;
          return (
            <div style={{ display: "flex", margin: "auto" }}>
              <PoolPicker
                onPoolChange={(pool) => setPools((prev) => [...prev, pool])}
                selectedPool={pool}
                fetchDisabled={loading}
                onFetch={handleFetch}
              />
            </div>
          );
        })}

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

        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <label>{"Filter transactions after"}</label>
          <input
            style={{
              width: 130,
              marginLeft: 8,
              minHeight: 26,
              border: "1px solid #000",
              borderRadius: 2,
            }}
            value={lFilterDateStart}
            onChange={(e: any) => setLFilterDateStart(e.target.value)}
            step="any"
            type="number"
          />
          {new Date(lFilterDateStart).toISOString()}
        </div>
      </div>

      <div>
        <span>{`Transaction count: ${
          loading ? "N/A" : transactions.swaps.length
        }`}</span>
      </div>
      <div>
        <div>{`L: ${loading ? "N/A" : computedData.l}`}</div>
        <div>{`Count: ${loading ? "N/A" : computedData.count}`}</div>
        <div>{`Theta: ${loading ? "N/A" : computedData.theta}`}</div>
        {/* <div>{`SQRT SUM: ${loading ? "N/A" : computedData.sqrt}`}</div>
        <div>{`Fee: ${loading ? "N/A" : computedData.fee}`}</div> */}
      </div>
      <Chart
        horizontalLines={[
          {
            yValue: position.priceLower,
            label: "rMin",
          },
          {
            yValue: position.priceUpper,
            label: "rMax",
          },
        ]}
        loading={loading}
        error={error}
        data={transactions}
      />
    </div>
  );
}

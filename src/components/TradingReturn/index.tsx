import React, { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

enum TokenType {
  token0 = "token0",
  token1 = "token1",
}

type Permutation = {
  token0Price: number;
  token1Price: number;
  token1Out: number;
};

export default function TradingReturn() {
  const [token0, setToken0] = useState({
    purchaseQty: 340,
    purchasePrice: 0.68,
    marketPrice: 0.24,
  });
  const [token1, setToken1] = useState({
    purchaseQty: 41.22,
    purchasePrice: 5.61,
    marketPrice: 2.45,
  });

  const [tokenReceived, setTokenReceived] = useState(0);

  const handleChange = (e: any) => {
    const {
      target: { value, name },
    } = e;

    if (name === TokenType.token0) {
      setToken0((prev) => ({ ...prev, purchaseQty: parseFloat(value) }));
    }
    if (name === TokenType.token1) {
      setToken1((prev) => ({ ...prev, purchaseQty: parseFloat(value) }));
    }
  };

  const handleRangeChange = (e: any) => {
    const {
      target: { value, name },
    } = e;

    if (name === TokenType.token0) {
      setToken0((prev) => ({ ...prev, marketPrice: parseFloat(value) }));
    }
    if (name === TokenType.token1) {
      setToken1((prev) => ({ ...prev, marketPrice: parseFloat(value) }));
    }
  };

  React.useEffect(() => {
    const tokenToSell = token1.purchaseQty;

    setTokenReceived((tokenToSell * token1.marketPrice) / token0.marketPrice);
  }, [token0.marketPrice, token1.marketPrice, token1.purchaseQty]);

  function BuyTime() {
    return (
      <div
        style={{
          border: "1px solid green",
          padding: 4,
          margin: 2,
          display: "flex",
        }}
      >
        <div>
          <div>{"Buy time (qty)"}</div>
          <div>
            <span>{"Token 0: "}</span>
            <input
              value={token0.purchaseQty}
              name={TokenType.token0}
              type="number"
              onChange={(e) => handleChange(e)}
              placeholder="Token 0"
            />
          </div>
          <div>
            <span>{"Token 1: "}</span>
            <input
              value={token1.purchaseQty}
              name={TokenType.token1}
              type="number"
              onChange={(e) => handleChange(e)}
              placeholder="Token 1"
            />
          </div>
        </div>
        <div style={{ marginLeft: 4 }}>
          <div>{"Buy time (Price)"}</div>
          <div>
            <span>{`Token 0: ${token0.purchasePrice}`}</span>
          </div>
          <div>
            <span>{`Token 1: ${token1.purchasePrice}`}</span>
          </div>
        </div>
      </div>
    );
  }

  function getLimits(
    amount: number,
    threshold: number,
    steps: number
  ): {
    upper: number;
    bottom: number;
    step: number;
  } {
    const quote = (amount * 100) / threshold;

    const upper = amount + quote;
    const bottom = amount - quote;

    const step = (upper - bottom) / steps;

    return {
      upper,
      bottom,
      step,
    };
  }

  function computePayload(qty: number): Permutation[] {
    // *** GET CURRENT DATA ***
    const token0Price = token0.marketPrice;
    const token1Price = token1.marketPrice;

    // *** CONFIGURATION ***
    // in bps, 10%
    const bondThreshold = 10;
    const numberOfSteps = 5;

    // *** GET LIMIT FOR EACH TOKEN ***
    const toke0Data = getLimits(token0Price, bondThreshold, numberOfSteps);
    const token1Data = getLimits(token1Price, bondThreshold, numberOfSteps);

    console.log(toke0Data, token1Data);

    // *** NEED TO PERMUTE FOR EACH POSSIBLE OUTCOME ***

    // A list of permutation as market positions
    const positions: Permutation[] = [];

    for (
      let price0 = toke0Data.bottom;
      price0 <= toke0Data.upper;
      price0 += token1Data.step
    ) {
      // *** TOKEN 0 PRICE RANGE ITERATION ***

      for (
        let price1 = token1Data.bottom;
        price1 <= token1Data.upper;
        price1 += token1Data.step
      ) {
        positions.push({
          token0Price: price0,
          token1Price: price1,
          token1Out: (qty * price0) / price1,
        });
      }
    }
    return positions;
  }

  const chartObj: Permutation[] = React.useMemo(() => {
    // HP: how much of token1 can I get back buy selling 200n of token0?
    const positions = computePayload(token1.purchaseQty);
    console.log(positions);

    return positions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token0.marketPrice, token1.marketPrice, token1.purchaseQty]);

  const profit = tokenReceived - token0.purchaseQty;

  const isProfit = profit > 0;

  return (
    <>
      <BuyTime />

      <div style={{ border: "1px solid blue", padding: 4, margin: 2 }}>
        <div>{"Current time"}</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: ".5fr 2fr",
            gap: 20,
          }}
        >
          <div>{`Token 0 price: (${token0.marketPrice})`}</div>
          <input
            type="range"
            step={0.01}
            name={TokenType.token0}
            onChange={(e) => handleRangeChange(e)}
            min="0"
            max="10"
            value={token0.marketPrice}
          />
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: ".5fr 2fr", gap: 20 }}
        >
          <div>{`Token 1 price: (${token1.marketPrice})`}</div>

          <input
            type="range"
            step={0.01}
            name={TokenType.token1}
            onChange={(e) => handleRangeChange(e)}
            min="0"
            max="20"
            value={token1.marketPrice}
          />
        </div>
      </div>

      <div>
        <div>{"Token 1 Bought:"}</div>
        <div>{token1.purchaseQty}</div>
        <div>
          {"Token 0 Received"}
          <span style={{ fontSize: 12, marginLeft: 4 }}>
            {"(selling token 1 at given market conditions)"}
          </span>
        </div>
        <div>
          {tokenReceived.toFixed(2)}
          <span
            style={{
              fontSize: 14,
              marginLeft: 4,
              fontWeight: 600,
              color: isProfit ? "green" : "red",
            }}
          >{`(${isProfit ? "+" : ""} ${profit.toFixed(2)})`}</span>
        </div>
      </div>
      <div>
        {chartObj.length > 0 && (
          <LineChart width={1000} height={800} data={chartObj}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="token1Price" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="token1Out" stroke="#82ca9d" />
          </LineChart>

          // <ScatterChart width={1000} height={450}>
          //   <CartesianGrid />
          //   <XAxis
          //     type="number"
          //     dataKey="token0Price"
          //     name="token0"
          //     unit="FTM"
          //   />
          //   <YAxis
          //     type="number"
          //     dataKey="token1Price"
          //     name="token1"
          //     unit="BOO"
          //   />
          //   <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          //   <Scatter data={chartObj} fill="#8884d8" />
          // </ScatterChart>
        )}
      </div>
    </>
  );
}

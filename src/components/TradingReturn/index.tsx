import React, { useState } from "react";
import {
  Area,
  AreaChart,
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

export default function TradingReturn() {
  const [token0, setToken0] = useState({
    purchaseQty: 19.2,
    purchasePrice: 0,
    marketPrice: 1,
  });
  const [token1, setToken1] = useState({
    purchaseQty: 200,
    purchasePrice: 0,
    marketPrice: 1,
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
    const tokenToSell = token0.purchaseQty;

    setTokenReceived((tokenToSell * token0.marketPrice) / token1.marketPrice);
  }, [token0.marketPrice, token1.marketPrice]);

  const getKey = (price: number): string => `token0_received_${price}`;

  const [chartObj, keys] = React.useMemo(() => {
    const token1Prices = Array(3)
      .fill(1)
      .map((_, i) => i + 0.1);
    const token0Prices = Array(100)
      .fill(1)
      .map((_, i) => i + 1);

    const priceVariation: any[] = [];

    const keys: string[] = [];

    token1Prices.forEach((token1Price, index) => {
      const thisKey = getKey(index + 1);
      keys.push(thisKey);
      token0Prices.forEach((token0Price) => {
        priceVariation.push({
          token0Price,
          token1Price,
          [thisKey]: (token0.purchaseQty * token0Price) / token1Price,
        });
      });
    });

    return [priceVariation, keys];
  }, [token0.purchaseQty, token1.marketPrice]);

  return (
    <>
      <div>
        <div>{"Buy time"}</div>
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
      <div>
        <div>{"Current time"}</div>
        <span>{`Token 1 price: (${token1.marketPrice})`}</span>
        <input
          type="range"
          step={0.01}
          name={TokenType.token1}
          onChange={(e) => handleRangeChange(e)}
          min="0"
          max="100"
          value={token1.marketPrice}
        />
        <span>{`Token 0 price: (${token0.marketPrice})`}</span>
        <input
          type="range"
          name={TokenType.token0}
          onChange={(e) => handleRangeChange(e)}
          min="0"
          max="100"
          value={token0.marketPrice}
        />
        <div>{tokenReceived}</div>

        {chartObj.length > 0 && (
          <AreaChart
            width={1000}
            height={450}
            data={chartObj}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <XAxis dataKey="token0Price" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area dataKey={getKey(1)} fill="#22ca9d" />;
            <Area type="monotone" dataKey={getKey(2)} stroke="#232f6e78" />;
            <Area type="monotone" dataKey={getKey(3)} stroke="#82ca2d" />;
            {/* {keys.map((key) => {
              <Line type="monotone" dataKey={key} stroke="#82ca9d" />;
            })} */}
            {/* <Line type="monotone" dataKey="pv" stroke="#8884d8" /> */}
          </AreaChart>
        )}
      </div>
    </>
  );
}

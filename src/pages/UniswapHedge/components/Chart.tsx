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
import Loader from "../../../atomics/atom/loader";
import { UniswapPoolTransaction, transformEvent } from "../useUniswapPool";
import { useMemo } from "react";

export interface Position {
  priceLower: number;
  priceUpper: number;
}

export interface ChartProps {
  position: Position;
  loading: boolean;
  error: any;
  data: UniswapPoolTransaction;
}

export default function Chart({
  position,
  error,
  data: uniswapPoolTransaction,
  loading,
}: ChartProps) {
  const staticLines: { yValue: number; label: string; stroke?: string }[] = [
    {
      yValue: position.priceLower,
      label: "rMin",
    },
    {
      yValue: position.priceUpper,
      label: "rMax",
    },
  ];

  const { data, yMin, yMax } = useMemo(() => {
    const data = transformEvent(uniswapPoolTransaction.swaps).sort(
      (a, b) => a.timestamp - b.timestamp
    );
    const yMin = Math.min(...data.map((d) => d.price));
    const yMax = Math.max(...data.map((d) => d.price));
    return {
      data,
      yMin: Math.ceil(yMin - 0.1 * yMin),
      yMax: Math.ceil(yMax + 0.1 * yMax),
    };
  }, [uniswapPoolTransaction.swaps]);

  if (loading)
    return (
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
    );

  if (error) return <p>{error}</p>;
  if (uniswapPoolTransaction.swaps.length === 0) return <p>{"No Data"}</p>;

  return (
    <ResponsiveContainer width={"100%"} height={"80%"}>
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

        <Line dot={false} type="monotone" dataKey="price" stroke="#8884d8" />
        {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
      </LineChart>
    </ResponsiveContainer>
  );
}

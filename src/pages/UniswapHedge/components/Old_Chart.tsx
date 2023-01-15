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

import { useMemo } from "react";
import { TransformedPoolEvent } from "../../../scripts/uniswap/types";

export interface Position {
  priceLower: number;
  priceUpper: number;
}

export interface ChartProps {
  loading: boolean;
  error: any;
  data: TransformedPoolEvent[];
  verticalLines?: { xValue: number; label: string; stroke?: string }[];
  horizontalLines?: { yValue: number; label: string; stroke?: string }[];
}

export default function Chart({
  data: uniswapPoolTransaction,
  loading,
  verticalLines,
  horizontalLines,
}: ChartProps) {
  const { data, yMin, yMax } = useMemo(() => {
    const data = uniswapPoolTransaction;

    const yMin = Math.min(...data.map((d: any) => d.priceInverse));
    const yMax = Math.max(...data.map((d: any) => d.priceInverse));
    return {
      data,
      yMin: Math.ceil(yMin - 0.005 * yMin),
      yMax: Math.ceil(yMax + 0.005 * yMax),
    };
  }, [uniswapPoolTransaction]);

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

  //  if (error) return <p>{error}</p>;
  if (uniswapPoolTransaction.length === 0) return <p>{"No Data"}</p>;

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

        {horizontalLines?.map((line) => (
          <ReferenceLine
            y={line.yValue}
            label={line.label}
            stroke={line.stroke || "red"}
          />
        ))}
        {verticalLines?.map((vl) => (
          <ReferenceLine
            x={vl.xValue}
            stroke={vl.stroke || "red"}
            label={vl.label}
          />
        ))}

        <Line
          dot={false}
          type="monotone"
          dataKey="priceInverse"
          stroke="#8884d8"
        />
        {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
      </LineChart>
    </ResponsiveContainer>
  );
}

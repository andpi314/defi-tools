import { Scatter } from "react-chartjs-2";
import {
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import Chart from "chart.js/auto";
import Loader from "../../../atomics/atom/loader";
import annotationPlugin from "chartjs-plugin-annotation";
import zoomPlugin from "chartjs-plugin-zoom";
import React, { useMemo } from "react";
import { TransformedPoolEvent } from "../../../scripts/uniswap/types";

Chart.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  annotationPlugin,
  zoomPlugin
);

// new Date(1674000000000).toISOString() -- new Date(1673136000000).toISOString()

export interface ChartProps {
  loading: boolean;
  error: any;
  data: any;
  subData?: any;
}

export interface ComputedFeeRatioCounter {
  l: number;
}

export function computeFeeRatio(events: TransformedPoolEvent[]): {
  feeRatio: number;
  timestamp: number;
} {
  // We expect the events to be sorted by timestamp

  const { 0: first, length, [length - 1]: last } = events;

  const { l } = events.reduce(
    (acc: ComputedFeeRatioCounter, curr, index) => {
      // Skip first and last element
      if (index === 0 || index === length - 1) return acc;

      const prev = events[index - 1];

      const priceVariation = Math.abs(
        Math.sqrt(curr.price) - Math.sqrt(prev.price)
      );

      acc.l = acc.l + priceVariation;

      return acc;
    },
    {
      l: 0,
    }
  );

  const feeTier = parseInt(last.raw.pool.feeTier) / 10_000; /// 100;

  const feeRatio =
    (l - Math.abs(Math.sqrt(first.price) - Math.sqrt(last.price))) *
    feeTier *
    1000;

  console.log("Fee Ratio", feeRatio);

  return {
    feeRatio,
    timestamp: last.timestamp,
  };
}

// A function that groups an array in a bundles of a given size
export function groupArray<T>(array: T[], size: number) {
  const groups = [];
  for (let i = 0; i < array.length; i += size) {
    groups.push(array.slice(i, i + size));
  }
  return groups;
}

export default function FeeAnalysis(p: ChartProps) {
  const chartRef = React.useRef(null);

  console.log("Data", p.data?.data);

  // data frame
  const df = p.data?.data || [];

  const processedData = useMemo(() => {
    const bundleGroupedData = groupArray<TransformedPoolEvent>(df || [], 200);

    const computedData = bundleGroupedData.map((bundle) => {
      const { feeRatio, timestamp } = computeFeeRatio(bundle);
      return {
        feeRatio,
        timestamp,
      };
    });

    // Normalize data to better fit the chart

    // const maxFeeRatio = Math.max(...computedData.map((el) => el.feeRatio));
    // const minFeeRatio = Math.min(...computedData.map((el) => el.feeRatio));

    // const normalizedData = computedData.map((el) => ({
    //   ...el,
    //   feeRatio: (el.feeRatio - minFeeRatio) / (maxFeeRatio - minFeeRatio),
    // }));

    return computedData;
  }, [df]);

  // console.log("Processed data", processedData);

  if (p.loading)
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
  if (p.error) return <div>Error: {p.error}</div>;

  const data = {
    labels: processedData
      //.filter((el) => !!el)
      .map((el: any) => el?.timestamp || null),
    // datasets is an array of objects where each object represents a set of data to display corresponding to the labels above. for brevity, we'll keep it at one object
    datasets: [
      {
        id: 1,
        label: "Fee Ratio",
        // fill: false,
        // yAxisID: "y",
        // pointStyle: "false",
        data: processedData
          //.filter((el) => !!el)
          .map((el: any) => ({
            x: el?.timestamp,
            y: el?.feeRatio,
          })),
        showLine: true,
      },
    ],
  };

  const handleResetZoom = () => {
    if (chartRef && chartRef.current) {
      (chartRef.current as any).resetZoom();
    }
  };

  return (
    <div style={{ margin: 32, paddingBottom: 96 }} className="chart-container">
      <b>{"Fee Analysis chart"}</b>
      <p>
        {
          "Zoom enabled: Hold Shift and use your mouse to zoom in (+) or out (-)"
        }
      </p>
      <button onClick={handleResetZoom}>Reset Zoom</button>
      <Scatter
        ref={chartRef}
        data={data}
        datasetIdKey="id"
        plugins={[]}
        options={{
          maintainAspectRatio: true,
          plugins: {
            annotation: {
              annotations: [
                {
                  // Reference line of 1
                  type: "line",
                  scaleID: "y",
                  value: 1,
                  borderColor: "rgb(75, 192, 192)",
                  borderWidth: 1,
                  label: {
                    content: "Test label",
                  },
                },
              ],
            },
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                  modifierKey: "shift",
                },
                pinch: {
                  enabled: true,
                },
                drag: {
                  enabled: true,
                  modifierKey: "ctrl",
                },
                mode: "x",
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              position: "left",
              max: Math.min(...processedData.map((el) => el.feeRatio)) * 10,
            },
          },
          // spanGaps: true,
          elements: {
            point: {
              radius: 0,
            },
            line: {
              borderWidth: 1,
            },
          },
        }}
      />
    </div>
  );
}

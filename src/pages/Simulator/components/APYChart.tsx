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
import React from "react";

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
  label: string;
}

export default function APYChart(p: ChartProps) {
  const chartRef = React.useRef(null);

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

  const avg =
    p.data?.reduce((acc: any, el: any) => acc + el?.simulation, 0) /
    p.data?.length;

  const data = {
    labels: p?.data.map((el: any, index: number) => index),
    // datasets is an array of objects where each object represents a set of data to display corresponding to the labels above. for brevity, we'll keep it at one object
    datasets: [
      {
        id: 1,
        label: `${p.label} | Avg APY: ${avg.toFixed(2)}%`,
        // stepped: true,
        // fill: false,
        // yAxisID: "y",
        // pointStyle: "false",
        data: p.data?.map((el: any, index: number) => ({
          x: index,
          y: el?.simulation,
        })),
        showLine: true,
      },
    ],
  };

  const dataBotCount = {
    labels: p?.data.map((el: any, index: number) => index),
    // datasets is an array of objects where each object represents a set of data to display corresponding to the labels above. for brevity, we'll keep it at one object
    datasets: [
      {
        id: 1,
        label: `Bot Intervention Counter ${p.data?.reduce(
          (acc: any, curr: any) => acc + curr?.botInventionCount,
          0
        )}`,
        // stepped: true,
        // fill: false,
        // yAxisID: "y",
        // pointStyle: "false",
        backgroundColor: "#5e35b1",
        borderColor: "#5e35b1",
        color: "#5e35b1",
        data: p.data?.map((el: any, index: number) => ({
          x: index,
          y: el?.botInventionCount,
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
    <div
      style={{ margin: 32, paddingBottom: 12, flex: 1 }}
      className="chart-container"
    >
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
                  value: 0,
                  borderColor: "black",
                  borderWidth: 1,
                  // label: {
                  //   content: "Test label",
                  // },
                },
                {
                  // Reference line of 1
                  type: "line",
                  scaleID: "y",
                  value: avg,
                  borderColor: "red",
                  borderWidth: 1,
                  label: {
                    content: `Average APY ${avg}`,
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
              //  beginAtZero: true,
              position: "left",
              max: 150,
              min: -300,
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
      <Scatter
        data={dataBotCount}
        datasetIdKey="id-2"
        plugins={[]}
        options={{
          maintainAspectRatio: true,
          plugins: {
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
      <p style={{ fontSize: 12 }}>
        {
          "Zoom enabled: Hold Shift and use your mouse to zoom in (+) or out (-)"
        }
      </p>
      <button onClick={handleResetZoom}>Reset Zoom</button>
    </div>
  );
}

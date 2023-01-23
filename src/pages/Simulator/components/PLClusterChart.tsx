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

export interface ChartProps {
  loading: boolean;
  error: any;
  data: any;
}

export default function PLClusterChart(p: ChartProps) {
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

  const data = {
    labels: p.data?.map((el: any) => el?.from || null),
    // datasets is an array of objects where each object represents a set of data to display corresponding to the labels above. for brevity, we'll keep it at one object
    datasets: [
      {
        id: 1,
        label: "PL Clusters",
        // stepped: true,
        // fill: false,
        // yAxisID: "y",
        // pointStyle: "false",
        data: p.data?.map((el: any) => ({
          x: el?.from,
          y: el?.count,
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
                },
                mode: "x",
              },
            },
          },
          scales: {
            y: {
              //   beginAtZero: true,
              position: "left",
            },
          },
          //spanGaps: true,
          elements: {
            point: {
              radius: 0,
            },
            line: {
              borderWidth: 1,
            },
          },
          // scales: {
          //   y: {
          //     type: "linear",
          //     display: true,
          //     position: "left",
          //   },
          //   y1: {
          //     type: "linear",
          //     display: true,
          //     position: "right",

          //     // grid line settings
          //     grid: {
          //       drawOnChartArea: false, // only want the grid lines for one axis to show up
          //     },
          //   },
          // },
          // plugins: {
          //   title: {
          //     display: true,
          //     text: "Transactions processed",
          //   },
          //   legend: {
          //     display: false,
          //   },
          // },
        }}
      />
    </div>
  );
}

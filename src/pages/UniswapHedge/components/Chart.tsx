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

// get random between range function with step
function getRandomArbitrary(min: number, max: number, step: number) {
  return Math.floor((Math.random() * (max - min)) / step) * step + min;
}

const verticalLinePlugin = {
  getLinePosition: function (chart: any, pointIndex: any) {
    const meta = chart.getDatasetMeta(0); // first dataset is used to discover X coordinate of a point
    const data = meta.data;
    return data[pointIndex]._model.x;
  },
  renderVerticalLine: function (chartInstance: any, pointIndex: any) {
    const lineLeftOffset = this.getLinePosition(chartInstance, pointIndex);
    const scale = chartInstance.scales["y-axis-0"];
    const context = chartInstance.chart.ctx;

    // render vertical line
    context.beginPath();
    context.strokeStyle = "#ff0000";
    context.moveTo(lineLeftOffset, scale.top);
    context.lineTo(lineLeftOffset, scale.bottom);
    context.stroke();

    // write label
    context.fillStyle = "#ff0000";
    context.textAlign = "center";
    context.fillText(
      "MY TEXT",
      lineLeftOffset,
      (scale.bottom - scale.top) / 2 + scale.top
    );
  },

  afterDatasetsDraw: function (chart: any, easing: any) {
    if (chart.config.lineAtIndex) {
      chart.config.lineAtIndex.forEach((pointIndex: any) =>
        this.renderVerticalLine(chart, pointIndex)
      );
    }
  },
};

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

export default function CustomChart(p: ChartProps) {
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

  const yMax = Math.max(...(p.data?.data || []).map((el: any) => el.price));
  const yMin = Math.min(...(p.data?.data || []).map((el: any) => el.price));
  const yMid = yMax - (yMax - yMin) / 2;

  const data = {
    labels: p.data?.data
      //.filter((el) => !!el)
      .map((el: any) => el?.timestamp || null),
    // datasets is an array of objects where each object represents a set of data to display corresponding to the labels above. for brevity, we'll keep it at one object
    datasets: [
      {
        id: 1,
        label: "Pool Price",
        stepped: true,
        // fill: false,
        // yAxisID: "y",
        // pointStyle: "false",
        data: p.data?.data
          //.filter((el) => !!el)
          .map((el: any) => ({
            x: el?.timestamp,
            y: el?.price,
          })),
        showLine: true,
      },
      {
        id: 2,
        hidden: true,
        label: "PnL",
        stepped: true,
        yAxisID: "y1",
        showLine: true,
        data: p.subData?.pnl_array.map((el: any) => ({
          x: el?.time,
          y: el.value,
        })),
      },
      // {
      //   id: 3,
      //   label: "New Position",
      //   data: p.subData?.positionMovementEvent.map((el: any) => ({
      //     x: el?.time,
      //     y: el.value,
      //   })),
      // },
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
        plugins={
          [
            // DRAW VERTICAL LINE
            // {
            //   id: "verticalLine",
            //   afterDraw: (chart: { tooltip?: any; scales?: any; ctx?: any }) => {
            //     // eslint-disable-next-line no-underscore-dangle
            //     if (chart.tooltip._active && chart.tooltip._active.length) {
            //       // find coordinates of tooltip
            //       const activePoint = chart.tooltip._active[0];
            //       const { ctx } = chart;
            //       const { x } = activePoint.element;
            //       console.log("activePoint", x);
            //       const topY = chart.scales.y.top;
            //       const bottomY = chart.scales.y.bottom;
            //       // draw vertical line
            //       ctx.save();
            //       ctx.beginPath();
            //       ctx.moveTo(x, topY);
            //       ctx.lineTo(x, bottomY);
            //       ctx.lineWidth = 1;
            //       ctx.strokeStyle = "#1C2128";
            //       ctx.stroke();
            //       ctx.restore();
            //     }
            //   },
            // },
            // {
            //   id: "verticalLine",
            //   afterDatasetsDraw: (chart) => {
            //     const ctx = chart.ctx;
            //     const x =
            //       chart.scales["x-axis-0"].getPixelForValue(1673395200000);
            //     ctx.save();
            //     ctx.beginPath();
            //     ctx.moveTo(x, 0);
            //     ctx.lineTo(x, chart.height);
            //     ctx.lineWidth = 2;
            //     ctx.strokeStyle = "#ff0000";
            //     ctx.stroke();
            //     ctx.restore();
            //   },
            // },
          ]
        }
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
            annotation: {
              annotations: [
                // Vertical line
                ...(p.subData?.positionMovementEvent || []).map((el: any) => ({
                  type: "line",
                  id: "vline" + el.time,
                  mode: "vertical",
                  scaleID: "x",
                  value: el.time, // - 250,
                  borderColor: "black",
                  // el.value === "UP"
                  //   ? "rgb(0 128 2 / 50%)"
                  //   : "rgb(255 0 0 / 50%)",
                  borderWidth: 1,
                  // label: {
                  //   enabled: true,
                  //   position: "top",
                  //   content: el.value || "TIP",
                  // },
                })),
                // Label
                ...(p.subData?.positionMovementEvent || []).map(
                  (el: any, index: any) => ({
                    type: "label",
                    id: "label" + el.time,
                    xValue: el.time, //- 250,
                    yValue:
                      el.value === `UP`
                        ? getRandomArbitrary(yMid, yMax, 10)
                        : getRandomArbitrary(yMin, yMid, 10),
                    //    (el.value === "UP" ? +100 : -100),
                    borderRadius: 8,
                    backgroundColor: "rgba(245,245,245)",
                    // el.value
                    content: [`${index}`],
                  })
                ),
              ],
            },
          },
          scales: {
            y: {
              //   beginAtZero: true,
              position: "left",
            },
            y1: {
              beginAtZero: true,
              position: "right",
            },
          },
          spanGaps: true,
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

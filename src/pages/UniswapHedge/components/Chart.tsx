import { Scatter } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import Chart from "chart.js/auto";
import Loader from "../../../atomics/atom/loader";

Chart.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

// new Date(1674000000000).toISOString() -- new Date(1673136000000).toISOString()

export interface ChartProps {
  loading: boolean;
  error: any;
  data: any;
}

export default function CustomChart(p: ChartProps) {
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

  console.log("p.data", p.data);

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
      // {
      //   id: 2,
      //   label: "l Sum",
      //   yAxisID: "y1",
      //   // fill: false,
      //   pointStyle: "false",
      //   data: p.data?.lCumValues
      //     //.filter((el) => !!el)
      //     .map((el: any) => el?.value || null),
      // },
    ],
  };

  //   console.log("data", data);

  return (
    <div style={{ margin: 32, paddingBottom: 96 }} className="chart-container">
      <Scatter
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
          scales: {
            y: {
              beginAtZero: true,
            },
          },

          spanGaps: true,
          elements: {
            point: {
              radius: 0,
            },
            line: {
              borderWidth: 1,
              backgroundColor: "#000000",
              borderColor: "#000000",
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

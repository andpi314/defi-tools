import { Line } from "react-chartjs-2";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import Loader from "../../../atomics/atom/loader";
Chart.register(CategoryScale);

export interface ChartProps {
  loading: boolean;
  error: any;
  data: any[];
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

  //   console.log("p.data", p.data);

  const data = {
    labels: p.data
      //.filter((el) => !!el)
      .map((el) => el?.createdOn || null),
    // datasets is an array of objects where each object represents a set of data to display corresponding to the labels above. for brevity, we'll keep it at one object
    datasets: [
      {
        id: 1,
        label: "Main Pool",
        stepped: true,
        fill: false,
        pointStyle: "false",
        data: p.data
          //.filter((el) => !!el)
          .map((el) => el?.price || null),
      },
    ],
  };

  //   console.log("data", data);

  return (
    <div style={{ margin: 32, paddingBottom: 96 }} className="chart-container">
      <Line
        data={data}
        datasetIdKey="id"
        options={{
          spanGaps: true,
          elements: {
            point: {
              radius: 0,
            },
          },
          plugins: {
            title: {
              display: true,
              text: "Transactions processed",
            },
            legend: {
              display: false,
            },
          },
        }}
      />
    </div>
  );
}

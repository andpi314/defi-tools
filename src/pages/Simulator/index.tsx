import { DefaultClient } from "../../api/backend";
import { useOperationLazy } from "../../api/operations";
import Loader from "../../atomics/atom/loader";
import PLClusterChart from "./components/PLClusterChart";

export default function Simulator() {
  const simulationNew = useOperationLazy({
    operation: DefaultClient.simulationNew,
  });
  const handleSimulationStart = async () => {
    console.log("simulationNew");
    await simulationNew.invoke({
      startDate: "2023-01-12T00:00:00.000Z",
      endDate: "2023-01-18T00:00:00.000Z",
      samplingInterval: 30,
      poolAddress: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
      chainId: 1,
    });
  };

  // console.log(simulationNew.state.data?.plClusters);

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h2> {"Running simulation"}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <h3>{"Simulation settings"}</h3>
          <button onClick={() => handleSimulationStart()}>
            {"New Simulation"}
          </button>
        </div>
        <div>
          {simulationNew.state.loading && <Loader />}
          {simulationNew.state?.data && (
            <div
              style={{
                padding: 12,
                margin: 4,
                borderRadius: 8,
                borderTop: "1px solid #000",
                boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
              }}
            >
              <div>{`ev: ${simulationNew.state.data.ev}`}</div>
              <div>{`evY: ${simulationNew.state.data.evY}`}</div>
              <div>{`totalSampleY: ${simulationNew.state.data.totalSampleY}`}</div>
              <div>{`L: ${simulationNew.state.data.L}`}</div>
              <div>{`ySample: ${simulationNew.state.data.ySample}`}</div>
              <div>
                <span>{`Range between`}</span>
                <b>
                  {` ${simulationNew.state.data.pa.toFixed(
                    2
                  )} - ${simulationNew.state.data.pb.toFixed(2)}`}{" "}
                </b>
              </div>
              <div
                style={{
                  marginTop: 16,
                  fontSize: 16,
                  fontWeight: 600,
                  display: "inline-block",
                  color:
                    simulationNew.state.data.apy > 0 ? "#00a152" : "#f44336",
                  fontFamily: "sans-serif",
                }}
              >{`APY: ${simulationNew.state.data.apy.toFixed(2) || 0} % `}</div>
            </div>
          )}
        </div>

        <PLClusterChart
          error={simulationNew.state.error}
          loading={simulationNew.state.loading}
          data={
            simulationNew.state.data?.plClusters?.sort(
              (a: any, b: any) => a.from - b.from
            ) || []
          }
        />
      </div>
    </div>
  );
}

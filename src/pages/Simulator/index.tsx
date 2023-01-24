import { useState } from "react";
import { DefaultClient } from "../../api/backend";
import { useOperationLazy } from "../../api/operations";
import Loader from "../../atomics/atom/loader";
import { SupportedNetworks } from "../../scripts/uniswap";
import DateRangePicker, {
  end,
  start,
} from "../UniswapFee/components/DateRangePicker";
import PoolPicker from "../UniswapHedge/components/PoolPicker";
import PLClusterChart from "./components/PLClusterChart";
import PricesChart from "./components/PricesChart";

export default function Simulator() {
  const [pool, setPool] = useState<string>("");
  const simulationNew = useOperationLazy({
    operation: DefaultClient.simulationNew,
  });

  const [fetchRange, setFetchRange] = useState<{
    start: string;
    end: string;
    samplingIntervals: number;
  }>({
    end: new Date(end).toISOString(),
    start: new Date(new Date(start).getTime()).toISOString(),
    samplingIntervals: 20,
  });
  const [network, setNetwork] = useState<SupportedNetworks>(
    SupportedNetworks.ethereum
  );
  const handleSimulationStart = async () => {
    if (!pool) {
      alert("Select a pool first");
      return;
    }
    if (!fetchRange.end || !fetchRange.start) {
      alert("Select a range first");
      return;
    }
    if (!fetchRange.samplingIntervals) {
      alert("Select a sampling interval first");
      return;
    }
    if (simulationNew.state.loading) {
      alert("Wait for the previous simulation to finish");
      return;
    }
    await simulationNew.invoke({
      startDate: fetchRange.start,
      endDate: fetchRange.end,
      samplingInterval: fetchRange.samplingIntervals,
      poolAddress: pool,
      chainId: 1,
    });
  };

  const loading = false;
  // console.log(simulationNew.state.data?.plClusters);

  console.log(simulationNew.state.data?.prices);

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h2> {"Awesome simulator 🤗"}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <h3>{"Simulation settings"}</h3>
          <DateRangePicker
            onUpdate={(start, end, sampling) => {
              setFetchRange({
                start,
                end,
                samplingIntervals: sampling,
              });
            }}
          />
          <PoolPicker
            buttonLabel={"New Simulation"}
            onNetworkChange={(pool) => setNetwork(pool as any)}
            onPoolChange={setPool}
            selectedPool={pool}
            fetchDisabled={loading}
            disableFetchOnChange={true}
            onFetch={(pool) => handleSimulationStart()}
          />
          {/* <button disabled={!pool} onClick={() => handleSimulationStart()}>
            {"New Simulation"}
          </button> */}
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
                    4
                  )} - ${simulationNew.state.data.pb.toFixed(4)}`}{" "}
                </b>
              </div>
              <div
                style={{
                  marginTop: 16,
                  fontSize: 16,
                  fontWeight: 600,
                  color:
                    simulationNew.state.data.apy > 0 ? "#00a152" : "#f44336",
                  fontFamily: "sans-serif",
                }}
              >{`APY al (90%): ${
                simulationNew.state.data.apy.toFixed(2) || 0
              }%`}</div>

              <div
                style={{
                  marginTop: 16,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >{`Probability of target APY of ${(
                simulationNew.state.data.targetAPY * 100
              ).toFixed(2)}%: ${
                simulationNew.state.data.probabilityTargetAPY.toFixed(2) || 0
              }%`}</div>
            </div>
          )}
        </div>

        <PLClusterChart
          error={simulationNew.state.error}
          loading={simulationNew.state.loading}
          ev={simulationNew.state.data?.ev || 0}
          data={
            simulationNew.state.data?.plClusters?.sort(
              (a: any, b: any) => a.from - b.from
            ) || []
          }
        />

        <PricesChart
          error={simulationNew.state.error}
          loading={simulationNew.state.loading}
          data={simulationNew.state.data?.prices || []}
        />
      </div>
    </div>
  );
}

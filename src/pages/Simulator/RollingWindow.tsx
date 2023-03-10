import { useState } from "react";
import { DefaultClient } from "../../api/backend";
import { useOperationLazy } from "../../api/operations";
import { SupportedNetworks } from "../../scripts/uniswap";
import DateRangePicker, {
  end,
  start,
} from "../UniswapFee/components/DateRangePicker";
import Input from "../UniswapFee/components/Input";
import PoolPicker from "../UniswapHedge/components/PoolPicker";
import PLClusterChart from "./components/PLClusterChart";
import PricesChart from "./components/PricesChart";

export function RollingWindow() {
  const [pool, setPool] = useState<string>("");
  const simulationNew = useOperationLazy({
    operation: DefaultClient.simulationNew,
  });

  const [projectionLength, setProjectionLength] = useState<number>(12);
  const [fetchRange, setFetchRange] = useState<{
    start: string;
    end: string;
    samplingIntervals: number;
  }>({
    end: new Date(end).toISOString(),
    start: new Date(new Date(start).getTime()).toISOString(),
    samplingIntervals: 20,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      projectionLength: projectionLength,
    });
  };

  const loading = simulationNew.state.loading;
  // console.log(simulationNew.state.data?.plClusters);

  return (
    <div>
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

        {/* <button disabled={!pool} onClick={() => handleSimulationStart()}>
            {"New Simulation"}
          </button> */}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <PoolPicker
            buttonLabel={"New Simulation"}
            onNetworkChange={(pool) => setNetwork(pool as any)}
            onPoolChange={setPool}
            selectedPool={pool}
            fetchDisabled={loading}
            disableFetchOnChange={true}
            onFetch={(pool) => handleSimulationStart()}
          />
          <div style={{ marginTop: 8 }}>
            <Input
              value={projectionLength}
              step={1}
              label={"Projection length (hours)"}
              type={"number"}
              onChange={(e) => setProjectionLength(parseInt(e.target.value))}
            />
          </div>
        </div>
        <div style={{ minHeight: 250 }}>
          {/* {simulationNew.state.loading && <Loader />} */}
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
              <div
                style={{ marginBottom: 4 }}
              >{`ev: ${simulationNew.state.data.ev}`}</div>
              <div
                style={{ marginBottom: 4 }}
              >{`evY: ${simulationNew.state.data.evY}`}</div>
              <div
                style={{ marginBottom: 4 }}
              >{`totalSampleY: ${simulationNew.state.data.totalSampleY}`}</div>
              <div
                style={{ marginBottom: 4 }}
              >{`L: ${simulationNew.state.data.L}`}</div>
              <div
                style={{ marginBottom: 4 }}
              >{`ySample: ${simulationNew.state.data.ySample}`}</div>
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
              >{`90% probability of having APY more than: ${
                simulationNew.state.data.apy.toFixed(2) || 0
              }%`}</div>

              <div
                style={{
                  marginTop: 16,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >{`Probability of target APY of ${simulationNew.state.data.targetAPY.toFixed(
                2
              )}% or more: ${
                simulationNew.state.data.probabilityTargetAPY.toFixed(2) || 0
              }%`}</div>

              <div
                style={{ marginTop: 16, fontStyle: "italic" }}
              >{`Actual APY: ${simulationNew.state.data.actualAPY.toFixed(
                2
              )} %`}</div>
            </div>
          )}
        </div>
        <div>
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
        </div>

        <div>
          <PricesChart
            error={simulationNew.state.error}
            loading={simulationNew.state.loading}
            data={simulationNew.state.data?.prices || []}
          />
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  DefaultClient,
  HedgeBotSimulationScenarioInput,
} from "../../api/backend";
import { useOperationLazy } from "../../api/operations";
import Loader from "../../atomics/atom/loader";
import DateRangePicker, {
  end,
  start,
} from "../UniswapFee/components/DateRangePicker";
import Input from "../UniswapFee/components/Input";
import { getPriceFromTick } from "../UniswapFee/processing";
import APYChart from "./components/APYChart";
import ScenarioInput from "./components/ScenarioInput";
import ScreenShooter from "../../atomics/organism/screen-shooter";
import { parseIntervalAsString } from "../../utils/date";

export function computeMaxLoss(
  hysteresis: number,
  fee: number
): { maxLoss: number; deltaPriceUp: number; deltaPriceDown: number } {
  const spacing = fee * 100 * 2;
  const tickPrice = 100;
  const tickPa = tickPrice - hysteresis * spacing;
  const tickPb = tickPrice + hysteresis * spacing;

  const price = getPriceFromTick(tickPrice);

  const Pa = getPriceFromTick(tickPa);
  const Pb = getPriceFromTick(tickPb);

  const y_initial = 100;
  const L = y_initial / (Math.sqrt(price) - Math.sqrt(Pa));
  const x_initial =
    (L * (1 - Math.sqrt(price) / Math.sqrt(Pb))) / Math.sqrt(price);

  const maxLoss =
    (L * (Math.sqrt(Pb) - Math.sqrt(price)) +
      L * (1 / Math.sqrt(Pb) - 1 / Math.sqrt(price)) * Pb) /
    (y_initial + x_initial * Pb);

  const deltaPriceUp = (Pb / price - 1) * 100;
  const deltaPriceDown = (Pa / price - 1) * 100;

  return {
    maxLoss: maxLoss * 100,
    deltaPriceUp,
    deltaPriceDown,
  };
}

const POOL_NAME = "METIS-WETH 0.3%";

export default function RollingWindowHedgeBot() {
  const [pool, setPool] = useState<string>("");
  const simulation = useOperationLazy({
    operation: DefaultClient.rollingWindowHedgeBot,
  });

  const [windowLength, setWindowLength] = useState<number>(360);
  const [rollingTime, setRollingTime] = useState<number>(24);
  const [scenarios, setScenarios] = useState<HedgeBotSimulationScenarioInput[]>(
    [
      {
        name: "Scenario 1 H=",
        hysteresis: 2,
      },
      {
        name: "Scenario 2 H=",
        hysteresis: 5,
      },
      {
        name: "Scenario 3 H=",
        hysteresis: 10,
      },
    ]
  );
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
  // const [network, setNetwork] = useState<SupportedNetworks>(
  //   SupportedNetworks.ethereum
  // );

  const handleSimulationStart = async () => {
    // if (!pool) {
    //   alert("Select a pool first");
    //   return;
    // }
    if (!fetchRange.end || !fetchRange.start) {
      alert("Select a range first");
      return;
    }
    if (!fetchRange.samplingIntervals) {
      alert("Select a sampling interval first");
      return;
    }
    if (simulation.state.loading) {
      alert("Wait for the previous simulation to finish");
      return;
    }
    await simulation.invoke({
      startDate: fetchRange.start,
      endDate: fetchRange.end,
      scenarios: scenarios,
      windowLength: windowLength,
      rollingTime: rollingTime,
      //   poolAddress: pool,
      //   chainId: 1,
      //   projectionLength: projectionLength,
    });
  };

  return (
    <>
      <h3>{`Simulation settings (${POOL_NAME})`}</h3>
      <DateRangePicker
        onUpdate={(start, end, sampling) => {
          setFetchRange({
            start,
            end,
            samplingIntervals: sampling,
          });
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {/* <div>
          <PoolPicker
            buttonLabel={"New Simulation"}
            onNetworkChange={(pool) => setNetwork(pool as any)}
            onPoolChange={setPool}
            selectedPool={pool}
            fetchDisabled={simulation.state.loading}
            disableFetchOnChange={true}
            onFetch={(pool) =>}
          />
        </div> */}
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <Input
            value={windowLength}
            step={1}
            label={"Window length (hours)"}
            type={"number"}
            onChange={(e) => setWindowLength(parseInt(e.target.value))}
          />
          <Input
            value={rollingTime}
            step={1}
            label={"Rolling time (hours)"}
            type={"number"}
            onChange={(e) => setRollingTime(parseInt(e.target.value))}
          />
          <button
            disabled={simulation.state.loading}
            onClick={handleSimulationStart}
          >
            {"New Simulation"}
          </button>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div>{"Run simulation across different scenarios (hysteresis)"}</div>
        <b>{"UPDATE POOl FEE to compute max loss"}</b>
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          {scenarios.map((scenario, index) => {
            return (
              <div>
                <div>
                  <ScenarioInput
                    key={index}
                    label={scenario.name || `Scenario ${scenario.hysteresis}`}
                    value={scenario.hysteresis.toString()}
                    onChange={(e) =>
                      setScenarios((prev) =>
                        prev.map((s, i) =>
                          i === index ? { ...s, hysteresis: parseInt(e) } : s
                        )
                      )
                    }
                  />

                  {/* <div
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: 4,
                    marginBottom: 4,
                    marginTop: 2,
                    display: "inline-block",
                  }}
                >{`ΔP-UP: ${deltaPriceUp.toFixed(
                  2
                )}% | ΔP-DOWN ${deltaPriceDown.toFixed(
                  2
                )}% | MaxLoss: ${maxLoss.toFixed(2)}%`}</div> */}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <button
            style={{ width: 100 }}
            onClick={() =>
              setScenarios((prev) => [
                ...prev,
                {
                  name: `Scenario ${scenarios.length + 1} H=`,
                  hysteresis: prev[prev.length - 1].hysteresis + 5,
                },
              ])
            }
          >
            {"Add"}
          </button>
          <button
            style={{ width: 100 }}
            onClick={() =>
              setScenarios([{ name: `Scenario ${1} H=`, hysteresis: 1 }])
            }
          >
            {"Reset"}
          </button>
        </div>
      </div>

      <h3>{"Simulation results "}</h3>
      {simulation.state.loading && <Loader />}

      <div>
        {simulation.state.data?.length > 0 ? (
          <>
            <div
              id={"historical-hedge-bot-chart"}
              style={{ padding: "16px 0px" }}
            >
              <div style={{ textAlign: "center", fontWeight: 600 }}>
                <div>{`Window length: ${windowLength}h | Rolling time: ${rollingTime}h | Time frame: ${
                  fetchRange.start.split("T")[0]
                } - ${fetchRange.end.split("T")[0]} (${parseIntervalAsString(
                  fetchRange.start,
                  fetchRange.end
                )} )`}</div>
              </div>
              <div style={{ display: "flex" }}>
                {simulation.state.data
                  .filter((el: any) => el.length > 0)
                  .map((el: any) => {
                    const hysteresis = el[0].hysteresis;
                    return (
                      <APYChart
                        label={`H=${hysteresis}`}
                        loading={simulation.state.loading}
                        error={simulation.state.error}
                        data={el}
                      />
                    );
                  })}
              </div>
            </div>
            <ScreenShooter
              fileName={POOL_NAME}
              addStyle={{ backgroundColor: "white", padding: 16 }}
              workingArea={"historical-hedge-bot-chart"}
            />
          </>
        ) : (
          <p>{"No data to show"}</p>
        )}
      </div>

      {/* <hr /> */}
      {/* <PricesChart
        loading={simulation.state.loading}
        error={simulation.state.error}
        data={simulation.state.data?.prices || []}
      /> */}
    </>
  );
}

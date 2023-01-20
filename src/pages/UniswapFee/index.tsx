import { useMemo, useState } from "react";
import { SupportedNetworks } from "../../scripts/uniswap";
import { transformEvent } from "../../scripts/uniswap/utils";

import Chart from "../UniswapHedge/components/Chart";
import PoolPicker from "../UniswapHedge/components/PoolPicker";
import { useUniswapPoolData } from "../UniswapHedge/hooks/useUniswapPoolData";
import ChartPriceAndPnl from "./components/ChartPriceAndPnl";
import DateRangePicker, { end, start } from "./components/DateRangePicker";
import FeeAnalysis from "./components/FeeAnalysis";
import Input from "./components/Input";
import {
  computeMetrics,
  computePoolMetrics,
  MetricsSettings,
} from "./processing";

/**
 * APY
 * PnL y per unità di L
 *
 * APY (Hedging)):
 * pnl (non per mille) / (y_initial + x * prezzo_iniziale)/ number_of_days *365 * 100
 *
 * @returns
 */

export default function UniswapFee() {
  const [pool, setPool] = useState<string>("");
  const [positionSettings, setPositionSettings] = useState<MetricsSettings>({
    slippage: 0.1,
    swapFee: 0,
    // expressed in tick
    hysteresis: 2,
  });
  const [network, setNetwork] = useState<SupportedNetworks>(
    SupportedNetworks.ethereum
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

  const { error, swaps, getSwaps, loading } = useUniswapPoolData();

  const handleFetch = (poolAddress: string) => {
    // console.log(`Fetching pool transactions for ${poolAddress}`);
    getSwaps(
      poolAddress,
      {
        startDate: fetchRange.start,
        endDate: fetchRange.end,
        samples: fetchRange.samplingIntervals,
      },
      network
    );
  };

  const processedData = useMemo(() => {
    if (!swaps.length) return undefined;
    return computeMetrics(swaps.map((el: any) => transformEvent(el)));
  }, [swaps]);

  const poolMetrics = useMemo(() => {
    if (!swaps.length) return undefined;

    return computePoolMetrics(
      swaps.map((el: any) => transformEvent(el)),
      positionSettings
    );
  }, [swaps, positionSettings]);
  // const tick = getClosestTick(1260, 60);
  // const price = getPriceFromTick(tick);

  return (
    <>
      <div>
        <Input
          label="Histeresis"
          value={positionSettings.hysteresis.toString()}
          style={{ width: 200, marginRight: 16 }}
          type={"number"}
          step={1}
          onChange={(e) =>
            setPositionSettings({
              ...positionSettings,
              hysteresis: parseFloat(e.target.value),
            })
          }
        />
      </div>
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
        onNetworkChange={(pool) => setNetwork(pool as any)}
        onPoolChange={setPool}
        selectedPool={pool}
        fetchDisabled={loading}
        onFetch={(pool) => handleFetch(pool)}
      />
      <p>{`Processing ${swaps.length} transactions`}</p>
      <hr />
      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr" }}>
        <div>
          {/* // First row */}
          <div style={{ display: "grid", gridTemplateColumns: ".2fr 1fr 1fr" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <b> {"Δ√l"} </b>
            </div>
            <div>
              <span>
                <b> {`Price  ${processedData?.data[0].price}`} </b>
              </span>
              <p>{`Computed Δl is: ${processedData?.lSum || "N/A"}`}</p>
              <p>{`Computed Δ√l  is: ${processedData?.sqrtDelta || "N/A"}`}</p>
              <p>{`Computed F = f * Δ(√l) is: ${
                (processedData?.F || 0) * 1000 || "N/A"
              } (* 10^-3)`}</p>
            </div>
            <div>
              <span>
                <b>{`Price Inverse (sqrtPricex96) ${processedData?.data[0].priceInverse}`}</b>
              </span>
              <p>{`Computed Δl is: ${processedData?.lSumInverse || "N/A"}`}</p>
              <p>{`Computed Δ√l  is: ${
                processedData?.sqrtDeltaPriceInverse || "N/A"
              }`}</p>
              <p>{`Computed F = f * Δ(√l) is: ${
                (processedData?.FPriceInverse || 0) * 1000 || "N/A"
              } (* 10^-3)`}</p>
            </div>
          </div>

          {/* // Second row */}
          <div style={{ display: "grid", gridTemplateColumns: ".2fr 1fr 1fr" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <b>{"Δ(1/√l)"} </b>
            </div>
            <div>
              <p>{`Computed Δl (inverse of price) is: ${
                processedData?.lSum || "N/A"
              }`}</p>
              <p>{`Computed Δ(1/√l)  (inverse of price) [delta in Token] is: ${
                processedData?.sqrtDeltaInverse || "N/A"
              }`}</p>
              <p>{`Computed F = f * Δ(1/√l) is: ${
                (processedData?.inverseF || 0) * 1000 || "N/A"
              } (* 10^-3)`}</p>
            </div>
            <div>
              <div>
                <p>{`Computed Δl (inverse of price) is: ${
                  processedData?.lSumInverse || "N/A"
                }`}</p>
                <p>{`Computed Δ(1/√l)  (inverse of price) [delta in Token] is: ${
                  processedData?.sqrtDeltaInversePriceInverse || "N/A"
                }`}</p>
                <p>{`Computed F = f * Δ(1/√l) is: ${
                  (processedData?.inverseFPriceInverse || 0) * 1000 || "N/A"
                } (* 10^-3)`}</p>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            padding: 12,
            margin: 4,
            borderRadius: 8,
            borderTop: "1px solid #000",
            boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
          }}
        >
          <p
            style={{
              fontFamily: "sans-serif",
              fontWeight: 600,
              letterSpacing: 0.2,
            }}
          >
            {"Simulation report"}
          </p>
          {/* <p>{`Δx Total  : ${poolMetrics?.deltaX_SqrtPrice}`}</p>
          <p>{`Δy Total  : ${poolMetrics?.deltaY_SqrtPrice}`}</p>

          <p>{`Fx Total  : ${poolMetrics?.F_x}`}</p>
          <p>{`Fy Total  : ${poolMetrics?.F_y}`}</p>

          <p>{`Bot x Total  : ${poolMetrics?.delta_x_signed}`}</p>
          <p>{`Bot y Total  : ${poolMetrics?.delta_y_signed}`}</p>

          <p>{`ΔX  : ${poolMetrics?.delta_X}`}</p>
          <p>{`ΔY  : ${poolMetrics?.delta_Y}`}</p> */}
          <p>{`y_origin  : ${poolMetrics?.y_origin || 0}`}</p>
          <p>{`y_final  : ${poolMetrics?.y_final || 0}`}</p>
          <p>{`Overall PnL (y)  : ${poolMetrics?.pnl || 0}`}</p>
          <p>
            {`Overall PnL (y)  : ${(poolMetrics?.pnl || 0) * 1000}`}
            <b>{" (* 1000)"}</b>
          </p>
          <p>
            {`APY Hedged (annualized):`}

            {poolMetrics?.apy_hedged ? (
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginLeft: 4,
                  display: "inline-block",
                  color: poolMetrics?.apy_hedged > 0 ? "#00a152" : "#f44336",
                  fontFamily: "sans-serif",
                }}
              >{`${poolMetrics?.apy_hedged.toFixed(2) || 0} % `}</span>
            ) : (
              "N/A"
            )}
          </p>
          {/* <p style={{}}>
            {`Overall PnL (y)  : ${poolMetrics?.pnl_y}`} <b>{"(* 1000)"}</b>
          </p> */}
        </div>
      </div>
      <span
        style={{
          padding: 4,
          borderRadius: 2,
          color: "white",
          backgroundColor:
            processedData?.lastProcessedIndex ===
            (processedData?.data.length || 1) - 1
              ? "green"
              : "red",
        }}
      >{`L integrity check: processed ${
        (processedData?.lastProcessedIndex || -1) + 1
      } out of ${processedData?.data.length}`}</span>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <Chart
            subData={poolMetrics}
            loading={loading}
            error={error}
            data={processedData}
          />
        </div>
        <div>
          <ChartPriceAndPnl
            subData={poolMetrics}
            loading={loading}
            error={error}
            data={processedData}
          />
        </div>
        <div>
          <FeeAnalysis
            subData={poolMetrics}
            loading={loading}
            error={error}
            data={processedData}
          />
        </div>
      </div>

      {processedData && processedData?.data?.length > 0 && <></>}
    </>
  );
}

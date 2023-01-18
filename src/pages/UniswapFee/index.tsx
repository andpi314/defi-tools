import { useMemo, useState } from "react";
import { SupportedNetworks } from "../../scripts/uniswap";
import { transformEvent } from "../../scripts/uniswap/utils";
import { parseIntervalAsString } from "../../utils/date";
import Chart from "../UniswapHedge/components/Chart";
import PoolPicker from "../UniswapHedge/components/PoolPicker";
import { useUniswapPoolData } from "../UniswapHedge/hooks/useUniswapPoolData";
import Input from "./components/Input";
import {
  computeMetrics,
  computePoolMetrics,
  MetricsSettings,
} from "./processing";

const start = "2023-01-08T00:00:00.000Z";
const end = "2023-01-18T00:00:00.000Z";

export default function UniswapFee() {
  const [pool, setPool] = useState<string>("");
  const [positionSettings, setPositionSettings] = useState<MetricsSettings>({
    slippage: 0.1,
    swapFee: 0.3,
    hysteresis: 1.2,
  });
  const [network, setNetwork] = useState<SupportedNetworks>(
    SupportedNetworks.ethereum
  );
  const [samplingInterval, setSamplingInterval] = useState<number>(30);
  const [dateRangeEdit, setDateRangeEdit] = useState<{
    start: string;
    end: string;
  }>({
    end: new Date(end).toISOString(),
    start: new Date(new Date(start).getTime()).toISOString(),
  });

  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    end: new Date(end).toISOString(),
    start: new Date(new Date(start).getTime()).toISOString(),
  });

  const updateDateRange = () => {
    setDateRange(dateRangeEdit);
  };

  const { error, swaps, getSwaps, loading } = useUniswapPoolData();

  const samplingIntervals = Math.ceil(
    (new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) /
      (samplingInterval * 60 * 1000)
  );

  const handleFetch = (poolAddress: string) => {
    console.log(`Fetching pool transactions for ${poolAddress}`);
    getSwaps(
      poolAddress,
      {
        startDate: dateRange.start,
        endDate: dateRange.end,
        samples: samplingIntervals,
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
  }, [swaps]);

  return (
    <>
      <p>{"Uniswap Fee"}</p>
      <div style={{ display: "flex", margin: "12px 0px" }}>
        <Input
          label="Start Date"
          value={dateRangeEdit.start}
          style={{ width: 200, marginRight: 16 }}
          onChange={(e) =>
            setDateRangeEdit({ ...dateRange, start: e.target.value })
          }
        />
        <Input
          label="End Date"
          value={dateRangeEdit.end}
          style={{ width: 200, marginRight: 16 }}
          onChange={(e) =>
            setDateRangeEdit({ ...dateRange, end: e.target.value })
          }
        />
        <Input
          label="Sampling Interval (minutes)"
          type={"number"}
          step={1}
          value={samplingInterval}
          style={{ width: 80, marginRight: 16 }}
          onChange={(e) => setSamplingInterval(parseInt(e.target.value))}
        />
        <div style={{ width: 250, textAlign: "center", margin: "0px 16px" }}>
          <div>
            {`Range width: ${parseIntervalAsString(
              dateRange.start,
              dateRange.end
            )}`}
          </div>

          <div>{`Sampling intervals: ${samplingIntervals}`}</div>
        </div>
        <button
          style={{
            marginLeft: 8,
            minHeight: 30,
            background: "transparent",
            outline: "none",
            border: "1px solid #000",
            borderRadius: 2,
            cursor: "pointer",
          }}
          onClick={updateDateRange}
        >
          {"Update Date Range"}
        </button>
      </div>

      <PoolPicker
        onNetworkChange={(pool) => setNetwork(pool as any)}
        onPoolChange={setPool}
        selectedPool={pool}
        fetchDisabled={loading}
        onFetch={(pool) => handleFetch(pool)}
      />
      <p>{`Processing ${swaps.length} transactions`}</p>

      <hr />

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

      <div style={{ border: "1px solid black", padding: 6, margin: 4 }}>
        <p>{`Δx Total  : ${poolMetrics?.deltaX_SqrtPrice}`}</p>
        <p>{`Δy Total  : ${poolMetrics?.deltaY_SqrtPrice}`}</p>

        <p>{`Fx Total  : ${poolMetrics?.F_x}`}</p>
        <p>{`Fy Total  : ${poolMetrics?.F_y}`}</p>

        <p>{`Bot x Total  : ${poolMetrics?.delta_x_signed}`}</p>
        <p>{`Bot y Total  : ${poolMetrics?.delta_y_signed}`}</p>

        <p>{`ΔX  : ${poolMetrics?.delta_X}`}</p>
        <p>{`ΔY  : ${poolMetrics?.delta_Y}`}</p>

        <p>
          {`Overall PnL  : ${poolMetrics?.pnl}`} <b>{"(* 1000)"}</b>
        </p>
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

      <Chart loading={loading} error={error} data={processedData} />
      {processedData && processedData?.data?.length > 0 && <></>}
    </>
  );
}

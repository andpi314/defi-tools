import { useMemo, useState } from "react";
import { SupportedNetworks } from "../../scripts/uniswap";
import { parseIntervalAsString } from "../../utils/date";
import Chart from "../UniswapHedge/components/Chart";
import PoolPicker from "../UniswapHedge/components/PoolPicker";
import { useUniswapPoolData } from "../UniswapHedge/hooks/useUniswapPoolData";
import Input from "./components/Input";
import {
  computeMetrics,
  discardManyInGroup,
  groupByBlockNumber,
} from "./processing";

export default function UniswapFee() {
  const [pool, setPool] = useState<string>("");
  const [network, setNetwork] = useState<SupportedNetworks>(
    SupportedNetworks.ethereum
  );
  const [samplingInterval, setSamplingInterval] = useState<number>(30);
  const [dateRangeEdit, setDateRangeEdit] = useState<{
    start: string;
    end: string;
  }>({
    end: new Date("2023-01-13T10:00:00.000Z").toISOString(),
    start: new Date(
      new Date("2023-01-13T10:00:00.000Z").getTime() - 1000 * 60 * 60 * 1
    ).toISOString(),
  });

  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    end: new Date("2023-01-13T10:00:00.000Z").toISOString(),
    start: new Date(
      new Date("2023-01-13T10:00:00.000Z").getTime() - 1000 * 60 * 60 * 1
    ).toISOString(),
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

  // useEffect(() => {
  //   fetchPool();
  // }, []);

  const processedData = useMemo(() => {
    if (!swaps.length) return undefined;

    const grouped = groupByBlockNumber(swaps);

    const eligible = discardManyInGroup(grouped);

    return computeMetrics(eligible);
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
      <p>{`Computed L is: ${processedData?.lSum || "N/A"}`}</p>
      <p>{`Computed L (inverse of price) is: ${
        processedData?.lSumInverse || "N/A"
      }`}</p>

      <Chart loading={loading} error={error} data={processedData?.data || []} />
      {processedData && processedData?.data?.length > 0 && <></>}
    </>
  );
}

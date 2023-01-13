import { useMemo, useState } from "react";
import Select from "../../atomics/atom/select";
import { SupportedNetworks } from "../../scripts/uniswap";
import { parseIntervalAsString } from "../../utils/date";
import Chart from "../UniswapHedge/components/Chart";
import PoolPicker from "../UniswapHedge/components/PoolPicker";
import { useUniswapPool } from "../UniswapHedge/useUniswapPool";
import Input from "./components/Input";
import {
  computeMetrics,
  discardManyInGroup,
  groupByBlockNumber,
} from "./processing";

export default function UniswapFee() {
  const [pool, setPool] = useState<string>("");
  const [dateRangeEdit, setDateRangeEdit] = useState<{
    start: string;
    end: string;
  }>({
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() - 1000 * 60 * 60 * 2).toISOString(),
  });

  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() - 1000 * 60 * 60 * 2).toISOString(),
  });

  const updateDateRange = () => {
    setDateRange(dateRangeEdit);
  };

  const {
    transactions: { loading, error, data: transactions, fetch },
  } = useUniswapPool();

  const handleFetch = (poolAddress: string) => {
    console.log(`Fetching pool transactions for ${poolAddress}`);
    fetch(poolAddress, {
      startDate: dateRange.start,
      endDate: dateRange.end,
    });
  };

  // useEffect(() => {
  //   fetchPool();
  // }, []);

  const processedData = useMemo(() => {
    if (!transactions || !transactions.swaps.length) return undefined;

    const data = transactions.swaps;

    const grouped = groupByBlockNumber(data);

    const eligible = discardManyInGroup(grouped);

    return computeMetrics(eligible);
  }, [transactions]);

  return (
    <>
      <p>{"Uniswap Fee"}</p>
      <Select
        onClick={(value) => console.log(value)}
        helpText="Select network"
        options={Object.values(SupportedNetworks).map((network) => ({
          label: `Network: ${network}`,
          value: network,
        }))}
      />
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
        <div style={{ width: 250, textAlign: "center", margin: "0px 16px" }}>
          {`Range width: ${parseIntervalAsString(
            dateRange.start,
            dateRange.end
          )}`}
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
        onPoolChange={setPool}
        selectedPool={pool}
        fetchDisabled={loading}
        onFetch={(pool) => handleFetch(pool)}
      />
      <p>{`Processing ${transactions.swaps.length} transactions`}</p>
      <p>{`Computed L is: ${processedData?.lSum || "N/A"}`}</p>

      <div style={{ display: "flex", margin: "auto" }}>
        <Chart loading={loading} error={error} data={transactions} />
      </div>
    </>
  );
}

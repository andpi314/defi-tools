import { useEffect, useState } from "react";
import { parseIntervalAsString } from "../../../utils/date";
import Input from "./Input";

export const start = "2022-01-01T00:00:00.000Z";
export const end = "2023-01-01T00:00:00.000Z";

export interface DateRangeProps {
  onUpdate: (start: string, end: string, samplingInterval: number) => void;
}
export default function DateRangePicker(p: DateRangeProps) {
  const [samplingInterval, setSamplingInterval] = useState<number>(30);
  const [interval, setInterval] = useState<string>("");
  const [samplingIntervals, setSamplingIntervals] = useState<number>(0);

  const [dateRangeEdit, setDateRangeEdit] = useState<{
    start: string;
    end: string;
  }>({
    end: new Date(end).toISOString(),
    start: new Date(start).toISOString(),
  });

  useEffect(() => {
    const samplingIntervals = Math.ceil(
      (new Date(dateRangeEdit.end).getTime() -
        new Date(dateRangeEdit.start).getTime()) /
        (samplingInterval * 60 * 1000)
    );
    const interval = parseIntervalAsString(
      dateRangeEdit.start,
      dateRangeEdit.end
    );
    setInterval(interval);
    setSamplingIntervals(samplingIntervals);
  }, []);

  const updateDateRange = () => {
    // setDateRange(dateRangeEdit);

    const samplingIntervals = Math.ceil(
      (new Date(dateRangeEdit.end).getTime() -
        new Date(dateRangeEdit.start).getTime()) /
        (samplingInterval * 60 * 1000)
    );
    const interval = parseIntervalAsString(
      dateRangeEdit.start,
      dateRangeEdit.end
    );
    setInterval(interval);
    setSamplingIntervals(samplingIntervals);
    p.onUpdate(dateRangeEdit.start, dateRangeEdit.end, samplingInterval);
  };

  return (
    <div style={{ display: "flex", margin: "12px 0px" }}>
      <Input
        label="Start Date"
        value={dateRangeEdit.start}
        style={{ width: 200, marginRight: 16 }}
        onChange={(e) =>
          setDateRangeEdit({ ...dateRangeEdit, start: e.target.value })
        }
      />
      <Input
        label="End Date"
        value={dateRangeEdit.end}
        style={{ width: 200, marginRight: 16 }}
        onChange={(e) =>
          setDateRangeEdit({ ...dateRangeEdit, end: e.target.value })
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
        <div>{`Range width: ${interval}`}</div>

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
  );
}

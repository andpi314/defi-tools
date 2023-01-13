import SelectPool from "../../../atomics/organism/select-pool";
import { useState } from "react";

export interface PoolPickerProps {
  onFetch: (pool: string) => void;
  onPoolChange: (pool: string) => void;
  selectedPool: string;
  fetchDisabled: boolean;
}

export default function PoolPicker({
  selectedPool,
  onFetch,
  fetchDisabled,
  onPoolChange,
}: PoolPickerProps) {
  const [pool, setPool] = useState<string>(selectedPool);

  const setAndFetch = (pool: string) => {
    setPool(pool);
    onPoolChange(pool);
    onFetch(pool);
  };

  return (
    <div>
      <label>{"Pool Address: "}</label>
      <input
        style={{
          width: 300,
          marginLeft: 8,
          minHeight: 26,
          border: "1px solid #000",
          borderRadius: 2,
        }}
        value={pool}
        onChange={(e) => {
          setAndFetch(e.target.value);
        }}
        type="text"
      />
      <SelectPool pool={pool} onPoolChange={setAndFetch} />

      <button
        disabled={fetchDisabled}
        style={{
          marginLeft: 8,
          minHeight: 30,
          background: "transparent",
          outline: "none",
          border: "1px solid #000",
          borderRadius: 2,
        }}
        onClick={() => {
          onFetch(pool);
        }}
      >
        {"Fetch Data"}
      </button>
    </div>
  );
}

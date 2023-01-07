import SelectPool from "../../../atomics/organism/select-pool";
import { useEffect, useState } from "react";

export interface PoolPickerProps {
  onFetch: (pool: string) => void;
  fetchDisabled: boolean;
}

export default function PoolPicker({
  onFetch,
  fetchDisabled,
}: PoolPickerProps) {
  const [pool, setPool] = useState<string>(
    "0x7bea39867e4169dbe237d55c8242a8f2fcdcc387"
  );

  useEffect(() => {
    onFetch(pool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        onChange={(e) => setPool(e.target.value)}
        type="text"
      />
      <SelectPool pool={pool} onPoolChange={setPool} />

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

import SelectPool, { SortBy } from "../../../atomics/organism/select-pool";
import { useState } from "react";

export interface PoolPickerProps {
  onFetch: (pool: string) => void;
  onPoolChange: (pool: string) => void;
  onNetworkChange: (pool: string) => void;
  selectedPool: string;
  fetchDisabled: boolean;
}

export default function PoolPicker({
  selectedPool,
  onFetch,
  fetchDisabled,
  onPoolChange,
  onNetworkChange,
}: PoolPickerProps) {
  const [pool, setPool] = useState<string>(selectedPool);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Alphabet);

  const setAndFetch = (pool: string) => {
    setPool(pool);
    onPoolChange(pool);
    onFetch(pool);
  };

  return (
    <div>
      <div>
        <span>{"Sort by"}</span>
        <input
          type="radio"
          onChange={() => setSortBy(SortBy.Alphabet)}
          checked={sortBy === SortBy.Alphabet}
          id={SortBy.Alphabet}
          disabled={sortBy === SortBy.Alphabet}
          value={SortBy.Alphabet}
        />
        <label htmlFor={SortBy.Alphabet}>{SortBy.Alphabet}</label>
        <input
          type="radio"
          onChange={() => setSortBy(SortBy.Volume)}
          checked={sortBy === SortBy.Volume}
          disabled={sortBy === SortBy.Volume}
          id={SortBy.Volume}
          value={SortBy.Volume}
        />
        <label htmlFor={SortBy.Volume}>{SortBy.Volume}</label>
      </div>
      <SelectPool
        sortBy={sortBy}
        onNetworkChange={(network) => {
          setPool("");
          onNetworkChange(network);
        }}
        pool={pool}
        onPoolChange={setAndFetch}
      />
      <div style={{ marginTop: 8 }}>
        <label style={{ marginLeft: 8 }}>{"Pool Address: "}</label>
        <input
          style={{
            width: 320,
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

        <button
          disabled={fetchDisabled || !pool}
          style={{
            marginLeft: 8,
            minHeight: 30,
            background: "transparent",
            outline: "none",
            border: "1px solid #000",
            borderRadius: 2,
            cursor: "pointer",
          }}
          onClick={() => {
            onFetch(pool);
          }}
        >
          {"Fetch Data"}
        </button>
      </div>
    </div>
  );
}

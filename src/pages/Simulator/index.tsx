import { useState } from "react";
import { RollingWindow } from "./RollingWindow";
import RollingWindowHedgeBot from "./RollingWindowHedgeBot";

export enum SimulatorEngine {
  statistical = "statistical",
  historical = "historical",
}

export default function Simulator() {
  const [option, setOption] = useState<SimulatorEngine>(
    SimulatorEngine.historical
  );

  const simulatorEngineRender = (engine: SimulatorEngine) => {
    switch (engine) {
      case SimulatorEngine.statistical:
        return <RollingWindow />;
      case SimulatorEngine.historical:
        return <RollingWindowHedgeBot />;
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h2> {"Awesome simulator 🤗"}</h2>

      <div style={{ marginBottom: 4, paddingBottom: 16 }}>
        <span>{"Simulator Engine"}</span>

        {Object.values(SimulatorEngine).map((engine) => (
          <span key={engine}>
            <input
              type="radio"
              onChange={() => setOption(engine)}
              checked={option === engine}
              id={engine}
              disabled={option === engine}
              value={option}
            />
            <label htmlFor={option}>{engine.replaceAll("-", " ")}</label>
          </span>
        ))}
      </div>
      {simulatorEngineRender(option)}
    </div>
  );
}

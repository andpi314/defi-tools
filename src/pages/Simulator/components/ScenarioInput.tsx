import styled from "styled-components";
import Input from "../../UniswapFee/components/Input";
import { computeMaxLoss } from "../RollingWindowHedgeBot";

const Wrapper = styled.div`
  display: inline-block;
  padding: 6px 8px;
  border-radius: 8px;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  margin-bottom: 12px;
`;

const RangeViewer = styled.div`
  width: 180px;
  height: 20px;
  //border: 1px solid red;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  ::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    border-top: 1px solid black;
    background: black;
    width: 100%;
    transform: translateY(-50%);
  }
  padding: 8px 0px;
`;
const LowerLimit = styled.div`
  width: 60px;
  height: 18px;
  border-left: 2px solid blue;
  background: white;
  text-align: left;
  // z-index: 2;
`;
const UpperLimit = styled.div`
  width: 60px;
  height: 18px;
  border-right: 2px solid green;
  background: white;
  text-align: right;
  //  z-index: 2;
`;

const LimitLabel = styled.div`
  font-size: 12px;
  line-height: 40px;
  padding: 0px 2px;
`;

const CenterLimit = styled.div`
  width: 60px;
  text-align: center;
  color: red;
  font-weight: 600;
  margin-top: 2px;
  font-size: 12px;
  height: 18px;
  // border: 1px solid violet;
  background: white;
  z-index: 2;
  line-height: 18px;
`;

export interface ScenarioInputProps {
  value: string;
  label?: string;
  onChange: (v: string) => void;
}
export default function ScenarioInput({
  value,
  label,
  onChange,
}: ScenarioInputProps) {
  const { maxLoss, deltaPriceDown, deltaPriceUp } = computeMaxLoss(
    parseInt(value),
    0.3
  );
  return (
    <Wrapper>
      <Input
        labelCustomStyle={{
          fontSize: 12,
          fontWeight: 600,
        }}
        style={{ width: 60, border: "none", outline: "none" }}
        value={value}
        step={1}
        label={label}
        type={"number"}
        onChange={(e) => onChange(e.target.value)}
      />
      <RangeViewer>
        <LowerLimit>
          <LimitLabel>
            {deltaPriceDown < -100 ? "∞" : `${deltaPriceDown.toFixed(2)}%`}
          </LimitLabel>
        </LowerLimit>
        <CenterLimit>
          <div
            style={{
              fontSize: 8,
              color: "black",
              padding: 0,
              margin: 0,
              lineHeight: 0,
              marginBottom: 2,
            }}
          >
            {"Max loss"}
          </div>
          {maxLoss > 1000 ? "∞" : `${maxLoss.toFixed(2)}%`}
        </CenterLimit>
        <UpperLimit>
          <LimitLabel>
            {deltaPriceUp > 1000 ? "∞" : `${deltaPriceUp.toFixed(2)}%`}
          </LimitLabel>
        </UpperLimit>
      </RangeViewer>
      <div style={{ textAlign: "center", fontSize: 10, marginTop: -6 }}>
        {"ΔP"}
      </div>
    </Wrapper>
  );
}

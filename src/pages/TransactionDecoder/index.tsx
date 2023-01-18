import { useState } from "react";
import Select from "../../atomics/atom/select";
import Input from "../UniswapFee/components/Input";

export enum EncodedPayloadType {
  StandardMethod = "standard-method",
  Multicall = "multicall",
}

export default function TransactionDecoder() {
  const [payloadType, setPayloadType] = useState<EncodedPayloadType>(
    EncodedPayloadType.Multicall
  );

  const [encodedPayload, setEncodedPayload] = useState<string>("");
  const [abi, setAbi] = useState<string>("");
  const options = [
    {
      label: "Standard Method",
      value: EncodedPayloadType.StandardMethod,
    },
    {
      label: "Multicall",
      value: EncodedPayloadType.Multicall,
    },
  ];
  return (
    <>
      <p>{"Transaction Decoder"}</p>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <div>
            <Select
              style={{ width: 180, margin: 6 }}
              onClick={(value) => {
                setPayloadType(value as EncodedPayloadType);
              }}
              helpText="Encoded payload type...."
              value={payloadType}
              options={options}
            />
          </div>
          <Input
            style={{ width: 180, margin: 6 }}
            placeholder="ABI"
            type={"text"}
            onChange={(el) => setAbi(el.target.value)}
            value={abi}
          />
          <div></div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ maxWidth: 450, lineBreak: "anywhere" }}>
            {encodedPayload}
          </div>
        </div>
      </div>
    </>
  );
}

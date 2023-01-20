import { useMemo, useState } from "react";
import Select from "../../atomics/atom/select";
import { Networks } from "../../scripts/config";
import { EtherscanScan } from "../../scripts/ftm-scan/ftm-scan.sdk";
import Input from "../UniswapFee/components/Input";
import HashElement from "./HashElement";
import {
  ITransactionDescription,
  SmartContractToolkit,
} from "./SmartContractHashDecoder";

enum EncodedPayloadType {
  StandardMethod = "standard-method",
  Multicall = "multicall",
}

const HashStyle = {
  border: "1px solid #d5dae2",
  borderRadius: "0.35rem",
  fontSize: ".875rem",
  display: "block",
  padding: ".75rem",
  background: "#f8f9fa",
  color: "#77838f",
  fontFamily:
    "SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",
};

export default function TransactionDecoder() {
  const [payloadType, setPayloadType] = useState<EncodedPayloadType>(
    EncodedPayloadType.Multicall
  );

  const [encodedPayload, setEncodedPayload] = useState<string>(
    "0xac9650d80000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002a000000000000000000000000000000000000000000000000000000000000000a40c49ccbe00000000000000000000000000000000000000000000000000000000000656470000000000000000000000000000000000000000000000101cee8b508a388b38000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000063c7aba0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000084fc6f78650000000000000000000000000000000000000000000000000000000000065647000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffff00000000000000000000000000000000ffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004449404b7c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f66be0b1980bfdd1cf8b40d2b35232845a95255000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000064df2ab5bb0000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f98400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f66be0b1980bfdd1cf8b40d2b35232845a9525500000000000000000000000000000000000000000000000000000000"
  );
  const [decodedPayload, setDecodedPayload] = useState<{
    loading: boolean;
    data: ITransactionDescription[];
    error: string | null;
  }>({
    loading: false,
    data: [],
    error: null,
  });
  const [contractAddress, setContractAddress] = useState<string>(
    "0xc36442b4a4522e871399cd717abdd847ab11fe88"
  );
  const [abi, setAbi] = useState<Map<string, string>>(new Map());
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

  async function etchAbi(contractAddress: string) {
    //const contractAddress = "0xc36442b4a4522e871399cd717abdd847ab11fe88"

    setDecodedPayload({
      loading: true,
      data: [],
      error: null,
    });

    if (!process.env.REACT_APP_ETHERSCAN_API_KEY)
      throw new Error("No etherscan api key found");

    const scan = new EtherscanScan(
      process.env.REACT_APP_ETHERSCAN_API_KEY,
      Networks.MAINNET
    );

    let abiForDecoding = abi.get(contractAddress) || "";

    if (!abiForDecoding) {
      try {
        const response = await scan.getAbiFromAddress(contractAddress);

        if (response.message === "OK") {
          abi.set(contractAddress, response.result);

          // console.log(response.result);
          setAbi(abi);
          abiForDecoding = response.result;
        } else {
          throw new Error(response.message);
        }
      } catch (e: any) {
        setDecodedPayload({
          loading: false,
          data: [],
          error: e.message,
        });
      }
    }

    const toolKit = new SmartContractToolkit(abiForDecoding);

    const decoded = toolKit.decodeMultiCall(encodedPayload);
    setDecodedPayload({
      loading: false,
      data: decoded,
      error: null,
    });
  }

  const isFetchDisabled = useMemo(() => {
    return !contractAddress || !encodedPayload;
  }, [encodedPayload, contractAddress]);

  function decode() {
    etchAbi(contractAddress);
  }

  return (
    <>
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1, padding: 6 }}>
          <div>
            <Select
              style={{ width: 200, marginBottom: 6 }}
              onClick={(value) => {
                setPayloadType(value as EncodedPayloadType);
              }}
              helpText="Encoded payload type..."
              value={payloadType}
              options={options}
            />
          </div>
          <Input
            style={{ width: "100%", marginLeft: 0, marginBottom: 6 }}
            placeholder="Contract Address"
            type={"text"}
            onChange={(el) => setContractAddress(el.target.value)}
            value={contractAddress}
          />

          <div>
            <textarea
              style={{
                width: "100%",
                height: 300,
                marginBottom: 6,
                ...HashStyle,
                paddingRight: 0,
              }}
              onChange={(el) => setEncodedPayload(el.target.value)}
              value={encodedPayload}
            />
          </div>
          <div>
            <button
              style={{ float: "right" }}
              disabled={isFetchDisabled}
              onClick={decode}
            >
              {"Decode"}
            </button>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ width: "100%", lineBreak: "anywhere" }}>
            {decodedPayload.loading && <p>{"Loading..."}</p>}
            {decodedPayload.error && <p>{decodedPayload.error}</p>}
            {decodedPayload.data.map((decodedPayloadElement) => (
              <HashElement
                key={decodedPayloadElement.method}
                decodedPayloadElement={decodedPayloadElement}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

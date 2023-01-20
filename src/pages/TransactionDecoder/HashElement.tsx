import { ITransactionDescription } from "./SmartContractHashDecoder";
import styled, { css } from "styled-components";
import { useState } from "react";

export interface HashElementProps {
  decodedPayloadElement: ITransactionDescription;
}

export const EncodeDecodeArea = styled.div`
  border: 1px solid #d5dae2;
  border-radius: 0.35rem;
  font-size: 0.875rem;
  display: block;
  padding: 0.75rem;
  background: #f8f9fa;
  color: #77838f;
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono,
    Courier New, monospace;
`;

export const RoundButton = styled.button<{ active: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #a3b2c3;
  z-index: 10;
  &:hover {
    cursor: pointer;
    border: 2px solid #a3b2c3;
  }
  ${(props) =>
    props.active &&
    css`
      background-color: #1e2022;
    `}
`;

export default function HashElement({
  decodedPayloadElement,
}: HashElementProps) {
  const [isOpen, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 16 }}>
      <span
        style={{
          color: "#77838f",
          fontFamily: "Helvetica,Arial,sans-serif",
          backgroundColor: "rgba(119,131,143,.1)",
          fontSize: ".74094rem",
          padding: "0.3rem 0.5rem",
          display: "inline-block",
          fontWeight: 500,
          minWidth: 280,
          marginBottom: 8,
          borderRadius: ".35rem",
        }}
      >
        {"Method: "}
        <span
          style={{
            color: "#1e2022",
            lineHeight: "1.3",
          }}
        >
          {decodedPayloadElement.method}
        </span>
        <RoundButton
          style={{ float: "right" }}
          onClick={() => setOpen(!isOpen)}
          active={isOpen}
        />
      </span>

      {/**  A simple table to show elements */}

      <EncodeDecodeArea
        style={{
          marginBottom: 8,
          //  maxHeight: isOpen ? "100%" : 0,
          overflow: "hidden",
        }}
      >
        {decodedPayloadElement.elements.map((el) => (
          <div key={el.key} style={{ marginBottom: 2 }}>
            <span style={{ minWidth: 180, display: "inline-block" }}>
              {`${el.key}:`}
            </span>
            <span
              style={{
                color: "#1e2022",
                lineHeight: "1.3",
              }}
            >
              {el.value}
            </span>
          </div>
        ))}
      </EncodeDecodeArea>

      {isOpen && (
        <EncodeDecodeArea>{decodedPayloadElement.hash}</EncodeDecodeArea>
      )}
    </div>
  );
}

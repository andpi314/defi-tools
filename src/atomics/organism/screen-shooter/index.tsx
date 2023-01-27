import React, { useState } from "react";
import { toPng, toSvg } from "html-to-image";
import { Wrapper } from "./styled";

export interface ScreenShooterProps {
  addStyle?: React.CSSProperties;
  workingArea?: string;
  fileName?: string;
}

export default function ScreenShooter({
  addStyle,
  fileName,
  workingArea = "workingArea",
}: ScreenShooterProps) {
  const [fileType, setFileType] = useState("png");
  const types = [
    {
      key: "png",
      label: ".png",
    },
    {
      key: "svg",
      label: ".svg",
    },
  ];

  const handleImage = async ({
    preview,
    download = true,
  }: any): Promise<any> => {
    const node: any = document.getElementById(workingArea);

    console.log("node", node.offsetWidth, node.offsetHeight);
    if (!node) alert("Unable to take screenshot No node found");

    const options = {
      width: node.offsetWidth,
      height: node.offsetHeight,
      quality: 1,
      pixelRatio: 1,
      style: {
        padding: "32px 16px",
        // display: "flex",

        // justifyContent: "center",
        // alignItems: "center",
        fontFamily: "Bebas Neue",
        ...((addStyle || {}) as any),
      },
    };

    const handleSuccess = (dataUrl: string) => {
      const img = new Image();
      img.src = dataUrl;
      if (preview) document.body.appendChild(img);
      if (download) {
        const link = document.createElement("a");
        const name = `${fileName || "screenshot"}-${Date.now()}`;
        link.download = `${name}.${fileType}`;
        link.href = dataUrl;
        link.click();
      }
    };

    const handleError = (error: any) => {
      console.error("oops, something went wrong!", error);
    };

    const workers: any = {
      png: () => toPng(node, options).then(handleSuccess).catch(handleError),
      svg: () => toSvg(node, options).then(handleSuccess).catch(handleError),
    };

    workers[fileType]();
  };

  return (
    <div style={{ display: "flex" }}>
      <Wrapper>
        <button
          style={{ margin: "auto" }}
          //   variant={"contained"}
          onClick={() => handleImage({ peview: false })}
        >
          {"Download Image"}
        </button>
      </Wrapper>
      <Wrapper>
        {types.map(({ key, label }) => (
          <div style={{ marginLeft: 16 }} key={key}>
            <input
              onChange={() => setFileType(key)}
              type="radio"
              id={key}
              name={"fileType"}
              value={key}
              checked={fileType === key}
            />
            <label htmlFor={key}>{label}</label>
          </div>
        ))}
      </Wrapper>
    </div>
  );
}

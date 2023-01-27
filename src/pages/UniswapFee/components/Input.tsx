import { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelCustomStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
}

export default function Input(p: InputProps) {
  return (
    <div style={p.containerStyle}>
      {p.label && <label style={p.labelCustomStyle}>{p.label}</label>}
      <input
        {...p}
        style={{
          width: 80,
          marginLeft: 8,
          minHeight: 26,
          border: "1px solid #000",
          borderRadius: 2,
          ...(p.style && p.style),
        }}
      />
    </div>
  );
}

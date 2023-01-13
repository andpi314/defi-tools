export interface SelectProps {
  style?: React.CSSProperties;
  options: { label: string; value: string }[];
  value?: string;
  helpText?: string;
  disabled?: boolean;
  onClick: (value: string) => void;
}

export default function Select({
  options,
  onClick,
  helpText,
  value,
  style,
  disabled,
}: SelectProps) {
  const text = helpText ? helpText : "Please choose one option";
  return (
    <select
      disabled={disabled}
      style={{ minHeight: 30, paddingRight: 16, ...(style && style) }}
      value={options.find((opt) => opt.value === value)?.value}
      onChange={(e) => {
        onClick(e.target.value);
      }}
    >
      <option>{text}</option>
      {options.map((option, index) => {
        return (
          <option value={option.value} key={index}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
}

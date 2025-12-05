import {InputNumber} from "antd";

interface MoneyStringProps {
  value?: number;
  min?: number;
  currency?: string;
  returnInteger?: boolean;
  placeholder?: string;
  block?: boolean;
  width?: number;
  style?: React.CSSProperties;
  defaultValue?: number;
  onChange?: (value?: number) => void;
  onCurrencyChange?: (value?: string) => void;
}

const currencies: any = {
  'PEN': 'S/',
  'USD': 'USD $',
};

const MoneyInput = (
  {
    value, style, block = true, currency = 'PEN',
    returnInteger = true,
    onChange, onCurrencyChange, width = 120, ...props
  }: MoneyStringProps
) => {
  return (
    <InputNumber
      style={block ? {width: '100%'} : {width}}
      onChange={value => {
        if (onChange) {
          onChange((value != null) ? (returnInteger ? value * 100 : value) : undefined);
        }
      }}
      prefix={currencies[currency]}
      value={(value != null || value != undefined) ? (returnInteger ? value / 100 : value) : null}
      {...props}
    />
  );
};

export default MoneyInput;

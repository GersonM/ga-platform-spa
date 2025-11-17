import {InputNumber} from "antd";

interface MoneyStringProps {
  value?: number;
  min?: number;
  currency?: string;
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
  {value, style, block = true, currency = 'PEN', onChange, onCurrencyChange, width = 120, ...props}: MoneyStringProps
) => {
  return (
    <InputNumber
      style={block ? {width: '100%'} : {width}}
      onChange={value => {
        if (onChange) {
          onChange((value != null) ? value * 100 : undefined);
        }
      }}
      addonBefore={currencies[currency]}
      value={(value != null || value != undefined) ? value / 100 : null}
      {...props}
    />
  );
};

export default MoneyInput;

import {InputNumber} from "antd";

interface MoneyStringProps {
  value?: number;
  currency?: string;
  placeholder?: string;
  onChange?: (value?: number) => void;
  onCurrencyChange?: (value?: string) => void;
}

const currencies: any = {
  'PEN': 'S/',
  'USD': 'USD $',
};

const MoneyInput = ({value, currency = 'PEN', onChange, onCurrencyChange, ...props}: MoneyStringProps) => {
  return (
    <InputNumber
      style={{width: '100%'}}
      onChange={value => {
        if (onChange) {
          onChange(value ? value * 100 : undefined);
        }
      }}
      prefix={currencies[currency]}
      value={value ? value / 100 : null}
      {...props}
    />
  );
};

export default MoneyInput;

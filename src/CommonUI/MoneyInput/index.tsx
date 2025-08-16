import {InputNumber} from "antd";

interface MoneyStringProps {
  value?: number;
  currency?: string;
  placeholder?: string;
  defaultValue?: number;
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

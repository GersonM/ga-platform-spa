import {useContext} from "react";
import AuthContext from "../../Context/AuthContext.tsx";

interface MoneyStringProps {
  value?: number;
  currency?: string;
  useMonospace?: boolean;
}

const MoneyString = ({value, currency = 'PEN', useMonospace = true}: MoneyStringProps) => {
  const {secureMode} = useContext(AuthContext);
  if (value === undefined) return null;
  const amount = value !== 0 ? value / 100 : value;
  const string = new Intl.NumberFormat('es-PE', {style: 'currency', currency:currency || 'PEN'}).format(amount);

  return (
    <span
      style={{
        color: amount < 0 ? 'red' : '',
        fontFamily: useMonospace ? 'monospace' : 'inherit',
      }}>
      {secureMode ? (currency + '****') : string}
    </span>
  );
};

export default MoneyString;

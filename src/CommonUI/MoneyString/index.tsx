import {useContext} from "react";
import AuthContext from "../../Context/AuthContext.tsx";

interface MoneyStringProps {
  value?: number;
  currency?: string;
}

const MoneyString = ({value, currency = 'PEN'}: MoneyStringProps) => {
  const {secureMode} = useContext(AuthContext);
  if (value === undefined) return null;
  const amount = value !== 0 ? value / 100 : value;
  const string = new Intl.NumberFormat('es-PE', {style: 'currency', currency:currency || 'PEN'}).format(amount);

  return (
    <code
      style={{
        color: amount < 0 ? 'red' : '',
      }}>
      {secureMode ? (currency + '****') : string}
    </code>
  );
};

export default MoneyString;

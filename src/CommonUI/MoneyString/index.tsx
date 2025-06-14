

interface MoneyStringProps {
  value?: number;
  currency?: string;
}

const MoneyString = ({value, currency = 'PEN'}: MoneyStringProps) => {
  if (value === undefined) return null;
  const amount = value !== 0 ? value / 100 : value;
  const string = new Intl.NumberFormat('es-PE', {style: 'currency', currency}).format(amount);

  return (
    <span
      style={{
        color: amount < 0 ? 'red' : '',
      }}>
      {string}
    </span>
  );
};

export default MoneyString;

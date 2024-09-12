import React from 'react';

interface MoneyStringProps {
  value?: number;
}

const MoneyString = ({value}: MoneyStringProps) => {
  if (value === undefined) return null;
  const amount = value !== 0 ? value / 100 : value;
  const string = new Intl.NumberFormat('es-PE', {style: 'currency', currency: 'PEN'}).format(amount);

  return (
    <span
      style={{
        color: amount < 0 ? 'red' : 'green',
      }}>
      {string}
    </span>
  );
};

export default MoneyString;

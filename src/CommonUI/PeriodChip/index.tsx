import React from 'react';

interface PeriodChipProps {
  period?: string;
}

const periods: any = {
  unique: 'Único',
  yearly: 'Anual',
  monthly: 'Mensual',
  daily: 'Diario',
}

const colors: any = {
  unique: 'blue',
  yearly: 'green',
  monthly: 'orange',
  daily: 'orange',
}

const PeriodChip = ({period}: PeriodChipProps) => {

  if (!period) return;
  return (
    <span style={{color: colors[period], fontWeight: 500, fontSize: 12, background:'rgba(255, 255, 255, 0.2)', padding: '2px 4px', borderRadius: 4}}>
      {periods[period]}
    </span>
  );
};

export default PeriodChip;

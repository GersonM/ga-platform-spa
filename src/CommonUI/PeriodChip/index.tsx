import React from 'react';
import CustomTag from "../CustomTag";

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

  if (!period || period == 'unique') return;
  return (
    <CustomTag color={colors[period]}>
      {periods[period]}
    </CustomTag>
  );
};

export default PeriodChip;

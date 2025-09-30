import React from 'react';
import './styles.less';
import MoneyString from "../../../CommonUI/MoneyString";

interface InvoiceResumenProps {
  items: { label: string, amount: number }[];
  currency: 'PEN' | 'USD' | string;
  showTotal?: boolean;
}

const InvoiceResumen = ({items, currency, showTotal = true}: InvoiceResumenProps) => {
  return (
    <div className="invoice-resumen-container">
      {items.map((item, index) => (
        <div className="invoice-resumen-item" key={index}>
          <span>{item.label}</span>
          <span className={'spacer'}></span>
          <MoneyString currency={currency} value={item.amount}/>
        </div>
      ))}
      {showTotal && (
        <div className="invoice-resumen-item total">
          <span>Total</span>
          <span className={'spacer'}></span>
          <MoneyString currency={currency} value={items.reduce((acc, cur) => acc + cur.amount, 0)}/>
        </div>
      )}
    </div>
  );
};

export default InvoiceResumen;

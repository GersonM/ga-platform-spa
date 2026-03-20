import React from 'react';
import MoneyString from "../../../CommonUI/MoneyString";
import type {StorageContractCartItem} from "../../../Types/api.tsx";
import './styles.less';

interface InvoiceResumenProps {
  items: StorageContractCartItem[];
  currency: 'PEN' | 'USD' | string;
  total?: number;
  includeTaxes?: boolean;
  applyTaxes?: boolean;
  showTotal?: boolean;
}

const InvoiceResumen = (
  {
    items,
    currency,
    total,
    showTotal = true,
    includeTaxes = false,
    applyTaxes = false
  }: InvoiceResumenProps) => {

  let calculatedTotal = items.reduce((acc, cur) => acc + ((cur.unit_amount || 0) * (cur.quantity || 1)), 0);
  let taxes = 0;
  if (applyTaxes) {
    if (includeTaxes) {
      taxes = calculatedTotal - (calculatedTotal / 1.18);
      //total -= taxes;
    } else {
      taxes = calculatedTotal * 0.18;
      calculatedTotal += taxes;
    }
  }

  return (
    <div className="invoice-resumen-container">
      {items.map((item, index) => (
        <div key={index} className="invoice-resumen-item">
          <span className={'label-item'}>
            {item.stock?.name} {item.quantity && <span>(x{item.quantity})</span>}
            {item.stock?.serial_number && <><br/><span>{item.stock.serial_number}</span></>}
          </span>
          <span className={'spacer'}></span>
          <div className={'amount'}><MoneyString currency={item.stock?.currency} value={(item.unit_amount || 0) * (item.quantity || 1)}/>
          </div>
        </div>
      ))}
      {applyTaxes && (
        <div className="invoice-resumen-item">
          <div className={'label'}>IGV (18%)</div>
          <div className={'spacer'}></div>
          <div className={'amount'}><MoneyString currency={items[0].stock?.currency} value={taxes}/></div>
        </div>
      )}
      {showTotal && (
        <div className="invoice-resumen-item total">
          <div className={'label'}>
            Total
          </div>
          <div className={'spacer'}></div>
          <div className={'amount'}><MoneyString currency={currency} value={total ?? calculatedTotal}/></div>
        </div>
      )}
    </div>
  );
};

export default InvoiceResumen;

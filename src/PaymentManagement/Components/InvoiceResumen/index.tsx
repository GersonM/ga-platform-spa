import React from 'react';
import MoneyString from "../../../CommonUI/MoneyString";
import './styles.less';

interface InvoiceResumenProps {
  items: { label: string, amount: number }[];
  currency: 'PEN' | 'USD' | string;
  includeTaxes?: boolean;
  applyTaxes?: boolean;
  showTotal?: boolean;
}

const InvoiceResumen = (
  {
    items,
    currency,
    showTotal = true,
    includeTaxes = false,
    applyTaxes = false
  }: InvoiceResumenProps) => {
  let total = items.reduce((acc, cur) => acc + cur.amount, 0);
  let taxes = 0;
  if (applyTaxes) {
    if (includeTaxes) {
      taxes = total - (total / 1.18);
      //total -= taxes;
    } else {
      taxes = total * 0.18;
      total += taxes;
    }
  }

  return (
    <div className="invoice-resumen-container">
      <>
        <table className="invoice-resumen-items">
          <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className={'label'}>{item.label}
                <div className={'spacer'}></div>
              </td>
              <td className={'amount'}><MoneyString currency={currency} value={item.amount}/></td>
            </tr>
          ))}
          {applyTaxes && (
            <tr>
              <td className={'label'}>IGV (18%)
                <div className={'spacer'}></div>
              </td>
              <td className={'amount'}><MoneyString currency={currency} value={taxes}/></td>
            </tr>
          )}
          </tbody>
          <tfoot>
          {showTotal && (
            <tr className="total">
              <td className={'label'}>Total
                <div className={'spacer'}></div>
              </td>
              <td className={'amount'}><MoneyString currency={currency} value={total}/></td>
            </tr>
          )}
          </tfoot>
        </table>
      </>

    </div>
  );
};

export default InvoiceResumen;

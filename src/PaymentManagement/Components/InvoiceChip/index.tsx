import React from 'react';
import type {Invoice} from "../../../Types/api.tsx";
import MoneyString from "../../../CommonUI/MoneyString";
import CustomTag from "../../../CommonUI/CustomTag";
import './styles.less';

interface InvoiceChipProps {
  invoice?: Invoice;
  boxed?: boolean;
}

const InvoiceChip = ({invoice, boxed = true}: InvoiceChipProps) => {
  const currency = invoice?.currency || 'PEN';
  return (
    <div className={`invoice-chip-container ${boxed ? 'boxed' : ''}`}>
      {invoice ? (
        <>
          <CustomTag>
            {invoice.tracking_id}
          </CustomTag>
          <div className="amounts">
            <div>
              <small>Pagado:</small>
              {invoice.pending_payment != null ?
                <MoneyString currency={currency} value={invoice.amount - invoice.pending_payment}/> : 'Sin información'}
            </div>
            <div>
              <small>Pendiente:</small>
              {invoice.pending_payment != null && <MoneyString currency={currency} value={invoice.pending_payment}/>}
            </div>
            <div>
              <small>Total:</small>
              <MoneyString currency={currency} value={invoice.amount}/>
            </div>
          </div>
        </>
      ) : <>
        <small>Sin información del requerimiento de pago</small>
      </>}
    </div>
  );
};

export default InvoiceChip;

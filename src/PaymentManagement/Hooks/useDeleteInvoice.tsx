import React, {useState} from 'react';
import axios from "axios";
import {sileo} from "sileo";
import ErrorHandler from "../../Utils/ErrorHandler.tsx";

const useDeleteInvoice = (onComplete?: () => void) => {
  const [loading, setLoading] = useState(false);

  const deleteInvoice = (uuid: string) => {

    setLoading(true);

    sileo.promise(
      axios.delete('payment-management/invoices/' + uuid),
      {
        loading: {title: 'Eliminando solicitud de pago'},
        success: (response) => {
          if (onComplete) onComplete();
          return {title: 'Completado', description: 'La solicitud de pago fue eliminada.'};
        },
        error: (error) => {
          ErrorHandler.showNotification(error);
          return {title: 'Error al eliminar la solicitud de pago.'};
        },
      }
    );
  };

  return {deleteInvoice, loading};
};

export default useDeleteInvoice;

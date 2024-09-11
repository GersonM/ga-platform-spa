import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {Col, Collapse, Divider, Empty, Progress, Row, Space, Tag} from 'antd';
import axios from 'axios';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ModuleContent from '../../../CommonUI/ModuleContent';
import EntityActivityManager from '../../../CommonUI/EntityActivityManager';
import {Contract, Invoice, MoveTrip} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import InvoiceTableDetails from '../../../PaymentManagement/Components/InvoiceTableDetails';

const CommercialContractDetail = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [reload, setReload] = useState(false);
  const [contract, setContract] = useState<Contract>();

  useEffect(() => {
    if (!params.contract) {
      return;
    }
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`commercial/contracts/${params.contract}`, config)
      .then(response => {
        if (response) {
          setContract(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [params, reload]);

  if (!params.contract) {
    return null;
  }

  return (
    <ModuleContent>
      <ContentHeader
        onRefresh={() => setReload(!reload)}
        onBack={() => {
          navigate('/commercial/clients');
        }}
        title="Commercial Contract"
      />
      <Row gutter={[20, 20]}>
        <Col span={12}>
          <EntityActivityManager uuid={params.contract} type={'commercial-contract'} />
        </Col>
        <Col span={12}>
          <h3>Facturas</h3>
          <Collapse
            items={contract?.invoices?.map(invoice => {
              return {
                extra: <>{invoice.paid_at ? <Tag color={'green'}>Pagado</Tag> : <Tag color={'red'}>Pendiente</Tag>}</>,
                label: invoice.concept + ' ' + invoice.amount,
                key: invoice.uuid,
                children: (
                  <div>
                    <InvoiceTableDetails invoice={invoice} />
                    <Divider />
                    <h3>Pagos</h3>
                    {invoice.payments?.length == 0 && (
                      <Empty description={'No hay pagos registrados'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                    {invoice.payments?.map((p, index) => {
                      return (
                        <div key={index}>
                          Monto: S/ {(p.amount / 100).toFixed(2)}
                          Comprobante: {p.voucher_code}
                        </div>
                      );
                    })}
                    <PrimaryButton label={'Registrar nuevo pago'} block ghost size={'small'} />
                  </div>
                ),
              };
            })}
          />
        </Col>
      </Row>
    </ModuleContent>
  );
};

export default CommercialContractDetail;

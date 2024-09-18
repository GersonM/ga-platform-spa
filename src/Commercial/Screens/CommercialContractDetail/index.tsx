import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import {Col, Collapse, Divider, Popconfirm, Row, Space, Tag} from 'antd';
import {PiHandshake} from 'react-icons/pi';
import axios from 'axios';
import dayjs from 'dayjs';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ModuleContent from '../../../CommonUI/ModuleContent';
import EntityActivityManager from '../../../CommonUI/EntityActivityManager';
import {Contract} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import InvoiceTableDetails from '../../../PaymentManagement/Components/InvoiceTableDetails';
import InvoiceTablePayments from '../../../PaymentManagement/Components/InvoiceTablePayments';
import MoneyString from '../../../CommonUI/MoneyString';
import ContractDetails from '../../Components/ContractDetails';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import Config from '../../../Config';

const CommercialContractDetail = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [reload, setReload] = useState(false);
  const [contract, setContract] = useState<Contract>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!params.contract) {
      return;
    }
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    setLoading(true);
    axios
      .get(`commercial/contracts/${params.contract}`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setContract(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [params, reload]);

  if (!params.contract) {
    return null;
  }

  const provide = () => {
    axios
      .post(`commercial/contracts/${params.contract}/provide`, {})
      .then(response => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <ModuleContent>
      <ContentHeader
        loading={loading}
        onRefresh={() => setReload(!reload)}
        onBack={() => {
          navigate('/commercial/clients');
        }}
        tools={
          <>
            {contract?.provided_at ? (
              <Tag color={'green'}>Entregado el {dayjs(contract.provided_at).format('DD/MM/YYYY [a las ] hh:m a')}</Tag>
            ) : (
              <Tag color={'orange'}>Pendiente de entrega</Tag>
            )}
          </>
        }
        title={
          <>
            {contract?.client?.entity?.name} {contract?.client?.entity?.last_name}{' '}
          </>
        }>
        <p>
          <MoneyString value={contract?.amount} /> | <ProfileDocument profile={contract?.client?.entity} /> |{' '}
          {contract?.client?.entity.phone} |{' '}
          {contract?.signed_at ? dayjs(contract?.signed_at).format('YYYY-MM-DD HH:mm:ss') : 'Sin firma de contrato'}
        </p>
        <Space>
          {!contract?.provided_at && (
            <Popconfirm title={'Vas a registrar la entrega de esta propiedad'} onConfirm={provide}>
              <PrimaryButton icon={<PiHandshake size={17} />} label={'Registrar entrega'} />
            </Popconfirm>
          )}
        </Space>
      </ContentHeader>
      <Row gutter={[30, 30]}>
        <Col xs={24} lg={8}>
          <h3>Incidencias</h3>
          <EntityActivityManager refresh={reload} uuid={params.contract} type={'commercial-contract'} />
        </Col>
        <Col xs={24} lg={6}>
          <h3>Detalle del contrato</h3>
          {contract && <ContractDetails contract={contract} />}
        </Col>
        <Col xs={24} lg={10}>
          <h3>Facturas</h3>
          <Collapse
            items={contract?.invoices?.map(invoice => {
              return {
                extra: (
                  <>
                    {invoice.paid_at ? (
                      <Tag color={'green'}>Pagado</Tag>
                    ) : (
                      <Tag color={'red'}>
                        Pendiente: <MoneyString value={invoice.pending_payment} />
                      </Tag>
                    )}
                  </>
                ),
                label: (
                  <>
                    {invoice.concept} <MoneyString value={invoice.amount} />
                  </>
                ),
                key: invoice.uuid,
                children: (
                  <div>
                    <InvoiceTableDetails invoice={invoice} />
                    <Divider />
                    <h3>Pagos</h3>
                    <InvoiceTablePayments invoice={invoice} />
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

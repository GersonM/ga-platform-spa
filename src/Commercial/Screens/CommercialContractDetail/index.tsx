import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Col, Collapse, Divider, Form, Input, Modal, Row, Space, Tag} from 'antd';
import {PiCodeBlock, PiCross, PiHandshake, PiProhibit, PiProhibitInset} from 'react-icons/pi';
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
import ContractProvideForm from '../../Components/ContractProvideForm';

const CommercialContractDetail = () => {
  const params = useParams();
  const [reload, setReload] = useState(false);
  const [contract, setContract] = useState<Contract>();
  const [loading, setLoading] = useState(false);
  const [openContractProvideForm, setOpenContractProvideForm] = useState(false);
  const [openProvisionRevert, setOpenProvisionRevert] = useState(false);

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

  const submitProvisionRevert = (values: any) => {
    setLoading(true);
    axios
      .post(`commercial/contracts/${contract?.uuid}/revert-provision`, values)
      .then(() => {
        setLoading(false);
        setOpenProvisionRevert(false);
        setReload(!reload);
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  if (!params.contract) {
    return null;
  }

  return (
    <ModuleContent>
      <ContentHeader
        loading={loading}
        onRefresh={() => setReload(!reload)}
        showBack
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
          {!contract?.provided_at ? (
            <PrimaryButton
              icon={<PiHandshake size={17} />}
              label={'Registrar entrega'}
              onClick={() => setOpenContractProvideForm(true)}
            />
          ) : (
            <PrimaryButton
              icon={<PiProhibitInset size={17} />}
              label={'Revertir entrega'}
              onClick={() => setOpenProvisionRevert(true)}
            />
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
      <Modal open={openProvisionRevert} onCancel={() => setOpenProvisionRevert(false)} destroyOnClose footer={null}>
        <h2>Revertir entrega</h2>
        <p>Especifique el motivo de la reversión de la entrega</p>
        <Form onFinish={submitProvisionRevert}>
          <Form.Item name={'observations'} rules={[{required: true}]}>
            <Input.TextArea autoFocus />
          </Form.Item>
          <PrimaryButton block label={'Enviar'} htmlType={'submit'} />
        </Form>
      </Modal>
      <Modal
        open={openContractProvideForm}
        onCancel={() => setOpenContractProvideForm(false)}
        destroyOnClose
        footer={null}
        title={'Registrar entrega'}>
        <ContractProvideForm
          contract={contract}
          onComplete={() => {
            setReload(!reload);
            setOpenContractProvideForm(false);
          }}
        />
      </Modal>
    </ModuleContent>
  );
};

export default CommercialContractDetail;

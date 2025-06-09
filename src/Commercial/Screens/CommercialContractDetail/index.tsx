import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Col, Form, Input, Modal, Row, Space, Tag} from 'antd';
import {PiHandshake, PiProhibitInset, PiReceiptXBold} from 'react-icons/pi';
import axios from 'axios';
import dayjs from 'dayjs';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ModuleContent from '../../../CommonUI/ModuleContent';
import EntityActivityManager from '../../../CommonUI/EntityActivityManager';
import type {Contract} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import MoneyString from '../../../CommonUI/MoneyString';
import ContractDetails from '../../Components/ContractDetails';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ContractProvideForm from '../../Components/ContractProvideForm';
import StockViewerState from '../../Components/StockViewerState';
import CancelContract from '../../Components/CancelContract';
import AlertMessage from '../../../CommonUI/AlertMessage';
import StockSelector from '../../../WarehouseManager/Components/StockSelector';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';
import InvoicesTable from '../../../PaymentManagement/Components/InvoicesTable';

const CommercialContractDetail = () => {
  const params = useParams();
  const [reload, setReload] = useState(false);
  const [contract, setContract] = useState<Contract>();
  const [loading, setLoading] = useState(false);
  const [changeStockUuid, setChangeStockUuid] = useState<string>();
  const [openContractProvideForm, setOpenContractProvideForm] = useState(false);
  const [openProvisionRevert, setOpenProvisionRevert] = useState(false);
  const [openCancelContract, setOpenCancelContract] = useState(false);

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

  const updateStock = () => {
    setLoading(true);
    axios
      .post(`commercial/contracts/${contract?.uuid}/update-stock`, {stock_uuid: changeStockUuid})
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
              disabled={!!contract?.cancelled_at}
              icon={<PiHandshake size={17} />}
              label={'Registrar entrega'}
              onClick={() => setOpenContractProvideForm(true)}
            />
          ) : (
            <PrimaryButton
              disabled={!!contract?.cancelled_at && !contract?.provided_at}
              icon={<PiProhibitInset size={17} />}
              label={'Revertir entrega'}
              onClick={() => setOpenProvisionRevert(true)}
            />
          )}
          <PrimaryButton
            danger
            icon={<PiReceiptXBold />}
            disabled={!!contract?.cancelled_at}
            label={'Anular contrato'}
            onClick={() => setOpenCancelContract(true)}
          />
        </Space>
      </ContentHeader>
      {contract?.cancelled_at && (
        <AlertMessage message={'Este contrato fué anulado'} caption={contract?.cancellation_reason} type={'error'} />
      )}
      <Row gutter={[30, 30]}>
        <Col xs={24} lg={8}>
          <h3>Incidencias</h3>
          <EntityActivityManager refresh={reload} uuid={params.contract} type={'commercial-contract'} />
        </Col>
        <Col xs={24} lg={6}>
          <h3>Detalle del contrato</h3>
          <div style={{marginBottom: 15}}>
            <StockSelector onChange={value => setChangeStockUuid(value)} style={{width: '100%'}} />
            {changeStockUuid && (
              <PrimaryButton style={{marginTop: 10}} block label={'Cambiar lote'} onClick={updateStock} />
            )}
          </div>
          {contract?.created_by && (
            <>
              <h3>Vendedor:</h3>
              <p>
                <ProfileChip profile={contract?.created_by} />
              </p>
            </>
          )}
          {contract?.contractable && <StockViewerState stock={contract.contractable} />}
          <p>
            <strong>Observaciones: </strong> <br />
            {contract?.observations}
          </p>
          {contract && <ContractDetails contract={contract} />}
        </Col>
        <Col xs={24} lg={10}>
          <h3>Facturas</h3>
          {contract && <InvoicesTable entityUuid={contract?.uuid} type={'contract'} />}
        </Col>
      </Row>
      <Modal open={openProvisionRevert} onCancel={() => setOpenProvisionRevert(false)} destroyOnHidden footer={null}>
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
        destroyOnHidden
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
      <Modal open={openCancelContract} onCancel={() => setOpenCancelContract(false)} destroyOnHidden footer={null}>
        {contract && (
          <CancelContract
            contract={contract}
            onComplete={() => {
              setReload(!reload);
              setOpenCancelContract(false);
            }}
          />
        )}
      </Modal>
    </ModuleContent>
  );
};

export default CommercialContractDetail;

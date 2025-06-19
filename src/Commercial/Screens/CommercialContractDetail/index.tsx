import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Card, Col, Descriptions, type DescriptionsProps, Divider, Form, Input, Modal, Row, Tabs, Tag} from 'antd';
import {PiHandshake, PiProhibitInset, PiReceiptXBold} from 'react-icons/pi';
import axios from 'axios';
import dayjs from 'dayjs';

import type {Contract} from '../../../Types/api';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ModuleContent from '../../../CommonUI/ModuleContent';
import EntityActivityManager from '../../../CommonUI/EntityActivityManager';
import ErrorHandler from '../../../Utils/ErrorHandler';
import MoneyString from '../../../CommonUI/MoneyString';
import ContractDetails from '../../Components/ContractDetails';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ContractProvideForm from '../../Components/ContractProvideForm';
import StockViewerState from '../../Components/StockViewerState';
import CancelContract from '../../Components/CancelContract';
import AlertMessage from '../../../CommonUI/AlertMessage';
import StockSelector from '../../../WarehouseManager/Components/StockSelector';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';
import InvoicesTable from '../../../PaymentManagement/Components/InvoicesTable';
import ProcessDetail from "../../../ProcessesManagement/Components/ProcessDetail";

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

  const clientDetails: DescriptionsProps['items'] = [
    {
      key: '1',
      span: 3,
      label: 'Nombres',
      children: contract?.client?.entity.name + ' ' + contract?.client?.entity.last_name
    },
    {key: '2', span: 3, label: 'DNI', children: contract?.client?.entity.doc_number},
    {key: '3', span: 3, label: 'Teléfono', children: contract?.client?.entity.phone},
  ];

  const contractDetails: DescriptionsProps['items'] = [
    {
      key: '1', span: 3, label: 'Entrega', children: contract?.provided_at ? (
        <Tag color={'green'}>Entregado el {dayjs(contract.provided_at).format('DD/MM/YYYY [a las ] hh:m a')}</Tag>
      ) : (
        <Tag color={'orange'}>Pendiente de entrega</Tag>
      )
    },
    {key: '2', span: 3, label: 'Monto', children: <MoneyString value={contract?.amount}/>},
    {key: 'product', span: 3, label: 'Producto', children: contract?.contractable.sku},
    {
      key: '3',
      span: 3,
      label: 'Fecha de firma',
      children: contract?.signed_at ? dayjs(contract?.signed_at).format('DD/MM/YYYY HH:mm a') : 'Sin firma de contrato'
    },
    {
      key: '4',
      span: 3,
      label: 'Fecha de inicio',
      children: dayjs(contract?.date_start).format('DD/MM/YYYY HH:mm a')
    },
    {key: '5', span: 3, label: 'Observaciones', children: contract?.observations},
    {
      key: '6',
      span: 3,
      label: 'Vendedor',
      children: <>{contract?.created_by?.name} {contract?.created_by?.last_name}</>
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader
        loading={loading}
        onRefresh={() => setReload(!reload)}
        showBack
        title={
          <>
            {contract?.contractable.sku} - {contract?.client?.entity?.name} {contract?.client?.entity?.last_name}{' '}
          </>
        }>
        {contract?.cancelled_at && (
          <AlertMessage message={'Este contrato fué anulado'} caption={contract?.cancellation_reason} type={'error'}/>
        )}
      </ContentHeader>
      <Row gutter={[20, 20]}>
        <Col xs={24} md={8}>
          <p>
            {!contract?.provided_at ? (
              <PrimaryButton
                block
                disabled={!!contract?.cancelled_at}
                icon={<PiHandshake size={17}/>}
                label={'Registrar entrega'}
                onClick={() => setOpenContractProvideForm(true)}
              />
            ) : (
              <PrimaryButton
                block
                disabled={!!contract?.cancelled_at && !contract?.provided_at}
                icon={<PiProhibitInset size={17}/>}
                label={'Revertir entrega'}
                onClick={() => setOpenProvisionRevert(true)}
              />
            )}
          </p>
          <p>
            <PrimaryButton
              danger
              block
              icon={<PiReceiptXBold/>}
              disabled={!!contract?.cancelled_at}
              label={'Anular contrato'}
              onClick={() => setOpenCancelContract(true)}
            />
          </p>
          <Divider>Datos del cliente:</Divider>
          {contract?.client?.type.includes('Profile') ?
            <Descriptions layout={'horizontal'} size={"small"} items={clientDetails}/> :
            contract?.client?.entity?.uuid
          }
          <Divider>Contrato</Divider>
          <Descriptions layout={'horizontal'} size={"small"} items={contractDetails}/>
          <Divider>Incidencias</Divider>
          <EntityActivityManager refresh={reload} uuid={params.contract} type={'commercial-contract'}/>
        </Col>
        <Col xs={24} md={16}>
          <Card variant={'borderless'}>
            <Tabs style={{marginTop:-20}} centered items={ [
              {
                key: 'finances',
                label: 'Finanzas',
                children: <>
                  {contract && <InvoicesTable customer={contract.client?.entity} entityUuid={contract?.uuid} type={'contract'}/>}
                </>
              },
              {
                key: 'info',
                label: 'Detalle del contrato',
                children: <>
                  <div style={{marginBottom: 15}}>
                    <StockSelector onChange={value => setChangeStockUuid(value)} style={{width: '100%'}}/>
                    {changeStockUuid && (
                      <PrimaryButton style={{marginTop: 10}} block label={'Cambiar lote'} onClick={updateStock}/>
                    )}
                  </div>
                  {contract?.created_by && (
                    <>
                      <h3>Vendedor:</h3>
                      <p>
                        <ProfileChip profile={contract?.created_by}/>
                      </p>
                    </>
                  )}
                  {contract?.contractable && <StockViewerState stock={contract.contractable}/>}
                  <p>
                    <strong>Observaciones: </strong> <br/>
                    {contract?.observations}
                  </p>
                  {contract && <ContractDetails contract={contract}/>}
                </>
              },
              {
                key: 'documents',
                label: 'Documentos',
                children: <>
                  {contract && <ProcessDetail profile={contract.client?.entity} entityUuid={contract?.client?.entity.uuid} type={'contract'}/>}
                </>
              },
            ]} />
          </Card>
        </Col>
      </Row>
      <Modal open={openProvisionRevert} onCancel={() => setOpenProvisionRevert(false)} destroyOnHidden footer={null}>
        <h2>Revertir entrega</h2>
        <p>Especifique el motivo de la reversión de la entrega</p>
        <Form onFinish={submitProvisionRevert}>
          <Form.Item name={'observations'} rules={[{required: true}]}>
            <Input.TextArea autoFocus/>
          </Form.Item>
          <PrimaryButton block label={'Enviar'} htmlType={'submit'}/>
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

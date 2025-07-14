import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Button, Card, Col, Descriptions, type DescriptionsProps, Divider, Form, Input, Row, Tabs} from 'antd';
import {PiPlusBold, PiReceiptXBold} from 'react-icons/pi';
import {TbCancel, TbCheck} from "react-icons/tb";
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
import CancelContract from '../../Components/CancelContract';
import AlertMessage from '../../../CommonUI/AlertMessage';
import InvoicesTable from '../../../PaymentManagement/Components/InvoicesTable';
import ModalView from "../../../CommonUI/ModalView";
import ActivityLogViewer from "../../../ActivityLog/Components/ActivityLogViewer";
import ContractItemsManager from "../../Components/ContractItemsManager";
import StepsNavigation from "../../../CommonUI/StepsNavigation";
import CommercialContractForm from "../../Components/CommercialContractForm";
import ContractStatus from "../CommercialSales/ContractStatus.tsx";
import InstallmentPlanForm from "../../../PaymentManagement/Components/InstallmentPlanForm";

const CommercialContractDetail = () => {
  const params = useParams();
  const [reload, setReload] = useState(false);
  const [contract, setContract] = useState<Contract>();
  const [loading, setLoading] = useState(false);
  const [openContractProvideForm, setOpenContractProvideForm] = useState(false);
  const [openProvisionRevert, setOpenProvisionRevert] = useState(false);
  const [openCancelContract, setOpenCancelContract] = useState(false);
  const [openEditContract, setOpenEditContract] = useState(false);
  const [openInstallmentFom, setOpenInstallmentFom] = useState(false);

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

  const submitApprove = () => {
    setLoading(true);
    axios
      .post(`commercial/contracts/${contract?.uuid}/approve`)
      .then(() => {
        setLoading(false);
        setReload(!reload);
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const submitStart = () => {
    setLoading(true);
    axios
      .post(`commercial/contracts/${contract?.uuid}/start`)
      .then(() => {
        setLoading(false);
        setReload(!reload);
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  if (!contract) {
    return null;
  }

  const clientProfile: DescriptionsProps['items'] = [
    {
      key: '1',
      span: 3,
      label: 'Nombres',
      children: contract?.client?.entity.name + ' ' + contract?.client?.entity.last_name
    },
    {key: '2', span: 3, label: 'DNI', children: contract?.client?.entity.doc_number},
    {key: '3', span: 3, label: 'Teléfono', children: contract?.client?.entity.phone},
  ];

  const clientCompany: DescriptionsProps['items'] = [
    {
      key: '1',
      span: 3,
      label: 'Nombre',
      children: contract?.client?.entity.name
    },
    {key: '2', span: 3, label: 'RUC', children: contract?.client?.entity.legal_uid},
    {key: '3', span: 3, label: 'Teléfono', children: contract?.client?.entity.phone},
  ];

  const contractDetails: DescriptionsProps['items'] = [
    {
      key: '1', span: 3, label: 'ID', children: contract.tracking_id
    },
    {
      key: '2',
      span: 3,
      label: 'Monto',
      children: <MoneyString currency={contract?.contractable.currency} value={contract?.amount}/>
    },
    {key: 'product', span: 3, label: 'Producto', children: contract?.contractable.sku},
    {
      key: '3',
      span: 3,
      label: 'Aprobación',
      children: contract?.approved_at ? dayjs(contract?.approved_at).format('DD/MM/YYYY HH:mm a') : 'Sin aprobación'
    },
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
      children: contract?.date_start ? dayjs(contract?.date_start).format('DD/MM/YYYY HH:mm a') : 'No iniciado'
    },
    {
      key: 'period',
      span: 3,
      label: 'Periodo',
      children: contract?.period
    },
    {
      key: 'payment_type',
      span: 3,
      label: 'Método de pago',
      children: contract?.payment_type
    },
    {
      key: '6',
      span: 3,
      label: 'Vendedor',
      children: <>{contract?.created_by?.name} {contract?.created_by?.last_name}</>
    },
    {key: '5', span: 3, label: 'Observaciones', children: contract?.observations},
  ];

  return (
    <ModuleContent>
      <ContentHeader
        loading={loading}
        onRefresh={() => setReload(!reload)}
        showBack
        tools={<ContractStatus contract={contract} showDate={false} />}
        title={
          <>
          {contract?.contractable.sku} - {contract?.client?.entity?.name} {contract?.client?.entity?.last_name}
          </>
        }>
        {contract?.cancelled_at && (
          <AlertMessage message={'Este contrato fué anulado'} caption={contract?.cancellation_reason} type={'error'}/>
        )}
      </ContentHeader>
      <StepsNavigation
        style={{marginBottom: 20}}
        current={-1}
        items={[
          {
            title: 'Propuesta',
            status: 'finish',
            icon: <TbCheck/>,
            description: <small>{dayjs(contract?.created_at).format('DD/MM/YYYY')}</small>,
          },
          {
            title: 'Aprobado',
            status: contract?.approved_at ? 'finish' : 'wait',
            subTitle: contract?.approved_at && dayjs(contract?.approved_at).format('DD/MM/YYYY'),
            description:
              contract.approved_at ? <small>{dayjs(contract?.approved_at).format('DD/MM/YYYY')}</small> :
                <Button
                  onClick={submitApprove}
                  size={"small"}
                  icon={<TbCheck/>} shape={"round"} variant="outlined" type={"primary"}
                  color={'blue'}>
                  Aprobar
                </Button>,
          },
          {
            title: 'Inicio',
            status: contract?.date_start ? 'finish' : 'wait',
            description:
              contract?.date_start ? <small>{dayjs(contract?.date_start).format('DD/MM/YYYY')}</small> :
                <Button
                  size={"small"}
                  onClick={submitStart}
                  disabled={!contract.approved_at}
                  icon={<TbCheck/>} shape={"round"} variant="outlined" type={"primary"}
                  color={'blue'}>
                  Iniciar
                </Button>,
          },
          {
            title: 'Documentación',
            status: contract?.document_progress == 100 ? 'finish' : 'wait',
            description: <small>{contract?.document_progress}%</small>,
          },
          contract?.cancelled_at ? {
              title: 'Anulado',
              status: 'error',
              description: <small>{dayjs(contract?.cancelled_at).format('DD/MM/YYYY')}</small>,
            } :
            {
              title: 'Entrega',
              status: contract?.provided_at ? 'finish' : 'wait',
              description:
                !contract?.provided_at ? (
                  <Button
                    onClick={() => setOpenContractProvideForm(true)}
                    disabled={!!contract?.cancelled_at || !contract.date_start}
                    size={"small"} icon={<TbCheck/>}
                    shape={"round"}
                    variant="outlined" type={"primary"}
                    color={'blue'}>
                    Registrar entrega
                  </Button>
                ) : (
                  <Button
                    size={'small'}
                    disabled={!!contract?.cancelled_at && !contract?.provided_at}
                    icon={<TbCancel/>}
                    onClick={() => setOpenProvisionRevert(true)}
                    shape={"round"}
                    variant="outlined" type={"primary"}
                    color={'blue'}>
                    Revertir entrega
                  </Button>
                ),
            },
        ]}
      />
      <Row gutter={[20, 20]}>
        <Col xs={24} md={7}>
          <div style={{position: "sticky", top: 62}}>
            {!contract.provided_at &&
              <PrimaryButton
                danger
                block
                icon={<PiReceiptXBold/>}
                disabled={!!contract?.cancelled_at}
                label={'Anular contrato'}
                onClick={() => setOpenCancelContract(true)}
              />
            }
            <Divider>Datos del cliente:</Divider>
            <Descriptions
              layout={'horizontal'} size={"small"}
              items={contract?.client?.type.includes('Profile') ? clientProfile : clientCompany}/>
            <Divider>Contrato</Divider>
            <Descriptions layout={'horizontal'} size={"small"} items={contractDetails}/>
            {contract && <ActivityLogViewer entity={'contract'} id={contract?.uuid}/>}
          </div>
        </Col>
        <Col xs={24} md={17}>
          <Card variant={'borderless'}>
            <Tabs style={{marginTop: -20}} centered items={[
              {
                key: 'finances',
                label: 'Finanzas',
                children: <>
                  <PrimaryButton
                    ghost
                    label={'Asignar plan de pagos'}
                    onClick={() => setOpenInstallmentFom(true)}
                    icon={<PiPlusBold/>}
                  />
                  {contract &&
                    <InvoicesTable
                      customerType={contract.client?.type.toLowerCase().includes('profile') ? 'profile' : 'company'}
                      customer={contract.client?.entity}
                      entityUuid={contract?.uuid}
                      type={'contract'}/>
                  }
                </>
              },
              {
                key: 'info',
                label: 'Detalle del contrato',
                children: <>
                  {contract && <ContractDetails contract={contract}/>}
                </>
              },
              {
                key: 'documents',
                label: 'Documentos',
                children: <ContractItemsManager contract={contract} group={'documents'}/>
              },
              {
                key: 'crm',
                label: 'CRM',
                children: <EntityActivityManager refresh={reload} uuid={contract.uuid} type={'commercial-contract'}/>
              }
            ]}/>
          </Card>
        </Col>
      </Row>
      <ModalView onCancel={() => setOpenInstallmentFom(false)} open={openInstallmentFom}>
        <InstallmentPlanForm contract={contract} />
      </ModalView>
      <ModalView open={openProvisionRevert} onCancel={() => setOpenProvisionRevert(false)}>
        <h2>Revertir entrega</h2>
        <p>Especifique el motivo de la reversión de la entrega</p>
        <Form onFinish={submitProvisionRevert}>
          <Form.Item name={'observations'} rules={[{required: true}]}>
            <Input.TextArea autoFocus/>
          </Form.Item>
          <PrimaryButton block label={'Enviar'} htmlType={'submit'}/>
        </Form>
      </ModalView>
      <ModalView
        open={openContractProvideForm}
        onCancel={() => setOpenContractProvideForm(false)}
        title={'Registrar entrega'}>
        <ContractProvideForm
          contract={contract}
          onComplete={() => {
            setReload(!reload);
            setOpenContractProvideForm(false);
          }}
        />
      </ModalView>
      <ModalView onCancel={() => setOpenEditContract(false)} open={openEditContract}>
        <CommercialContractForm contract={contract} onComplete={() => {
          setOpenEditContract(false);
          setReload(!reload);
        }}/>
      </ModalView>
      <ModalView open={openCancelContract} onCancel={() => setOpenCancelContract(false)}>
        {contract && (
          <CancelContract
            contract={contract}
            onComplete={() => {
              setReload(!reload);
              setOpenCancelContract(false);
            }}
          />
        )}
      </ModalView>
    </ModuleContent>
  );
};

export default CommercialContractDetail;

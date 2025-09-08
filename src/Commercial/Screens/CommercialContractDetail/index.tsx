import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {
  Button,
  Card,
  Col,
  Descriptions,
  type DescriptionsProps,
  Divider,
  Form,
  Input,
  List, Popconfirm,
  Row, Space,
  Tabs,
} from 'antd';
import {PiPlusBold, PiReceiptXBold} from 'react-icons/pi';
import {TbCancel, TbCheck, TbChevronCompactRight, TbPencil, TbTrash} from "react-icons/tb";
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
import ContractStatus from "../CommercialSales/ContractStatus.tsx";
import InstallmentPlanForm from "../../../PaymentManagement/Components/InstallmentPlanForm";
import NewSaleForm from "../../Components/NewSaleForm";
import IconButton from "../../../CommonUI/IconButton";
import CompanyChip from "../../../HRManagement/Components/CompanyChip";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import StorageStockChip from "../../Components/StorageStockChip";
import Config from "../../../Config.tsx";
import MetaTitle from "../../../CommonUI/MetaTitle";

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

  const removeCartItem = (uuid: string) => {
    axios.delete(`commercial/cart-items/${uuid}`)
      .then(() => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      })
  }

  const updateStock = (uuid: string) => {
    setLoading(true);
    axios
      .post(`commercial/contracts/${contract?.uuid}/update-stock`, {stock_uuid: uuid})
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
    return <LoadingIndicator message={'Cargando información de contrato'}/>;
  }

  const totals: any = {};

  if (contract.cart) {
    for (const cartItem of contract.cart) {
      if (cartItem.stock?.currency) {
        if (!totals[cartItem.stock.currency]) {
          totals[cartItem.stock.currency] = 0;
        }
        totals[cartItem.stock.currency] += cartItem.unit_amount * cartItem.quantity;
      }
    }
  }

  const contractDetails: DescriptionsProps['items'] = [
    {
      key: 'tracking_id',
      label: 'ID',
      children: <code>{contract.tracking_id}</code>
    },
    {
      key: 'created_at',
      label: 'Propuesta',
      children: contract?.created_at ? dayjs(contract?.created_at).format(Config.dateFormatUser) : 'Sin aprobación'
    },
    {
      key: 'approved_at',
      label: 'Aprobación',
      children: contract?.approved_at ? dayjs(contract?.approved_at).format(Config.dateFormatUser) : 'Sin aprobación'
    },
    {
      key: 'date_start',
      label: 'Fecha de inicio',
      children: contract?.date_start ? dayjs(contract?.date_start).format(Config.dateFormatUser) : 'No iniciado'
    },
    {
      key: 'deadline',
      label: 'Fecha estimada de entrega',
      children: contract?.dead_line ? dayjs(contract?.dead_line).format(Config.dateFormatUser) :
        <small>No terminado</small>
    },
    {
      key: 'date_end',
      label: 'Fecha de fin',
      children: contract?.date_end ? dayjs(contract?.date_end).format(Config.dateFormatUser) :
        <small>No terminado</small>
    },
    {
      key: 'provided_at',
      label: 'Entrega',
      children: contract?.provided_at ? dayjs(contract?.provided_at).format(Config.dateFormatUser) : 'No entregado'
    },
    {
      key: 'period',
      label: 'Periodo',
      children: contract?.period
    },
    {
      key: 'payment_type',
      label: 'Método de pago',
      children: contract?.payment_type
    },
    {
      key: 'amount',
      label: 'Monto',
      children: <>
        <MoneyString currency={'PEN'} value={contract.totals?.PEN}/><br/>
        <MoneyString currency={'USD'} value={contract.totals?.USD}/>
      </>
    },
    {
      key: 'seller',
      label: 'Vendedor',
      children: <ProfileChip profile={contract?.created_by}/>
    },
    {key: '5', label: 'Observaciones', children: contract?.observations || <small>Sin observaciones</small>},
  ];

  return (
    <ModuleContent>
      <MetaTitle title={`Contrato: ${contract?.tracking_id}`}/>
      <ContentHeader
        loading={loading}
        onRefresh={() => setReload(!reload)}
        showBack
        tools={<ContractStatus contract={contract}/>}
        title={
          <>
            <code>{contract?.title || contract.tracking_id}</code>
            <TbChevronCompactRight
              style={{margin: '0 10px'}}/> {contract?.client?.entity?.name} {contract?.client?.entity?.last_name}
          </>
        }>
        {contract?.cancelled_at && (
          <AlertMessage message={'Este contrato fué anulado'} caption={contract?.cancellation_reason} type={'error'}/>
        )}
      </ContentHeader>
      <StepsNavigation
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
            status: (contract?.document_progress == null || contract?.document_progress == 100) ? 'finish' : 'pending',
            description:
              <small>{contract?.document_progress == null ? 'Sin documentos requeridos' : contract?.document_progress + '%'}</small>,
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
        <Col md={24} lg={7}>
          <div style={{position: "sticky", top: 62}}>
            <Divider orientation={'left'}>Cliente</Divider>
            {
              contract?.client?.type.includes('Profile') ?
                <ProfileChip profile={contract?.client?.entity} showDocument/> :
                <CompanyChip company={contract?.client?.entity}/>
            }
            <Divider orientation={"left"}>Productos</Divider>
            <List
              bordered
              size={"small"}
              dataSource={contract.cart}
              renderItem={(cartItem, index) => {
                return <List.Item>
                  <List.Item.Meta
                    title={<StorageStockChip storageStock={cartItem.stock}/>}
                  />
                  <Space>
                    <small>
                      <MoneyString
                        currency={cartItem.stock?.currency} value={cartItem.unit_amount}
                      />{' '}x {cartItem.quantity}
                    </small>
                    {contract.status != 'provided' &&
                      <>
                        <IconButton icon={<TbPencil/>} small/>
                        <Popconfirm
                          title={'¿Seguro que quieres eliminar este producto?'}
                          description={'Esto modificará el monto total del contrato'}
                          onConfirm={() => removeCartItem(cartItem.uuid)}
                        >
                          <IconButton icon={<TbTrash/>} danger small/>
                        </Popconfirm>
                      </>}
                  </Space>
                </List.Item>;
              }}/>
            <Divider orientation={'left'}>Detalles</Divider>
            <Descriptions
              column={1}
              bordered layout={'horizontal'} size={"small"} items={contractDetails}/>
            {!contract.provided_at &&
              <PrimaryButton
                danger
                block
                style={{marginTop: 10}}
                icon={<PiReceiptXBold size={20}/>}
                disabled={!!contract?.cancelled_at}
                label={'Anular venta'}
                onClick={() => setOpenCancelContract(true)}
              />
            }
            {contract && <ActivityLogViewer entity={'contract'} id={contract?.uuid}/>}
          </div>
        </Col>
        <Col md={24} lg={17}>
          <Card variant={'borderless'}>
            <Tabs style={{marginTop: -20}} centered items={[
              {
                key: 'finances',
                label: 'Finanzas',
                children: <>
                  {contract &&
                    <InvoicesTable
                      client={contract.client}
                      contract={contract}
                      refresh={reload}
                      tools={<>
                        <PrimaryButton
                          ghost
                          size={"small"}
                          label={'Crear plan de pagos'}
                          onClick={() => setOpenInstallmentFom(true)}
                          icon={<PiPlusBold/>}
                        />
                      </>}
                    />
                  }
                </>
              },
              {
                key: 'info',
                label: 'Detalle del contrato',
                children: <>
                  {contract && <ContractDetails contract={contract} onChange={() => setReload(!reload)}/>}
                </>
              },
              {
                key: 'documents',
                label: 'Documentos',
                children: <ContractItemsManager contract={contract} group={'documents'} forceToEdit={false}/>
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
        <InstallmentPlanForm contract={contract} onComplete={() => {
          setOpenInstallmentFom(false);
          setReload(!reload);
        }}/>
      </ModalView>
      <ModalView onCancel={() => setOpenInstallmentFom(false)} open={openInstallmentFom}>
        <InstallmentPlanForm contract={contract} onComplete={() => {
          setOpenInstallmentFom(false);
          setReload(!reload);
        }}/>
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
        <NewSaleForm contract={contract} onComplete={() => {
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

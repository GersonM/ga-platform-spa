import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
  Button,
  Col,
  Descriptions,
  type DescriptionsProps,
  Divider,
  Form,
  Input,
  List, Popconfirm,
  Row, Space,
  Tabs, Tooltip,
} from 'antd';
import {PiPlusBold, PiReceiptXBold} from 'react-icons/pi';
import {
  TbCancel,
  TbCheck,
  TbChevronCompactRight,
  TbLock,
  TbPencil,
  TbPrinter,
  TbRefresh,
  TbTrash
} from "react-icons/tb";
import axios from 'axios';
import dayjs from 'dayjs';

import type {Contract, StorageStock} from '../../../Types/api';
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
import Config from "../../../Config.tsx";
import MetaTitle from "../../../CommonUI/MetaTitle";
import ProductStockForm from "../../../WarehouseManager/Components/ProductStockForm";
import InvoiceResumen from "../../../PaymentManagement/Components/InvoiceResumen";
import FileDownloader from "../../../CommonUI/FileDownloader";
import ShoppingCartEditor from "../../Components/ShoppingCartEditor";
import './styles.less';
import useContractRenew from "../../Hooks/useContractRenew.tsx";
import PeriodChip from "../../../CommonUI/PeriodChip";

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
  const [selectedStock, setSelectedStock] = useState<StorageStock>();
  const [openEditStock, setOpenEditStock] = useState(false);
  const [openCartItemForm, setOpenCartItemForm] = useState(false);
  const [openPrintProposal, setOpenPrintProposal] = useState(false);
  const [openPrintContract, setOpenPrintContract] = useState(false);
  const {renewContract} = useContractRenew(() => setReload(!reload));
  const navigate = useNavigate();

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
        const amount = cartItem.unit_amount || cartItem.stock.sale_price
        totals[cartItem.stock.currency] += (amount || 0) * cartItem.quantity;
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
      key: 'terminated',
      label: 'Fecha de terminación',
      children: contract?.terminated_at ? dayjs(contract?.terminated_at).format(Config.dateFormatUser) :
        <small>No terminado</small>
    },
    {
      key: 'provided_at',
      label: 'Entrega',
      children: contract?.provided_at ? dayjs(contract?.provided_at).format(Config.dateFormatUser) : 'No entregado'
    },
    {
      key: 'period',
      label: 'Periodo de contrato',
      children: <>
        {contract && <PeriodChip period={contract.period}/>}
      </>
    },
    {
      key: 'progress',
      label: 'Progreso del trabajo',
      children: <>
        Inicio: {contract?.date_start ? dayjs(contract?.date_start).format(Config.dateFormatUser) : 'No iniciado'} <br/>
        Fin: {contract?.date_end ? dayjs(contract?.date_end).format(Config.dateFormatUser) :
          <small>No terminado</small>} <br/>
        <span>
          Deadline: {contract?.dead_line ? <>{dayjs(contract?.dead_line).format(Config.dateFormatUser)} <br/>
              <small>{dayjs(contract?.dead_line).fromNow()}</small></> :
            <small>No definido</small>}
        </span>
      </>
    },
    {
      key: 'payment_type',
      label: 'Método de pago',
      children: contract?.payment_type
    },
    {
      key: 'seller',
      label: 'Vendedor',
      children: contract?.created_by ? <ProfileChip profile={contract?.created_by}/> : 'Sin vendedor'
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
        tools={<><ContractStatus contract={contract}/>
          <PrimaryButton
            label={'Propuesta'}
            icon={<TbPrinter size={20}/>}
            shape={'round'}
            onClick={() => setOpenPrintProposal(true)}/>
          <PrimaryButton
            shape={'round'}
            label={'Contrato'}
            icon={<TbPrinter size={20}/>}
            onClick={() => setOpenPrintContract(true)}/>
          {!contract.provided_at &&
            <PrimaryButton
              danger
              block
              icon={<PiReceiptXBold size={20}/>}
              disabled={!!contract?.cancelled_at}
              label={'Anular venta'}
              onClick={() => setOpenCancelContract(true)}
            />
          }
          {contract.approved_at &&
            <PrimaryButton
              block
              icon={<TbRefresh size={20}/>}
              disabled={!!contract?.cancelled_at}
              label={'Renovar contrato'}
              onClick={() => renewContract(contract.uuid)}
            />
          }
        </>}
        title={
          <Space>
            <div>
              <code>{contract?.title || contract.tracking_id}
                <br/><small>{contract?.tracking_id}</small>
              </code>
            </div>
            <TbChevronCompactRight/>
            <div>
              {
                contract?.client?.type.includes('Profile') ?
                  <ProfileChip profile={contract?.client?.entity} showDocument/> :
                  <CompanyChip company={contract?.client?.entity}/>
              }
            </div>
          </Space>
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
          <div className={'info-contract-block'}>
            <Divider titlePlacement={"left"}>Productos</Divider>
            <PrimaryButton icon={<TbPencil/>} block label={'Editar'} size={"small"} ghost onClick={() => {
              setOpenCartItemForm(true);
            }}/>
            <List
              size={"small"}
              style={{margin: '0 -15px'}}
              dataSource={contract.cart}
              renderItem={(cartItem) => {
                return <List.Item>
                  <List.Item.Meta
                    title={<div>
                      <Tooltip title={'Editar stock'}>
                        <a onClick={() => {
                          setOpenEditStock(true);
                          setSelectedStock(cartItem.stock);
                        }}>
                          {cartItem.stock?.serial_number}
                        </a>
                      </Tooltip>
                      <small>{cartItem.stock?.variation?.name || cartItem.stock?.variation?.product?.name}</small>
                    </div>}
                  />
                  <Space>
                    <small style={{display: 'flex', alignItems: 'center'}}>
                      {cartItem.unit_amount == null && <TbLock/>}
                      <MoneyString
                        currency={cartItem.stock?.currency}
                        value={cartItem.unit_amount == null ? cartItem.stock?.sale_price : cartItem.unit_amount}
                      />{' '}x {cartItem.quantity}
                    </small>
                    {!contract.locked_at &&
                      <>
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
            {contract.totals?.PEN &&
              <InvoiceResumen
                includeTaxes={contract.include_taxes}
                applyTaxes={contract.apply_taxes}
                items={[{label: 'Total', amount: contract.totals.PEN}]} currency={'PEN'}/>}
            {contract.totals?.USD &&
              <InvoiceResumen
                includeTaxes={contract.include_taxes}
                applyTaxes={contract.apply_taxes}
                items={[{label: 'Total', amount: contract.totals.USD}]} currency={'USD'}/>}
            <Divider titlePlacement={'left'}>Detalles</Divider>
            <Descriptions
              column={1}
              bordered layout={'horizontal'} size={"small"} items={contractDetails}/>
            {contract && <ActivityLogViewer entity={'contract'} id={contract?.uuid}/>}
          </div>
        </Col>
        <Col md={24} lg={17}>
          <Tabs centered style={{paddingRight: 15}} items={[
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
      <ModalView width={900} open={openEditStock} onCancel={() => setOpenEditStock(false)}>
        <ProductStockForm stock={selectedStock} onComplete={() => {
          setReload(!reload);
          setOpenEditStock(false);
        }}/>
      </ModalView>
      <ModalView
        width={700}
        title={'Editar items de contrato'} open={openCartItemForm} onCancel={() => setOpenCartItemForm(false)}>
        <ShoppingCartEditor
          value={contract.cart}
          liveUpdate={false}
          onChange={value => {
            console.log({value});
            axios
              .request({
                url: `commercial/contracts/${contract.uuid}`,
                method: 'PUT',
                data: {cart: value}
              })
              .then(() => {
                setOpenCartItemForm(false);
                setReload(!reload);
              })
              .catch(error => {
                ErrorHandler.showNotification(error);
              });
          }}/>
      </ModalView>
      <FileDownloader
        name={'Imprimir propuesta'}
        url={'document-generator/contracts/' + contract.uuid + '/proposal'}
        open={openPrintProposal}
        onComplete={() => {
          setOpenPrintProposal(false);
        }}
      />
      <FileDownloader
        name={'Imprimir contrato'}
        url={'document-generator/contracts/' + contract.uuid}
        open={openPrintContract}
        onComplete={() => {
          setOpenPrintContract(false);
        }}
      />
    </ModuleContent>
  );
};

export default CommercialContractDetail;

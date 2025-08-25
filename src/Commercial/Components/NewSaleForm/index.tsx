import React, {useContext, useEffect, useState} from 'react';
import {
  Checkbox,
  Col,
  DatePicker, Divider,
  Form,
  Input,
  InputNumber,
  List,
  notification,
  Row,
  Segmented,
  Select,
  Space,
  Tag
} from 'antd';
import {TbCheck, TbPencil, TbTrash} from "react-icons/tb";
import axios from 'axios';

import type {Contract, StorageStock} from '../../../Types/api';
import ProfileSelector from '../../../CommonUI/ProfileSelector';
import StockSelector from '../../../WarehouseManager/Components/StockSelector';
import AuthContext from '../../../Context/AuthContext';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import MoneyString from '../../../CommonUI/MoneyString';
import StockViewerState from '../StockViewerState';
import EmptyMessage from '../../../CommonUI/EmptyMessage';
import MoneyInput from "../../../CommonUI/MoneyInput";
import CompanySelector from "../../../HRManagement/Components/CompanySelector";
import ContractTemplateSelector from "../ContractTemplateSelector";
import IconButton from "../../../CommonUI/IconButton";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import PaymentMethodTypesSelector from "../../../CommonUI/PaymentMethodTypesSelector";
import {DefaultEditor} from "react-simple-wysiwyg";

interface NewSaleFormProps {
  onComplete?: (data: Contract) => void;
  contract?: Contract;
}

const NewSaleForm = ({onComplete, contract}: NewSaleFormProps) => {
  const {user} = useContext(AuthContext);
  const [selectedStock, setSelectedStock] = useState<StorageStock>();
  const [loading, setLoading] = useState(false);
  const [clientType, setClientType] = useState<string>('Persona')
  const [selectedStockUUID, setSelectedStockUUID] = useState<string>();
  const [chooseSeller, setChooseSeller] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>();
  const [period, setPeriod] = useState<string>();
  const [isApproved, setIsApproved] = useState(false);
  const [shoppingCart, setShoppingCart] = useState<StorageStock[]>([]);

  /*useEffect(() => {
    if (!selectedStockUUID) {
      return;
    }
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`warehouses/stock/${selectedStockUUID}`, config)
      .then(response => {
        if (response) {
          setSelectedStock(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [selectedStockUUID]);*/

  const submitForm = (data: any) => {
    if (!data.fk_company_uuid && !data.fk_profile_uuid) {
      console.log(data);
      notification.info({
        description: 'Selecciona un cliente para poder registrar la venta',
        message: 'Elige un cliente'
      })
      return;
    }

    if (shoppingCart.length == 0) {
      console.log(shoppingCart);
      notification.info({description: 'Agrega al menos un producto', message: 'El carrito está vació'})
      return;
    }

    setLoading(true);
    axios
      .request({
        url: contract ? `commercial/contracts/${contract.uuid}` : 'commercial/contracts',
        method: contract ? 'PUT' : 'POST',
        data: {
          ...data,
          is_approved: isApproved,
          cart: shoppingCart.map(({quantity, sale_price, uuid}) => ({quantity, sale_price, uuid})),
          client_type: clientType == 'Persona' ? 'profile' : 'company',
        }
      })
      .then(response => {
        setLoading(false);
        if (onComplete) {
          onComplete(response.data);
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  const addStock = (data: StorageStock) => {
    const newCart = [...shoppingCart];
    newCart.push({...data});
    setShoppingCart(newCart);
  }

  const removeStock = (data: StorageStock) => {
    const newCart = [...shoppingCart];
    const index = newCart.findIndex(i => i.uuid === data.uuid);
    if (index !== -1) {
      newCart.splice(index, 1);
      setShoppingCart(newCart);
    }
  }

  const updateQuantity = (data: StorageStock, quantity: number | null) => {
    const newCart = [...shoppingCart];
    const index = newCart.findIndex(i => i.uuid === data.uuid);
    if (index !== -1) {
      newCart[index].quantity = quantity || 1;
      setShoppingCart(newCart);
    }
  }

  const updateAmount = (data: StorageStock, amount?: number) => {
    const newCart = [...shoppingCart];
    const index = newCart.findIndex(i => i.uuid === data.uuid);
    if (index !== -1) {
      newCart[index].sale_price = amount != null ? amount : data.sale_price;
      setShoppingCart(newCart);
    }
  }

  const cartTotalAmountPen = shoppingCart.reduce((s, item) => {
    const itemAmount = (item.quantity || 1) * (item.sale_price != null ? item.sale_price : 0);
    return s + (item.currency == 'PEN' ? itemAmount : 0);
  }, 0);

  const cartTotalAmountUSD = shoppingCart.reduce((s, item) => {
    const itemAmount = (item.quantity || 1) * (item.sale_price != null ? item.sale_price : 0);
    return s + (item.currency == 'USD' ? itemAmount : 0);
  }, 0);

  return (
    <div>
      <h2>
        <Space>
          Nueva:
          <Segmented
            size={"large"}
            options={[{label: 'propuesta', value: 'proposal'}, 'venta']}
            onChange={value => setIsApproved(value != 'proposal')}
          />
        </Space>
      </h2>
      <Form layout="vertical" onFinish={submitForm} initialValues={contract}>
        <Row gutter={[20, 20]}>
          <Col span={14}>
            <Row gutter={[15, 15]}>
              <Col xs={14}>
                <Form.Item label={'Agregar producto'}>
                  <StockSelector value={null} onChange={(_uuid, option) => {
                    addStock(option.entity);
                  }}/>
                </Form.Item>
              </Col>
              <Col xs={10}>
                <Form.Item label={'Total'}>
                  {cartTotalAmountPen > 0 &&
                    <Tag bordered={false} color={'blue'}>
                      <MoneyString currency={'PEN'} value={cartTotalAmountPen}/>
                    </Tag>
                  }
                  {cartTotalAmountUSD > 0 &&
                    <Tag bordered={false} color={'green'}>
                      <MoneyString currency={'USD'} value={cartTotalAmountUSD}/>
                    </Tag>
                  }
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <List
                bordered
                size={'small'}
                dataSource={shoppingCart}
                renderItem={(stock, index) => {
                  return <List.Item>
                    <List.Item.Meta
                      title={stock.variation_name || stock.product?.name}
                      description={<Tag bordered={false} color={'blue'}>{stock.sku}</Tag>}
                    />
                    <Space>
                      <InputNumber
                        min={1} max={999} addonBefore={'Cant.'} placeholder={'1'} style={{width: 110}}
                        onChange={value => {
                          updateQuantity(stock, value);
                        }}/>
                      <MoneyInput
                        min={0}
                        block={false} currency={stock.currency} value={stock.sale_price}
                        onChange={value => {
                          updateAmount(stock, value);
                        }}
                      />
                      <IconButton icon={<TbTrash/>} danger small onClick={() => removeStock(stock)}/>
                    </Space>
                  </List.Item>;
                }}/>
            </Form.Item>
            <Row gutter={[20, 20]}>
              <Col span={14}>
                <Form.Item label={'Generar pagos (opcional)'} name={'payment_mode'}>
                  <Select
                    allowClear
                    showSearch
                    placeholder={'Se pueden generar posteriormente'}
                    options={[
                      {value: 'first_30', label: 'Inicial de 30%'},
                      {value: '1_pago', label: '1 Solo pago'},
                      {value: '0', label: 'Generar posteriormente'},
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label={'Periodo'} name={'period'}>
                  <Select
                    showSearch
                    allowClear
                    onChange={value => setPeriod(value)}
                    placeholder={'Único'}
                    options={[
                      {value: 'unique', label: 'Único'},
                      {value: 'monthly', label: 'Mensual'},
                      {value: 'annual', label: 'Anual'},
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={'Cliente'} style={{marginBottom: 10}}>
              <Segmented options={['Persona', 'Empresa']} onChange={value => setClientType(value)}/>
            </Form.Item>
            {clientType == 'Persona' && (
              <Form.Item name={'fk_profile_uuid'}>
                <ProfileSelector placeholder={'Buscar persona'}/>
              </Form.Item>
            )}
            {clientType == 'Empresa' && (
              <Form.Item name={'fk_company_uuid'}>
                <CompanySelector/>
              </Form.Item>
            )}
            <Form.Item label={'Vendedor'} name={'fk_created_by_uuid'}>
              {chooseSeller ? (
                  <ProfileSelector/>
                ) :
                <Space>
                  <ProfileChip profile={user?.profile}/>
                  <IconButton
                    icon={<TbPencil/>}
                    onClick={() => setChooseSeller(!chooseSeller)}
                  />
                </Space>
              }
            </Form.Item>
          </Col>
          <Col span={10}>
            <Divider>Información opcional</Divider>
            <Form.Item label={'Tipo de contrato / venta'} name={'fk_template_uuid'}>
              <ContractTemplateSelector/>
            </Form.Item>
            {isApproved && (
              <>
                <Form.Item label="Fecha de venta (opcional)" name="approved_at">
                  <DatePicker style={{width: '100%'}} placeholder={'Hoy'}/>
                </Form.Item>
                <Form.Item label="Fecha de entrega (opcional)" name="provided_at">
                  <DatePicker style={{width: '100%'}} placeholder={'Hoy'}/>
                </Form.Item>
              </>
            )}
            <Form.Item label={'Método de pago (opcional)'} name={'payment_type'}>
              <PaymentMethodTypesSelector/>
            </Form.Item>
            <Form.Item label={'Cóndiciones de pago (opcional)'} name={'payment_conditions'}>
              <DefaultEditor/>
            </Form.Item>
            <Form.Item label={'Detalles del servicio (opcional)'} name={'service_details'}>
              <DefaultEditor/>
            </Form.Item>
            <Form.Item label={'Información del presupuesto (opcional)'} name={'budget_details'}>
              <DefaultEditor/>
            </Form.Item>
            <Form.Item label={'Observaciones (opcional)'} name={'observations'}>
              <Input.TextArea/>
            </Form.Item>
          </Col>
        </Row>
        <PrimaryButton
          icon={<TbCheck/>} loading={loading} block htmlType={'submit'}
          label={'Guardar'}/>
      </Form>
    </div>
  );
};

export default NewSaleForm;

import React, {useContext, useState} from 'react';
import {
  Alert,
  Col,
  DatePicker, Divider,
  Form,
  Input,
  InputNumber,
  List,
  notification,
  Row,
  Select,
  Space,
  Tag
} from 'antd';
import {TbCheck, TbPencil, TbTrash} from "react-icons/tb";
import {DefaultEditor} from "react-simple-wysiwyg";
import axios from 'axios';

import type {Contract, StorageContractCartItem, StorageStock} from '../../../Types/api';
import ProfileSelector from '../../../CommonUI/ProfileSelector';
import StockSelector from '../../../WarehouseManager/Components/StockSelector';
import AuthContext from '../../../Context/AuthContext';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import MoneyString from '../../../CommonUI/MoneyString';
import MoneyInput from "../../../CommonUI/MoneyInput";
import IconButton from "../../../CommonUI/IconButton";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import PaymentMethodTypesSelector from "../../../CommonUI/PaymentMethodTypesSelector";
import ContractTemplateSelector from "../../../Commercial/Components/ContractTemplateSelector";
import dayjs from "dayjs";
import Config from "../../../Config.tsx";

interface NewSubscriptionFormProps {
  onComplete?: (data: Contract) => void;
  contract?: Contract;
  saleType?: 'subscription' | 'enrollment';
}

const NewSubscriptionForm = ({onComplete, contract}: NewSubscriptionFormProps) => {
  const {user} = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [chooseSeller, setChooseSeller] = useState(false);
  const [shoppingCart, setShoppingCart] = useState<StorageContractCartItem[]>([]);

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
      notification.info({
        description: 'Selecciona un cliente para poder registrar la venta',
        message: 'Elige un cliente'
      })
      return;
    }

    if (shoppingCart.length == 0) {
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
          cart: shoppingCart,
          addon_service: 'subscription',
          client_type: 'profile',
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
    console.log({data});
    const index = newCart.findIndex(i => i.uuid === data.uuid);
    if (index !== -1) {
      newCart[index].quantity++;
    } else {
      newCart.push({uuid: data.uuid, unit_amount: data.sale_price || 0, quantity: 1, stock: data});
    }
    setShoppingCart(newCart);
  }

  const removeStock = (data: StorageContractCartItem) => {
    const newCart = [...shoppingCart];
    const index = newCart.findIndex(i => i.uuid === data.uuid);
    if (index !== -1) {
      newCart.splice(index, 1);
      setShoppingCart(newCart);
    }
  }

  const updateQuantity = (data: StorageContractCartItem, quantity: number | null) => {
    const newCart = [...shoppingCart];
    const index = newCart.findIndex(i => i.uuid === data.uuid);
    if (index !== -1) {
      newCart[index].quantity = quantity || 1;
      setShoppingCart(newCart);
    }
  }

  const updateAmount = (data: StorageContractCartItem, amount?: number) => {
    const newCart = [...shoppingCart];
    const index = newCart.findIndex(i => i.uuid === data.uuid);
    if (index !== -1) {
      newCart[index].unit_amount = amount != null ? amount : (data.stock?.sale_price || 0);
      setShoppingCart(newCart);
    }
  }

  const cartTotalAmountPen = shoppingCart.reduce((s, item) => {
    const itemAmount = (item.quantity || 1) * (item.unit_amount != null ? item.unit_amount : 0);
    return s + (item.stock?.currency == 'PEN' ? itemAmount : 0);
  }, 0);

  const cartTotalAmountUSD = shoppingCart.reduce((s, item) => {
    const itemAmount = (item.quantity || 1) * (item.unit_amount != null ? item.unit_amount : 0);
    return s + (item.stock?.currency == 'USD' ? itemAmount : 0);
  }, 0);

  return (
    <div>
      <Form layout="vertical" onFinish={submitForm} initialValues={contract}>
        <Row gutter={[30, 30]}>
          <Col span={14}>
            <Row gutter={[20, 20]}>
              <Col span={7}>
                <Form.Item label={'Código de socio'} name={'tracking_id'} rules={[{required:true}]}>
                  <InputNumber prefix={'N°'} style={{width:'100%'}}/>
                </Form.Item>
              </Col>
              <Col span={17}>
                <Form.Item label={'Socio titular'} name={'fk_profile_uuid'} rules={[{required:true}]}>
                  <ProfileSelector placeholder={'Buscar persona'}/>
                </Form.Item>
              </Col>
            </Row>
            <Alert
              banner
              style={{margin: '-15px 0 20px 0', borderRadius:6}} type={"info"} showIcon
              message={'Los beneficiarios se podrán agregar posteriormente'}/>
            <Row gutter={[20, 20]}>
              <Col span={10}>
                <Form.Item label={'Periodo'} name={'period'} initialValue={'monthly'}>
                  <Select
                    showSearch
                    allowClear
                    placeholder={'Único'}
                    options={[
                      {value: 'unique', label: 'Único'},
                      {value: 'monthly', label: 'Mensual'},
                      {value: 'annual', label: 'Anual'},
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={14}>
                <Form.Item label={'Método de pago (opcional)'} name={'payment_type'} initialValue={'automatic_debit'}>
                  <PaymentMethodTypesSelector/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[15, 15]}>
              <Col xs={14}>
                <Form.Item label={'Agregar servicio'}>
                  <StockSelector
                    placeholder={'Elige un servicio para agregar'} value={null}
                    onChange={(_uuid, option) => {
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
                renderItem={(cartItem) => {
                  return <List.Item>
                    <List.Item.Meta
                      title={cartItem.stock?.variation?.name || cartItem.stock?.variation?.product?.name}
                      description={<Tag bordered={false} color={'blue'}>{cartItem.stock?.sku}</Tag>}
                    />
                    <Space>
                      <InputNumber
                        value={cartItem.quantity}
                        min={1} max={999} addonBefore={'Cant.'} placeholder={'1'} style={{width: 110}}
                        onChange={value => {
                          updateQuantity(cartItem, value);
                        }}/>
                      <MoneyInput
                        min={0}
                        block={false} currency={cartItem.stock?.currency} value={cartItem.stock?.sale_price}
                        onChange={value => {
                          updateAmount(cartItem, value);
                        }}
                      />
                      <IconButton icon={<TbTrash/>} danger small onClick={() => removeStock(cartItem)}/>
                    </Space>
                  </List.Item>;
                }}/>
            </Form.Item>
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
            <Form.Item label={'Observaciones (opcional)'} name={'observations'}>
              <Input.TextArea/>
            </Form.Item>
          </Col>
          <Col span={10}>
            <Divider>Información opcional</Divider>
            <Form.Item label={'Formato de contrato (opcional)'} name={'fk_template_uuid'}>
              <ContractTemplateSelector/>
            </Form.Item>
            <Form.Item label="Fecha de venta (opcional)" name="approved_at" initialValue={dayjs()}>
              <DatePicker style={{width: '100%'}} format={Config.dateFormatUser}/>
            </Form.Item>
            <Form.Item label="Inicio de membresía (opcional)" name="date_start" tooltip={'Fecha desde cuando será válida la membresia'} initialValue={dayjs()}>
              <DatePicker style={{width: '100%'}} format={Config.dateFormatUser}/>
            </Form.Item>
            <Form.Item label="Fecha de finalización de contrato (opcional)" name="terminated_at" tooltip={'El contrato y la subscripción será valida hasta esta fecha'}>
              <DatePicker style={{width: '100%'}} placeholder={'Nunca'}/>
            </Form.Item>
            <Form.Item label={'Cóndiciones de pago (opcional)'} name={'payment_conditions'}>
              <DefaultEditor/>
            </Form.Item>
            <Form.Item label={'Detalles del servicio (opcional)'} name={'service_details'}>
              <DefaultEditor/>
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

export default NewSubscriptionForm;

import React, {useContext, useState} from 'react';
import {
  Col,
  DatePicker, Divider,
  Form,
  Input,
  notification,
  Row,
  Segmented,
  Select,
  Space,
  Tag
} from 'antd';
import {TbCheck, TbPencil} from "react-icons/tb";
import {DefaultEditor} from "react-simple-wysiwyg";
import axios from 'axios';

import type {Contract, StorageContractCartItem, StorageStock} from '../../../Types/api';
import ProfileSelector from '../../../CommonUI/ProfileSelector';
import StockSelector from '../../../WarehouseManager/Components/StockSelector';
import AuthContext from '../../../Context/AuthContext';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import MoneyString from '../../../CommonUI/MoneyString';
import CompanySelector from "../../../HRManagement/Components/CompanySelector";
import ContractTemplateSelector from "../ContractTemplateSelector";
import IconButton from "../../../CommonUI/IconButton";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import PaymentMethodTypesSelector from "../../../CommonUI/PaymentMethodTypesSelector";
import ShoppingCartEditor from "../ShoppingCartEditor";
import './styles.less';

interface NewSaleFormProps {
  onComplete?: (data: Contract) => void;
  contract?: Contract;
  saleType?: 'subscription' | 'enrollment';
}

const NewSaleForm = ({onComplete, contract}: NewSaleFormProps) => {
  const {user} = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [clientType, setClientType] = useState<string>('Persona')
  const [chooseSeller, setChooseSeller] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [shoppingCart, setShoppingCart] = useState<StorageContractCartItem[]>([]);

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
          cart: shoppingCart,
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
    const index = newCart.findIndex(i => i.uuid === data.uuid);
    if (index !== -1) {
      newCart[index].quantity++;
    } else {
      newCart.push({uuid: data.uuid, unit_amount: null, quantity: 1, stock: data});
    }
    setShoppingCart(newCart);
  }

  const cartTotalAmountPen = shoppingCart.reduce((s, item) => {
    const itemAmount = (item.quantity || 1) * (item.unit_amount != null ? item.unit_amount : (item.stock?.sale_price || 0));
    return s + (item.stock?.currency == 'PEN' ? itemAmount : 0);
  }, 0);

  const cartTotalAmountUSD = shoppingCart.reduce((s, item) => {
    const itemAmount = (item.quantity || 1) * (item.unit_amount != null ? item.unit_amount : (item.stock?.sale_price || 0));
    return s + (item.stock?.currency == 'USD' ? itemAmount : 0);
  }, 0);

  return (
    <div>
      <Form layout="vertical" onFinish={submitForm} initialValues={contract}>
        <div className={'sales-form-header'}>
          <div>
            <small className={'label'}>NUEVA:</small>
            <Segmented
              options={[{label: 'Propuesta', value: 'proposal'}, 'Venta']}
              onChange={value => setIsApproved(value != 'proposal')}
            />
          </div>
          <div>
            <small className={'label'}>VENDEDOR:</small>
            <Form.Item label={'Vendedor'} name={'fk_created_by_uuid'} noStyle>
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
          </div>
          <div>
            <small className={'label'}>PERIODO:</small>
            <Form.Item name={'period'} noStyle>
              <Select
                style={{width:120}}
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
          </div>
        </div>
        <Row gutter={[20, 20]}>
          <Col span={14}>
            <Form.Item>
              <ShoppingCartEditor onChange={value => {
                setShoppingCart(value);
                console.log(value);
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
            <Form.Item label={'Observaciones (opcional)'} name={'observations'}>
              <Input.TextArea/>
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
                <Form.Item label="Fecha de estimada de entrega (opcional)" name="dead_line">
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

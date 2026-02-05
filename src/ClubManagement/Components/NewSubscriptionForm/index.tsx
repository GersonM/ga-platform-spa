import React, {useContext, useState} from 'react';
import {
  Alert,
  Col,
  DatePicker, Divider,
  Form,
  Input,
  InputNumber,
  notification,
  Row,
  Select,
  Space,
} from 'antd';
import {TbCheck, TbPencil} from "react-icons/tb";
import dayjs from "dayjs";
import axios from 'axios';

import type {Contract, StorageContractCartItem} from '../../../Types/api';
import ProfileSelector from '../../../CommonUI/ProfileSelector';
import AuthContext from '../../../Context/AuthContext';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from "../../../CommonUI/IconButton";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import PaymentMethodTypesSelector from "../../../CommonUI/PaymentMethodTypesSelector";
import ContractTemplateSelector from "../../../Commercial/Components/ContractTemplateSelector";
import Config from "../../../Config.tsx";
import ShoppingCartEditor from "../../../Commercial/Components/ShoppingCartEditor";
import HtmlEditor from "../../../CommonUI/HtmlEditor";

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
            <Form.Item>
              <ShoppingCartEditor onChange={value => {
                setShoppingCart(value);
              }} />
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
              <HtmlEditor />
            </Form.Item>
            <Form.Item label={'Detalles del servicio (opcional)'} name={'service_details'}>
              <HtmlEditor />
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

import {useContext, useEffect, useState} from 'react';
import {Checkbox, Col, Form, Input, Row, Select} from 'antd';
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
import {TbCheck, TbPencil} from "react-icons/tb";
import CurrencySelector from "../../../PaymentManagement/Components/CurrencySelector";

interface CommercialContractFormProps {
  onComplete?: (data: Contract) => void;
  contract?: Contract;
  isTemplate?: boolean;
}

const CommercialContractForm = ({onComplete, contract, isTemplate = false}: CommercialContractFormProps) => {
  const {user} = useContext(AuthContext);
  const [selectedStock, setSelectedStock] = useState<StorageStock>();
  const [loading, setLoading] = useState(false);
  const [clientType, setClientType] = useState<'company' | 'profile'>()
  const [selectedStockUUID, setSelectedStockUUID] = useState<string>();
  const [chooseSeller, setChooseSeller] = useState(false);

  useEffect(() => {
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
  }, [selectedStockUUID]);

  const submitForm = (data: any) => {
    setLoading(true);
    axios
      .request({
        url: contract ? `commercial/contracts/${contract.uuid}`: 'commercial/contracts',
        method: contract ? 'PUT' : 'POST',
        data: {...data, is_template: isTemplate}
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
      <h2>Registrar nueva venta</h2>
      <Form layout="vertical" onFinish={submitForm} initialValues={contract}>
        <Row gutter={[20, 20]}>
          <Col span={12}>
            {isTemplate ? (
                <Form.Item label={'Nombre de la plantilla'} name={'title'}>
                  <Input/>
                </Form.Item>
              ) :
              <>
                <Form.Item label={'Producto'} name={'stock_uuid'}>
                  <StockSelector onChange={uuid => setSelectedStockUUID(uuid)}/>
                </Form.Item>
                <Form.Item label={'Tipo de contrato / venta'} name={'fk_template_uuid'}>
                  <ContractTemplateSelector/>
                </Form.Item>
                <Form.Item label={'Tipo de cliente'} name={'client_type'} rules={[{required: true}]}>
                  <Select
                    showSearch
                    onChange={value => setClientType(value)}
                    placeholder={'Seleccione modalidad'}
                    options={[
                      {value: 'company', label: 'Empresa'},
                      {value: 'profile', label: 'Persona'},
                    ]}
                  />
                </Form.Item>
                {clientType == 'profile' && (
                  <Form.Item label={'Persona'} name={'fk_profile_uuid'}>
                    <ProfileSelector/>
                  </Form.Item>
                )}
                {clientType == 'company' && (
                  <Form.Item label={'Empresa'} name={'fk_company_uuid'}>
                    <CompanySelector/>
                  </Form.Item>
                )}
              </>
            }
            {/* <Form.Item label={'Modalidad de compra'} name={'sale_mode'} rules={[{required: true}]}>
              <Select
                showSearch
                placeholder={'Seleccione modalidad'}
                options={[
                  {value: '0', label: 'Ninguno'},
                  {value: 'reservation', label: 'Reserva'},
                  {value: 'Techo Propio', label: 'Techo Propio'},
                  {value: 'Terreno', label: 'Terreno'},
                  {value: 'Mi Vivienda', label: 'Mi Vivienda'},
                  {value: 'Contado', label: 'Contado'},
                  {value: 'PROREVI', label: 'PROREVI'},
                ]}
              />
            </Form.Item>*/}
            {!isTemplate && (
              <>
                <Form.Item label={'Modalidad de pago'} name={'payment_mode'} rules={[{required: true}]}>
                  <Select
                    showSearch
                    placeholder={'Seleccione modalidad'}
                    options={[
                      {value: 'first_30', label: 'Inicial de 30%'},
                      {value: '1_pago', label: '1 Solo pago'},
                      {value: '0', label: 'Ninguno'},
                    ]}
                  />
                </Form.Item>
                <Row gutter={[15, 15]}>
                  <Col xs={10}>
                    <Form.Item label={'Moneda'} name={'currency'}>
                      <CurrencySelector placeholder={selectedStock?.currency}/>
                    </Form.Item>
                  </Col>
                  <Col xs={14}>
                    <Form.Item label={'Precio de venta'} name={'sale_price'}>
                      <MoneyInput currency={selectedStock?.currency}
                                  placeholder={selectedStock ? (selectedStock.sale_price || 0) / 100 + '' : ''}/>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
            <Form.Item label={'Observaciones (opcional)'} name={'observations'}>
              <Input.TextArea/>
            </Form.Item>
            <Form.Item label={'Vendedor'} name={'fk_created_by_uuid'}>
              {chooseSeller ? (
                  <ProfileSelector/>
                ) :
                <div>
                  {user?.profile.name} {user?.profile.last_name}
                  <IconButton
                    icon={<TbPencil/>}
                    onClick={() => setChooseSeller(!chooseSeller)}
                  />
                </div>
              }
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={'Duración'} name={'period'}>
              <Select
                showSearch
                placeholder={'Único'}
                options={[
                  {value: 'unique', label: 'Único'},
                  {value: 'monthly', label: 'Mensual'},
                  {value: 'annual', label: 'Anual'},
                ]}
              />
            </Form.Item>
            <Form.Item name={'is_renewable'} valuePropName={'checked'}>
              <Checkbox>Renovar automáticamente</Checkbox>
            </Form.Item>
            <Form.Item label={'Método de pago (opcional)'} name={'payment_type'}>
              <Select
                showSearch
                options={[
                  {value: 'credit', label: 'Tarjeta Crédito / Débido'},
                  {value: 'cash', label: 'Efectivo'},
                  {value: 'other', label: 'Otro'},
                ]}
              />
            </Form.Item>
            <Form.Item label={'Cóndiciones de pago (opcional)'} name={'payment_conditions'}>
              <Input.TextArea/>
            </Form.Item>
            <Form.Item label={'Detalles del servicio (opcional)'} name={'service_details'}>
              <Input.TextArea/>
            </Form.Item>

            <h3 style={{fontWeight: 'bold'}}>Resumen</h3>
            {selectedStock ? (
              <>
                <strong>{selectedStock.product?.name}</strong>
                {selectedStock.product?.description &&
                  <div dangerouslySetInnerHTML={{__html: selectedStock.product?.description}}></div>
                }
                {selectedStock.product?.type == 'property' &&
                  <StockViewerState stock={selectedStock}/>
                }
                <p>
                  <strong>Precio de venta: </strong>
                  <span>
                    <MoneyString currency={selectedStock.currency} value={selectedStock?.sale_price}/>
                  </span>
                </p>
              </>
            ) : (
              <EmptyMessage message={'Elige un producto para ver los detalles'}/>
            )}
          </Col>
        </Row>
        <PrimaryButton icon={<TbCheck />} loading={loading} block htmlType={'submit'} label={'Registrar contrato'}/>
      </Form>
    </div>
  );
};

export default CommercialContractForm;

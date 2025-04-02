import React, {useContext} from 'react';
import {Col, Form, Input, Row} from 'antd';
import ProfileSelector from '../../../CommonUI/ProfileSelector';
import ProductSelector from '../../../WarehouseManager/Components/ProductSelector';
import AuthContext from '../../../Context/AuthContext';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';

const CreateContractForm = () => {
  const {user} = useContext(AuthContext);

  const submitForm = (data: any) => {
    axios
      .post('commercial/contracts', data)
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };
  return (
    <div>
      <h2>Registrar nuevo contrato</h2>
      <Form layout="vertical" onFinish={submitForm}>
        <Row gutter={[20, 20]}>
          <Col span={12}>
            <Form.Item label={'Lote'} name={'fk_product_uuid'}>
              <ProductSelector />
            </Form.Item>
            <Form.Item label={'Cliente'} name={'fk_profile_uuid'}>
              <ProfileSelector />
            </Form.Item>
            <Form.Item label={'Observaciones'}>
              <Input.TextArea />
            </Form.Item>
            <PrimaryButton block htmlType={'submit'} label={'Registrar contrato'} />
          </Col>
          <Col span={12}>
            <h3 style={{fontWeight: 'bold'}}>Información adicional</h3>
            <p>
              <strong>Etapa: </strong>
              <span>IV-A</span>
            </p>
            <p>
              <strong>Modalidad:</strong>
              <span>Terreno</span>
            </p>
            <p>
              <strong>Manzana: </strong>
              <span>P2</span>
            </p>
            <p>
              <strong>Área del terreno:</strong>
              <span>90</span>
            </p>
            <p>
              <strong>Área módulo:</strong>
              <span>TERRENO</span>
            </p>
            <p>
              <strong>Lote: </strong>
              <span>39</span>
            </p>
            <p>
              <strong>Número de habitaciones:</strong>
              <span>2</span>
            </p>
            <p>
              <strong>Dimensiones del terreno:</strong>
              <span>front:6, left:15, right:15, back:6</span>
            </p>
            <p>
              <strong>Vendedor: </strong>
              <span>
                {user?.profile.name} {user?.profile.last_name}
              </span>
            </p>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateContractForm;

import React from 'react';
import {useParams} from 'react-router-dom';
import {Button, Col, Form, Input, Result, Row} from 'antd';

const MailAccountInformation = () => {
  const params = useParams();

  return (
    <div>
      <h3>Información de la cuenta {params.uuid}</h3>
      <Row justify={'center'}>
        <Col sm={12}>
          <Result
            title={'Cuenta no configurada'}
            subTitle={'Para activar la cuenta, ingresar la contraseña que usas para ingresar a tu bandeja de entrada'}>
            <Form layout={'vertical'}>
              <Form.Item label={'Contraseña'}>
                <Input />
              </Form.Item>
              <Button htmlType={'submit'} type={'primary'}>
                Guardar y configurar
              </Button>
            </Form>
          </Result>
        </Col>
      </Row>
    </div>
  );
};

export default MailAccountInformation;

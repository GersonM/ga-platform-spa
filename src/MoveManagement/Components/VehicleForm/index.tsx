import React, {useState} from 'react';
import {Col, Form, Input, InputNumber, Row, Select} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {MoveRoute, MoveVehicle} from '../../../Types/api';
import DriverSelector from '../../../CommonUI/DriverSelector';
import {PiCheckBold} from 'react-icons/pi';

interface VehicleFormProps {
  onCompleted: () => void;
  vehicle?: MoveVehicle;
}

const VehicleForm = ({onCompleted, vehicle}: VehicleFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const submitForm = (values: MoveRoute) => {
    setLoading(true);
    axios
      .request({
        url: vehicle ? `move/vehicles/${vehicle.uuid}` : 'move/vehicles',
        method: vehicle ? 'put' : 'post',
        data: values,
      })
      .then(() => {
        setLoading(false);
        if (onCompleted) {
          onCompleted();
          form.resetFields();
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <>
      <Form form={form} initialValues={vehicle} layout={'vertical'} onFinish={submitForm} requiredMark={false}>
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item
              name={'registration_plate'}
              label={'Identificador'}
              rules={[{required: true, message: 'Requerido'}]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={'circulation_card'} label={'Autorización / Permiso'}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item name={'type'} label={'Tipo'}>
              <Select
                options={[
                  {label: 'Equipo', value: 'team'},
                  {label: 'Vehículo', value: 'vehicle'},
                  {label: 'Ambiente', value: 'space'},
                  {label: 'Parrilla / Cocina', value: 'kitchen'},
                  {label: 'Otro', value: 'other'},
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={'max_capacity'} label={'Capacidad máxima'}>
              <InputNumber suffix={'Pax'} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={8}>
            <Form.Item name={'brand'} label={'Fabricante'}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={'model'} label={'Modelo'}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={'color'} label={'Color'}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name={'fk_driver_uuid'} label={'Encargado'}>
          <DriverSelector placeholder={'Elige persona encargada'} />
        </Form.Item>
        <PrimaryButton block loading={loading} icon={<PiCheckBold />} label={'Guardar'} htmlType={'submit'} />
      </Form>
    </>
  );
};

export default VehicleForm;

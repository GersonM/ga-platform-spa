import React, {useState} from 'react';
import {Form, Input, Divider, message, Row, Col, DatePicker} from 'antd';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import ModalView from "../../../CommonUI/ModalView";
import ProfileSelector from "../../../CommonUI/ProfileSelector";
import MoneyInput from "../../../CommonUI/MoneyInput";
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface CreateEmployeeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  companyUuid: string;
}

const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = (
  {
    visible,
    onCancel,
    onSuccess,
    companyUuid
  }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await axios.post(`hr-management/companies/${companyUuid}/employees`, values);
      message.success('Empleado creado exitosamente');

      onSuccess();
      onCancel();
    } catch (error) {
      ErrorHandler.showNotification(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalView
      title={'Agregar Nuevo Empleado'}
      open={visible}
      onCancel={onCancel}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={loading}
      >
        <Form.Item
          label="Seleccionar Perfil"
          name="profile_uuid"
          rules={[{required: true, message: 'Por favor selecciona un perfil'}]}
        >
          <ProfileSelector placeholder={'Buscar persona registrada'}/>
        </Form.Item>

        <Divider>Información de empleado</Divider>
        <Form.Item label="Fecha de inicio" name="joining_date">
          <DatePicker />
        </Form.Item>
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item label="Area / Departamento" name="working_department">
              <Input placeholder="Ej: Administración, Marketing, etc."/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Cargo/Posición" name="position">
              <Input placeholder="Ej: Desarrollador, Gerente, etc."/>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Salario mensual (opcional)" name="monthly_salary">
          <MoneyInput/>
        </Form.Item>
        <Form.Item label="Centro de Costo" name="cost_center">
          <Input placeholder="Código del centro de costo"/>
        </Form.Item>
        <PrimaryButton loading={loading} htmlType="submit" label={'Guardar'} block/>
      </Form>
    </ModalView>
  );
};

export default CreateEmployeeModal;

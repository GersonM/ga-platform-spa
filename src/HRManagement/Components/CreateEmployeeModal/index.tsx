import React, {useState} from 'react';
import { Form, Input, Button, Divider, message} from 'antd';
import {UserAddOutlined} from '@ant-design/icons';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import ModalView from "../../../CommonUI/ModalView";
import ProfileSelector from "../../../CommonUI/ProfileSelector";
import MoneyInput from "../../../CommonUI/MoneyInput";

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
  const [creationMode, setCreationMode] = useState<'existing' | 'new'>('existing');

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
        <Form.Item label="Cargo/Posición" name="position">
          <Input placeholder="Ej: Desarrollador, Gerente, etc."/>
        </Form.Item>
        <Form.Item label="Area / Departamento" name="working_department">
          <Input placeholder="Ej: Administración, Marketing, etc."/>
        </Form.Item>
        <Form.Item label="Salario mensual" name="monthly_salary">
          <MoneyInput/>
        </Form.Item>
        <Form.Item label="Centro de Costo" name="cost_center">
          <Input placeholder="Código del centro de costo"/>
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            style={{marginLeft: '10px'}}
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<UserAddOutlined/>}
          >
            {creationMode === 'existing' ? 'Crear Empleado' : 'Crear Perfil y Empleado'}
          </Button>
        </div>
      </Form>
    </ModalView>
  );
};

export default CreateEmployeeModal;

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Divider, message, Spin } from 'antd';
import { UserAddOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface Profile {
  uuid: string;
  name: string;
  last_name: string;
  email: string;
  phone?: string;
  document_number: string;
}

interface CreateEmployeeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  companyUuid: string;
}

const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({
                                                                   visible,
                                                                   onCancel,
                                                                   onSuccess,
                                                                   companyUuid
                                                                 }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [creationMode, setCreationMode] = useState<'existing' | 'new'>('existing');
  const [searchingProfiles, setSearchingProfiles] = useState('');

  const loadAvailableProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const response = await axios.get(`hr-management/companies/${companyUuid}/available-profiles`);
      setAvailableProfiles(response.data.data || []);
    } catch (error) {
      ErrorHandler.showNotification(error);
      setAvailableProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadAvailableProfiles();
      form.resetFields();
      setCreationMode('existing');
    }
  }, [visible, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (creationMode === 'existing') {
        await axios.post(`hr-management/companies/${companyUuid}/employees`, {
          profile_uuid: values.profile_uuid,
          cost_center: values.cost_center,
          position: values.position,
        });
        message.success('Empleado creado exitosamente');
      } else {
        const profileData = {
          name: values.name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
          document_number: values.document_number,

          // datos adicionales para crear empleado
          company_uuid: companyUuid,
          cost_center: values.cost_center,
          position: values.position,
        };

        await axios.post('hr-management/profiles', profileData);
        message.success('Perfil y empleado creados exitosamente');
      }

      onSuccess();
      onCancel();
    } catch (error) {
      ErrorHandler.showNotification(error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode: 'existing' | 'new') => {
    setCreationMode(mode);
    form.resetFields();
  };

  const filterProfiles = (input: string, option: any) => {
    const profile = availableProfiles.find(p => p.uuid === option.value);
    if (!profile) return false;

    const searchText = input.toLowerCase();
    return (
      profile.name.toLowerCase().includes(searchText) ||
      profile.last_name.toLowerCase().includes(searchText) ||
      profile.email.toLowerCase().includes(searchText) ||
      profile.document_number.includes(searchText)
    );
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserAddOutlined />
          <span>Agregar Nuevo Empleado</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          <Button
            type={creationMode === 'existing' ? 'primary' : 'default'}
            onClick={() => handleModeChange('existing')}
            disabled={loadingProfiles}
          >
            Seleccionar Perfil Existente
          </Button>
          <Button
            type={creationMode === 'new' ? 'primary' : 'default'}
            onClick={() => handleModeChange('new')}
            icon={<PlusOutlined />}
          >
            Crear Nuevo Perfil
          </Button>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={loading}
      >
        {creationMode === 'existing' ? (
          <>
            <Form.Item
              label="Seleccionar Perfil"
              name="profile_uuid"
              rules={[{ required: true, message: 'Por favor selecciona un perfil' }]}
            >
              <Select
                style={{height: '55px'}}
                placeholder="Buscar y seleccionar perfil..."
                loading={loadingProfiles}
                showSearch
                filterOption={filterProfiles}
                onSearch={setSearchingProfiles}
                notFoundContent={
                  loadingProfiles ? <Spin size="small" /> :
                    availableProfiles.length === 0 ? 'No hay perfiles disponibles' : 'No se encontraron perfiles'
                }
              >
                {availableProfiles.map(profile => (
                  <Select.Option key={profile.uuid} value={profile.uuid}>
                    <div>
                      <strong>{profile.name} {profile.last_name}</strong>
                      <br />
                      <span className="text-gray-500 text-sm">
                        {profile.email} • {profile.document_number}
                      </span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Nombres"
                name="name"
                rules={[{ required: true, message: 'Los nombres son requeridos' }]}
              >
                <Input placeholder="Ingresa los nombres" />
              </Form.Item>
              <Form.Item
                label="Apellidos"
                name="last_name"
                rules={[{ required: true, message: 'Los apellidos son requeridos' }]}
              >
                <Input placeholder="Ingresa los apellidos" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'El email es requerido' },
                  { type: 'email', message: 'Ingresa un email válido' }
                ]}
              >
                <Input placeholder="correo@ejemplo.com" />
              </Form.Item>
              <Form.Item
                label="Teléfono"
                name="phone"
              >
                <Input placeholder="Número de teléfono" />
              </Form.Item>
            </div>

            <Form.Item
              label="Número de Documento"
              name="document_number"
              rules={[{ required: true, message: 'El número de documento es requerido' }]}
            >
              <Input placeholder="DNI, RUC, etc." />
            </Form.Item>
          </>
        )}

        <Divider />

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Cargo/Posición"
            name="position"
          >
            <Input placeholder="Ej: Desarrollador, Gerente, etc." />
          </Form.Item>
          <Form.Item
            label="Centro de Costo"
            name="cost_center"
          >
            <Input placeholder="Código del centro de costo" />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<UserAddOutlined />}
          >
            {creationMode === 'existing' ? 'Crear Empleado' : 'Crear Perfil y Empleado'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateEmployeeModal;

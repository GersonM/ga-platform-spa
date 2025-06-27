import React, {useState} from 'react';
import {Button, Col, Form, Input, message, Modal, Row, Spin} from "antd";
import axios from "axios";
import {TbSearch} from "react-icons/tb";

interface CompanyFormProps {
  onComplete?: () => void;
}

const RucInput = ({ form, placeholder }: { form: any, placeholder: string }) => (
  <Input
    placeholder={placeholder}
    onChange={(e) => handleRucChange(e.target.value, form)}
    suffix={rucLoading ? <Spin size="small" /> : <TbSearch />}
    maxLength={11}
  />
);

const CompanyForm = ({onComplete}: CompanyFormProps) => {
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      setLoading(true);
      await axios.post('hr-management/companies', values);
      message.success('Empresa creada exitosamente');
      setReload(!reload);
      setOpenCreateCompany(false);
      form.resetFields();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error creating company:', error);
      message.error('Error al crear la empresa');
    }
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreate}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nombre Comercial"
              name="name"
              rules={[{ required: true, message: 'El nombre es requerido' }]}
            >
              <Input placeholder="Nombre de la empresa" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: 'email', message: 'Email no válido' }]}
            >
              <Input placeholder="Email de contacto" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Teléfono"
              name="phone"
            >
              <Input placeholder="Teléfono de contacto" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <span>
                      RUC/RUT/Documento Legal
                  {rucLoading && <span style={{ color: '#1890ff', marginLeft: 8 }}>Consultando...</span>}
                    </span>
              }
              name="legal_uid"
            >
              <RucInput form={createForm} placeholder="Ingresa el RUC para autocompletar" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Razón Social"
          name="legal_name"
          extra="Se completará automáticamente al ingresar el RUC"
        >
          <Input placeholder="Razón social de la empresa" />
        </Form.Item>

        <Form.Item
          label="Dirección Legal"
          name="legal_address"
          extra="Se completará automáticamente al ingresar el RUC"
        >
          <Input.TextArea
            rows={3}
            placeholder="Dirección legal completa"
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default CompanyForm;

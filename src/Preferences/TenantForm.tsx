import React, { useState } from 'react';
import { Form, Input, Upload, Button, Space, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { UploadChangeParam } from 'antd/lib/upload/interface';
import { ColorPicker } from 'antd';

const { Title } = Typography;

function TenantForm() {
  const [form] = Form.useForm();

  // Estado para la previsualización del logo en dark y light mode
  const [logoPreviewDark, setLogoPreviewDark] = useState<string>('');
  const [logoPreviewLight, setLogoPreviewLight] = useState<string>('');

  // Función para manejar el cambio de imagen del logo
  const handleLogoChange = (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file && info.file.status === 'done' && info.file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setLogoPreviewDark(result);
          setLogoPreviewLight(result);
        }
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const onFinish = (values: any) => {
    console.log('Valores del formulario:', values);
  };

  return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh', backgroundColor: '#fff' }}>
            <div style={{ width: '90%', maxWidth: '80%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Title level={2}>Editar Información del Tenant</Title>
              <Form form={form} onFinish={onFinish} style={{ width: '100%', maxWidth: '400px' }}>
                <Form.Item label="Color" name="color">
                  <ColorPicker />
                </Form.Item>
                <Form.Item label="Logo" name="logo">
                  <Upload
                          name="logo"
                          beforeUpload={() => false}
                          onChange={handleLogoChange}
                          maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Seleccionar Logo</Button>
                  </Upload>
                  <div style={{ marginTop: '1rem', width: '100%', maxWidth: '200px', textAlign: 'center' }}>
                    {logoPreviewDark && (
                            <div>
                              <span>Previsualización en Dark Mode:</span>
                              <br />
                              <img src={logoPreviewDark} alt="Logo Dark Mode" style={{ maxWidth: '100%' }} />
                            </div>
                    )}
                    {logoPreviewLight && (
                            <div>
                              <span>Previsualización en Light Mode:</span>
                              <br />
                              <img src={logoPreviewLight} alt="Logo Light Mode" style={{ maxWidth: '100%' }} />
                            </div>
                    )}
                  </div>
                </Form.Item>
                <Form.Item label="Favicon" name="favicon">
                  <Upload name="favicon" beforeUpload={() => false}>
                    <Button icon={<UploadOutlined />}>Seleccionar Favicon</Button>
                  </Upload>
                </Form.Item>
                <Form.Item label="Nombre" name="nombre">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Guardar Cambios
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
  );
}

export default TenantForm;

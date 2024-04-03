import React, { useState } from 'react';
import { Form, Input, Upload, Button} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { UploadChangeParam } from 'antd/lib/upload/interface';
import { ColorPicker } from 'antd';
import './TenantForm.css';


function TenantForm() {
  const [form] = Form.useForm();
  const [logoPreviewDark, setLogoPreviewDark] = useState<string>('');
  const [logoPreviewLight, setLogoPreviewLight] = useState<string>('');

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
          <div className="container">
            <div className="form-container">
              <Form form={form} onFinish={onFinish} className="form-wrapper">
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
                  <div className="logo-preview">
                    {logoPreviewDark && (
                            <div>
                              <span>Previsualización en Dark Mode:</span>
                              <br />
                              <img src={logoPreviewDark} alt="Logo Dark Mode" className="logo-img" />
                            </div>
                    )}
                    {logoPreviewLight && (
                            <div>
                              <span>Previsualización en Light Mode:</span>
                              <br />
                              <img src={logoPreviewLight} alt="Logo Light Mode" className="logo-img" />
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

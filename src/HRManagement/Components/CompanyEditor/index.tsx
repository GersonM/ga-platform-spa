import {useEffect, useState} from 'react';
import {Col, Form, Input, Row} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {CheckIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';

interface Company {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  legal_uid: string;
  legal_name: string;
  legal_address: string;
  created_at: string;
  updated_at: string;
}

interface CompanyEditorProps {
  companyUuid: string;
  onCompleted?: () => void;
}

const CompanyEditor = ({companyUuid, onCompleted}: CompanyEditorProps) => {
  const [company, setCompany] = useState<Company>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [form] = useForm();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);
    axios
      .get(`hr-management/companies/${companyUuid}`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setCompany(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [companyUuid, reload]);

  useEffect(() => {
    if (company) {
      form.resetFields();
      form.setFieldsValue(company);
    }
  }, [company, form]);

  const onSubmit = (values: any) => {
    setLoading(true);
    axios
      .put(`hr-management/companies/${companyUuid}`, values)
      .then(response => {
        if (response) {
          setReload(!reload);
          onCompleted && onCompleted();
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const terminateCompany = () => {
    setLoading(true);
    axios
      .delete(`hr-management/companies/${company?.uuid}`)
      .then(response => {
        if (response) {
          if (onCompleted) {
            onCompleted();
          }
          setLoading(false);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const disableCompany = () => {
    setLoading(true);
    axios
      .post(`hr-management/companies/${company?.uuid}/disable`)
      .then(response => {
        if (response) {
          setLoading(false);
          setReload(!reload);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const enableCompany = () => {
    setLoading(true);
    axios
      .post(`hr-management/companies/${company?.uuid}/enable`)
      .then(response => {
        if (response) {
          setLoading(false);
          setReload(!reload);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  if (!company) return null;

  return (
    <>
      <LoadingIndicator visible={loading} message={'Guardando...'} />
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={14} xl={12}>
          <Form form={form} initialValues={company} layout={'vertical'} onFinish={onSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={'legal_uid'}
                  label={'RUC/RUT/Documento Legal'}
                  rules={[{ required: true, message: 'El RUC es requerido' }]}
                >
                  <Input size="large" placeholder="Ingresa el RUC" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={'name'}
                  label={'Nombre Comercial'}
                  rules={[{ required: true, message: 'El nombre comercial es requerido' }]}
                >
                  <Input size="large" placeholder="Nombre comercial de la empresa" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name={'legal_name'}
              label={'Razón Social'}
              rules={[{ required: true, message: 'La razón social es requerida' }]}
            >
              <Input size="large" placeholder="Razón social completa" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name={'phone'} label={'Teléfono'}>
                  <Input size="large" placeholder="Número de teléfono" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={'email'}
                  label={'Email'}
                  rules={[
                    { required: true, message: 'El email es requerido' },
                    { type: 'email', message: 'Ingresa un email válido' }
                  ]}
                >
                  <Input size="large" placeholder="correo@empresa.com" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name={'legal_address'}
              label={'Dirección Legal'}
              rules={[{ required: true, message: 'La dirección legal es requerida' }]}
            >
              <Input.TextArea
                rows={4}
                size="large"
                placeholder="Dirección legal completa de la empresa..."
                style={{ resize: 'none' }}
              />
            </Form.Item>

            <div style={{ marginTop: '24px' }}>
              <PrimaryButton
                block
                htmlType={'submit'}
                icon={<CheckIcon />}
                loading={loading}
                label={'Guardar'}
                size="large"
              />
            </div>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default CompanyEditor;

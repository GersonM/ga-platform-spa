import {useState} from 'react';
import {Button, Col, Form, Input, Row, Select} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import type {Profile} from '../../../Types/api';
import PrimaryButton from "../../../CommonUI/PrimaryButton";

interface CreateUserProps {
  onCompleted?: (profile: Profile) => void;
}

const CreateProfile = ({onCompleted}: CreateUserProps) => {
  const [loading, setLoading] = useState(false);
  const [documentSearching, setDocumentSearching] = useState(false);
  const [profileDocument, setProfileDocument] = useState<string>()
  const [form] = useForm();

  const searchExternal = () => {
    const config = {
      params: {doc_number: profileDocument}
    };

    setDocumentSearching(true);

    axios
      .get(`hr-management/profiles/external-search`, config)
      .then(response => {
        if (response) {
          form.setFields([
            {name: 'name', value: response.data.name},
            {name: 'last_name', value: response.data.last_name},
          ]);
        }
        setDocumentSearching(false);
      })
      .catch((error) => {
        setDocumentSearching(false);
        ErrorHandler.showNotification(error);
      });
  }

  const submitForm = (values: any) => {
    setLoading(true);
    axios
      .post(`hr-management/profiles`, {
        ...values,
      })
      .then(response => {
        setLoading(false);
        form.resetFields();
        if (onCompleted) {
          onCompleted(response.data);
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <Form form={form} onFinish={submitForm} layout={'vertical'}>
      <Row gutter={15}>
        <Col md={10}>
          <Form.Item name={'doc_type'} label={'Tipo de documento'}>
            <Select
              placeholder={'Elige'}
              options={[
                {label: 'DNI', value: 'dni'},
                {label: 'CE', value: 'ce'},
                {label: 'Pasaporte', value: 'passport'},
              ]}
            />
          </Form.Item>
        </Col>
        <Col md={14}>
          <Form.Item name={'doc_number'} label={'N° Documento'}>
            <Input
              onChange={evt => setProfileDocument(evt.target.value)}
              addonAfter={
                <PrimaryButton
                  loading={documentSearching}
                  disabled={!profileDocument}
                  onClick={searchExternal}
                  label={'Buscar'}/>
              }
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name={'name'} label={'Nombre'}>
        <Input placeholder={'Nombre'}/>
      </Form.Item>
      <Form.Item name={'last_name'} label={'Apellidos'}>
        <Input/>
      </Form.Item>
      <Form.Item name={'email'} label={'E-mail'}>
        <Input placeholder={'E-mail'}/>
      </Form.Item>
      <Form.Item name={'phone'} label={'Teléfono'}>
        <Input/>
      </Form.Item>
      <Form.Item name={'cost_center'} label={'Centro de costo'}>
        <Input/>
      </Form.Item>
      <Row gutter={15}>
        <Col md={12}>
          <Form.Item name={'company_name'} label={'Empresa'}>
            <Input/>
          </Form.Item>
        </Col>
        <Col md={12}>
          <Form.Item name={'company_group'} label={'Área de la empresa'}>
            <Input/>
          </Form.Item>
        </Col>
      </Row>
      <Button block shape={'round'} loading={loading} type={'primary'} htmlType={'submit'}>
        Registrar perfil
      </Button>
    </Form>
  );
};

export default CreateProfile;

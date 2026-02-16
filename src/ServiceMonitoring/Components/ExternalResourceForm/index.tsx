import React, {useState} from 'react';
import axios from "axios";
import {Form, Input, Select, Space} from "antd";
import {TbCheck, TbPencil} from "react-icons/tb";
import {useForm} from "antd/lib/form/Form";

import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import type {ExternalResource} from "../../../Types/api.tsx";
import EntityFieldsEditor from "../../../TaxonomyManagement/Components/EntityFieldsEditor";

interface ExternalResourceFormProps {
  externalResource?: ExternalResource;
  onComplete?: (data:ExternalResource) => void;
}

const ExternalResourceForm = ({externalResource, onComplete}:ExternalResourceFormProps) => {
  const [loading, setLoading] = useState(false);
  const [chooseSeller, setChooseSeller] = useState(false);
  const [type, setType] = useState<string>();
  const [form] = useForm();

  const submitForm = (data: any) => {
    setLoading(true);
    axios
      .request({
        url: externalResource ? `external-resources/${externalResource.uuid}` : 'external-resources',
        method: externalResource ? 'PUT' : 'POST',
        data: {...data}
      })
      .then(response => {
        setLoading(false);
        if (onComplete) {
          onComplete(response.data);
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };
  return (
    <div>
      <Form form={form} layout="vertical" onFinish={submitForm} initialValues={externalResource}>
        <Form.Item name={'name'} label={'Nombre'}>
          <Input/>
        </Form.Item>
        <Form.Item label={'Tipo'} name={'type'}>
          <Select
            showSearch
            allowClear
            onChange={value => setType(value)}
            placeholder={'Tipo de recurso'}
            options={[
              {value: 'server', label: 'Servidor'},
              {value: 'domain', label: 'Dominio'},
              {value: 'namecheap_domain', label: 'Dominio en Namecheap '},
              {value: 'vps', label: 'VPS'},
              {value: 'crm', label: 'CRM'},
              {value: 'whatsapp_business_id', label: 'Cuenta Whatsapp Business'},
              {value: 'cpanel_server', label: 'Servidor cPanel/WHM'},
              {value: 'cpanel_account', label: 'Cuenta cPanel'},
            ]}
          />
        </Form.Item>
        <Form.Item name={'id'} label={'Identificador'}>
          <Input/>
        </Form.Item>
        <Form.Item name={'auth_user'} label={'Usuario'}>
          <Input/>
        </Form.Item>
        <Form.Item name={'auth_key'} label={'Llave/Contraseña'}>
          <Input placeholder={'Sin modificar'}/>
        </Form.Item>
        <Form.Item name={'auth_path'} label={'Path'}>
          <Input/>
        </Form.Item>
        <Form.Item label={'Descripción (opcional)'} name={'description'}>
          <Input.TextArea/>
        </Form.Item>
        <Form.Item label={'Descripción (opcional)'} name={'attributes'}>
          <EntityFieldsEditor entity={externalResource} />
        </Form.Item>
        <PrimaryButton
          icon={<TbCheck/>} loading={loading} block htmlType={'submit'}
          label={'Guardar cambios'}/>
      </Form>
    </div>
  );
};

export default ExternalResourceForm;

import React, {useState} from 'react';
import {Button, Col, Form, Input, message, notification, Row} from "antd";
import axios from "axios";
import {TbSearch} from "react-icons/tb";

import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import type {Company} from "../../../Types/api.tsx";
import FileUploader from "../../../CommonUI/FileUploader";
import ApiFileSelector from "../../../FileManagement/Components/ApiFileSelector";
import {sileo} from "sileo";

interface CompanyFormProps {
  onComplete?: (company: Company) => void;
  company?: Company;
}

const CompanyForm = ({onComplete, company}: CompanyFormProps) => {
    const [loading, setLoading] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [companyIDSearch, setCompanyIDSearch] = useState<string>();
    const [form] = Form.useForm();

    const handleCreate = (values: any) => {
      setLoading(true);
      axios
        .request({
          url: company ? `hr-management/companies/${company.uuid}` : 'hr-management/companies',
          method: company ? 'PUT':'POST',
          data: values
        })
        .then((response) => {
          setLoading(false);
          if (onComplete) {
            onComplete(response.data);
          }
        })
        .catch((error) => {
          setLoading(false);
          ErrorHandler.showNotification(error);
        });
    };

    const searchCompany = () => {
      if (!companyIDSearch || companyIDSearch.length < 8) {
        sileo.error({title: 'Ingresa los 11 digitos el ruc para buscar'})
        return;
      }
      setLoadingSearch(true);
      axios.get(`hr-management/companies/lookup-ruc/${companyIDSearch}`)
        .then((response) => {
          setLoadingSearch(false);
          const data = response.data.data;
          form.setFieldsValue({
            legal_name: data.razon_social,
            legal_address: data.direccion,
            name: data.razon_social || form.getFieldValue('name'),
          });
          message.success('Datos encontrados y cargados automáticamente');
        })
        .catch((error) => {
          ErrorHandler.showNotification(error);
        });
    };

    return (
      <div>
        <img src={company?.logo?.source} alt=""/>
        <Form
          form={form}
          layout="vertical"
          initialValues={company}
          onFinish={handleCreate}
        >
          <Form.Item name={'avatar_uuid'}>
            <ApiFileSelector filter={'images'} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={'RUC/RUT/Documento Legal'}
                name="legal_uid"
              >
                <Input
                  suffix={<Button type={'link'} loading={loadingSearch} icon={<TbSearch/>} onClick={searchCompany}>Buscar</Button>}
                  placeholder={'Buscar RUC'}
                  onChange={evt => setCompanyIDSearch(evt.target.value)}
                  maxLength={11}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Nombre Comercial"
                name="name"
                rules={[{required: true, message: 'El nombre es requerido'}]}
              >
                <Input placeholder="Nombre de la empresa"/>
              </Form.Item>
            </Col>
          </Row>


          <Form.Item
            label="Razón Social"
            name="legal_name"
            extra="Se completará automáticamente al ingresar el RUC"
          >
            <Input placeholder="Razón social de la empresa"/>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Teléfono"
                name="phone"
              >
                <Input placeholder="Teléfono de contacto"/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{type: 'email', message: 'Email no válido'}]}
              >
                <Input placeholder="Email de contacto"/>
              </Form.Item>
            </Col>
          </Row>
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
          <PrimaryButton block label={'Guardar'} loading={loading} htmlType="submit"/>
        </Form>
      </div>
    );
  }
;

export default CompanyForm;

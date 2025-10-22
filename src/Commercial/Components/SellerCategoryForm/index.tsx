import React, {useEffect} from 'react';
import {Form, Input} from "antd";
import {useForm} from "antd/lib/form/Form";
import axios from "axios";

import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import type {CommercialCategory} from "../../../Types/api.tsx";

interface SellerCategoryFormProps {
  sellerCategory?: CommercialCategory;
  onComplete?: () => void;
}

const SellerCategoryForm = ({sellerCategory, onComplete}: SellerCategoryFormProps) => {
  const [form] = useForm<CommercialCategory>();

  useEffect(() => {
    form.resetFields();
  }, [sellerCategory])

  const submitForm = (values: any) => {
    axios
      .request({
        url: sellerCategory ? `commercial/seller-category/${sellerCategory.uuid}` : "commercial/seller-category",
        method: sellerCategory ? 'PUT' : 'POST',
        data: values
      })
      .then(() => {
        if (onComplete) {
          form.resetFields();
          onComplete();
        }
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  };

  return (
    <Form form={form} layout="vertical" onFinish={submitForm} initialValues={sellerCategory}>
      <Form.Item name={'name'} label={'Nombre'} rules={[{required:true}]}>
        <Input/>
      </Form.Item>
      <Form.Item name={'code'} label={'Código (opcional)'}>
        <Input/>
      </Form.Item>
      <Form.Item name={'description'} label={'Descripción'}>
        <Input.TextArea/>
      </Form.Item>
      <PrimaryButton htmlType={'submit'} block label={sellerCategory?'Guardar cambio':'Crear categoría'}/>
    </Form>
  );
};

export default SellerCategoryForm;

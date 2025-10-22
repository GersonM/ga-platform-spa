import React from 'react';
import {Form, Input, Select} from "antd";
import ProfileSelector from "../../../CommonUI/ProfileSelector";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import axios from "axios";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import type {CommercialSeller} from "../../../Types/api.tsx";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import SellerCategorySelector from "../SellerCategorySelector";

interface SellerFormProps {
  seller?: CommercialSeller;
  onComplete?: () => void;
}

const SellerForm = ({seller, onComplete}: SellerFormProps) => {
  const submitForm = (values: any) => {
    axios
      .request({
        url: seller ? `commercial/seller/${seller.uuid}` : "commercial/seller",
        method: seller ? 'PUT' : 'POST',
        data: values
      })
      .then(() => {
        if (onComplete) {
          onComplete();
        }
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  };

  return (
    <Form layout="vertical" onFinish={submitForm} initialValues={seller}>
      <h3>Registrar nuevo vendedor</h3>
      <p>Los vendedores podrán tener asignados una categoría de vendedor y recibir comisiones por las ventas</p>
      {seller ?
        <Form.Item label={'Persona'}>
          <ProfileChip profile={seller.profile} showDocument/> </Form.Item> :
        <Form.Item name={'profile_uuid'} label={'Persona'}>
          <ProfileSelector/>
        </Form.Item>
      }
      <Form.Item name={'seller_id'} label={'ID de vendedor (opcional)'}>
        <Input/>
      </Form.Item>
      <Form.Item label={'Categoría'} name={'commercial_category_uuid'}>
        <SellerCategorySelector />
      </Form.Item>
      <PrimaryButton htmlType={'submit'} block label={'Guardar'}/>
    </Form>
  );
};

export default SellerForm;

import React from 'react';
import {Col, Form, Row, Select} from "antd";
import ProfileSelector from "../../../CommonUI/ProfileSelector";
import PrimaryButton from "../../../CommonUI/PrimaryButton";

const SellerForm = () => {
  return (
    <Form layout="vertical">
      <h3>Registrar nuevo vendedor</h3>
      <Form.Item name={'profile_uuid'} label={'Persona'}>
        <ProfileSelector />
      </Form.Item>
      <Form.Item label={'Categoría'} name={'comission'}>
        <Select options={[
          {label:'A', value:'1'},
          {label:'B', value:'1'},
          {label:'C', value:'1'},
        ]} />
      </Form.Item>
      <PrimaryButton block label={'Guardar'} />
    </Form>
  );
};

export default SellerForm;

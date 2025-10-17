import React from 'react';
import {Button, Col, Divider, Form, Input, InputNumber, Row, Select} from "antd";
import ProfileSelector from "../../../CommonUI/ProfileSelector";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import StockSelector from "../../../WarehouseManager/Components/StockSelector";

const SellerCategoryForm = () => {
  return (
    <Form layout="vertical">
      <h3>Categorías de vendedor</h3>
      <Row gutter={[20, 20]}>
        <Col span={10}>
          <Form.Item name={'name'} label={'Nombre'}>
            <Input />
          </Form.Item>
          <Form.Item label={'Categoría'} name={'comission'}>
            <Select options={[
              {label:'A', value:'1'},
              {label:'B', value:'1'},
              {label:'C', value:'1'},
            ]} />
          </Form.Item>
        </Col>
        <Col span={14}>
          <Divider>Productos en categoría</Divider>
          <Row gutter={[20, 20]}>
            <Col span={16}>
              <StockSelector style={{width:'100%'}}  />
            </Col>
            <Col span={8}>
              <InputNumber suffix={'%'} />
            </Col>
          </Row>
          <Button type="dashed" htmlType="submit" block>Agregar nuevo</Button>
        </Col>
      </Row>
      <PrimaryButton block label={'Guardar'} />
    </Form>
  );
};

export default SellerCategoryForm;

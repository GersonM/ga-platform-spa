import React from 'react';
import {Form, InputNumber, Popconfirm, Select, Space} from "antd";
import {TbCheck, TbTrash} from "react-icons/tb";
import axios from "axios";

import StockSelector from "../../../WarehouseManager/Components/StockSelector";
import type {CommercialCategory, CommercialCategoryFee} from "../../../Types/api.tsx";
import IconButton from "../../../CommonUI/IconButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import StorageStockChip from "../StorageStockChip";

interface CategoryFeeFormProps {
  category?: CommercialCategory;
  categoryFee?: CommercialCategoryFee;
  onComplete?: () => void;
}

const CategoryFeeForm = ({category, onComplete, categoryFee}: CategoryFeeFormProps) => {
  const submitForm = (values: any) => {
    axios
      .request({
        url: categoryFee ? `commercial/seller-category-fees/${categoryFee.uuid}` : "commercial/seller-category-fees",
        method: categoryFee ? 'PUT' : 'POST',
        data: {...values, commercial_category_uuid: category?.uuid}
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

  const deleteCategoryFee = () => {
    axios.delete(`commercial/seller-category-fees/${categoryFee?.uuid}`, {})
      .then(() => {
        if (onComplete) {
          onComplete();
        }
      })
      .catch();
  }

  return (
    <Form layout={'inline'} initialValues={categoryFee} onFinish={submitForm}>
      {categoryFee ? <Form.Item style={{width:'200px'}}>
          <StorageStockChip storageStock={categoryFee.stock}/>
        </Form.Item> :
        <Form.Item name={'stock_uuid'}>
          <StockSelector style={{width: 200}}/>
        </Form.Item>
      }
      <Form.Item name={'amount'}>
        <InputNumber style={{width: 60}}/>
      </Form.Item>
      <Form.Item name={'type'}>
        <Select style={{width: 130}} placeholder={'% Comisión'} popupMatchSelectWidth={false} options={[
          {value: 'fee_percent', label: '% Comisión'},
          {value: 'discount_percent', label: '% Descuento'},
        ]}/>
      </Form.Item>
      <Space>
        <IconButton type={'text'} icon={<TbCheck/>} htmlType={"submit"}/>
        {categoryFee &&
          <Popconfirm title={'¿Quieres eliminar este fee?'} description={'No afectará a ventas ya hechas'}
                      onConfirm={() => deleteCategoryFee()}>
            <IconButton icon={<TbTrash/>} danger/>
          </Popconfirm>
        }
      </Space>
    </Form>
  );
};

export default CategoryFeeForm;

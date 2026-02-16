import React, {useEffect, useState} from 'react';
import {Col, Drawer, List, Popconfirm, Row} from "antd";
import SellerCategoryForm from "../SellerCategoryForm";
import type {CommercialCategory} from "../../../Types/api.tsx";
import {useForm} from "antd/lib/form/Form";
import axios from "axios";
import IconButton from "../../../CommonUI/IconButton";
import {TbPencil, TbPercentage, TbTrash} from "react-icons/tb";
import CategoryFeesManager from "../CategoryFeesManager";

const SellerCategoriesManager = () => {
  const [selectedCategory, setSelectedCategory] = useState<CommercialCategory>();
  const [categories, setCategories] = useState<CommercialCategory[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [openCategoryFeesManager, setOpenCategoryFeesManager] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`commercial/seller-category`, config)
      .then(response => {
        if (response) {
          setCategories(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const deleteCategory = (uuid: string) => {
    axios.delete(`commercial/seller-category/${uuid}`, {})
      .then(response => {
        setReload(!reload);
        setSelectedCategory(undefined);
      })
      .catch();
  }

  return (
    <>
      <h3>Categorías de vendedor</h3>
      <Row gutter={[30, 30]}>
        <Col span={12}>
          <List
            dataSource={categories} loading={loading}
            renderItem={category => {
              return (<List.Item>
                <List.Item.Meta title={category.name} description={category.description}/>
                <IconButton icon={<TbPercentage/>} title={'Gestionar porcentajes'} small onClick={() => {
                  setSelectedCategory(category);
                  setOpenCategoryFeesManager(true);
                }}/>
                <IconButton icon={<TbPencil/>} small onClick={() => {
                  setSelectedCategory(category);
                }}/>
                <Popconfirm
                  title={'¿Seguro que quieres eliminar este producto?'}
                  description={'Esto modificará el monto total del contrato'}
                  onConfirm={() => deleteCategory(category.uuid)}
                >
                  <IconButton icon={<TbTrash/>} danger small/>
                </Popconfirm>
              </List.Item>)
            }}
          />
        </Col>
        <Col span={12}>
          <SellerCategoryForm sellerCategory={selectedCategory} onComplete={() => {
            setReload(!reload);
            setSelectedCategory(undefined);
          }}/>
        </Col>
      </Row>
      <Drawer
        destroyOnHidden
        size={600}
        title={'Porcentajes para ' + selectedCategory?.name}
        open={openCategoryFeesManager} onClose={() => setOpenCategoryFeesManager(false)}>
        {selectedCategory && <CategoryFeesManager category={selectedCategory} />}
      </Drawer>
    </>
  );
};

export default SellerCategoriesManager;

import React, {useEffect, useState} from 'react';
import {Button, Popconfirm, Space} from "antd";
import axios from "axios";

import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import TableList from "../../../CommonUI/TableList";
import IconButton from "../../../CommonUI/IconButton";
import {TbPencil, TbTrash} from "react-icons/tb";
import ModalView from "../../../CommonUI/ModalView";
import SellerForm from "../../Components/SellerForm";
import type {CommercialCategory, CommercialSeller, Profile, ResponsePagination} from "../../../Types/api.tsx";
import TablePagination from "../../../CommonUI/TablePagination";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import SellerCategoriesManager from "../../Components/SellerCategoriesManager";

const CommercialSellersManager = () => {
  const [openSellerForm, setOpenSellerForm] = useState(false);
  const [openCategoryManager, setOpenCategoryManager] = useState(false);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sellers, setSellers] = useState<CommercialSeller[]>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [selectedSeller, setSelectedSeller] = useState<CommercialSeller>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`commercial/seller`, config)
      .then(response => {
        if (response) {
          setSellers(response.data.data);
          setPagination(response.data.meta);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const deleteSeller = (uuid: string) => {
    axios.delete(`commercial/seller/${uuid}`, {})
      .then(response => {
      })
      .catch();
  }

  const columns = [
    {
      title: 'ID vendedor',
      dataIndex: 'seller_id',
      width: 110,
      render: (seller_id?: string) => <code>{seller_id ? seller_id : 'Sin categoría asignada'}</code>,
    },
    {
      title: 'Nombre',
      width: 280,
      dataIndex: 'profile',
      render: (profile: Profile) => <ProfileChip profile={profile} showDocument/>
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      render: (category?: CommercialCategory) => category ? category.name : <small>Sin categoría asignada</small>,
    },
    {
      dataIndex: 'uuid',
      width: 100,
      render: (uuid: string, row: CommercialSeller) => {
        return <Space>
          <IconButton icon={<TbPencil/>} onClick={() => {
            setSelectedSeller(row);
            setOpenSellerForm(true);
          }}/>
          <Popconfirm
            title={'¿Quieres borrar este vendedor?'}
            description={'Esto no eliminar a la persona ni sus ventas'}
            onConfirm={() => deleteSeller(uuid)}>
            <IconButton icon={<TbTrash/>} danger/>
          </Popconfirm>
        </Space>;
      }
    }
  ];
  return (
    <ModuleContent>
      <ContentHeader
        title={'Vendedores'}
        onRefresh={() => setReload(!reload)}
        tools={<>
          <Button
            ghost type={"primary"} size={'small'} onClick={() => setOpenCategoryManager(true)}>Ver
            categorías</Button>
        </>}
        onAdd={() => {
          setOpenSellerForm(true);
          setSelectedSeller(undefined);
        }}/>
      <TableList columns={columns} dataSource={sellers} customStyle={false}/>
      <TablePagination pagination={pagination}/>
      <ModalView open={openSellerForm} onCancel={() => setOpenSellerForm(false)}>
        <SellerForm
          seller={selectedSeller}
          onComplete={() => {
          setOpenSellerForm(false);
          setReload(!reload);
        }}/>
      </ModalView>
      <ModalView width={900} open={openCategoryManager} onCancel={() => setOpenCategoryManager(false)}>
        <SellerCategoriesManager />
      </ModalView>
    </ModuleContent>
  );
};

export default CommercialSellersManager;


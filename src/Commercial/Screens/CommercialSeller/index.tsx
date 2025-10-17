import React, {useState} from 'react';
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import TableList from "../../../CommonUI/TableList";
import {Button, Space} from "antd";
import IconButton from "../../../CommonUI/IconButton";
import {TbTrash} from "react-icons/tb";
import ModalView from "../../../CommonUI/ModalView";
import SellerForm from "../../Components/SellerForm";
import SellerCategoryForm from "../../Components/SellerCategoryForm";

const CommercialSeller = () => {
  const [openSellerForm, setOpenSellerForm] = useState(false);
  const [openCategoryManager, setOpenCategoryManager] = useState(false);

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'uuid',
    },
    {
      title: 'Cantidad de ventas',
      dataIndex: 'uuid',
    },
    {
      dataIndex: 'uuid',
      render: () => {
        return <Space>
          <IconButton icon={<TbTrash/>} onClick={() => {
          }} danger/>
        </Space>;
      }
    }
  ];
  return (
    <ModuleContent>
      <ContentHeader
        title={'Vendedores'}
        tools={<>
          <Button
            ghost type={"primary"} size={'small'} onClick={() => setOpenCategoryManager(true)}>Ver
            categorías</Button>
        </>}
        onAdd={() => setOpenSellerForm(true)}/>
      <TableList columns={columns} customStyle={false}/>
      <ModalView open={openSellerForm} onCancel={() => setOpenSellerForm(false)}>
        <SellerForm/>
      </ModalView>
      <ModalView width={900} open={openCategoryManager} onCancel={() => setOpenCategoryManager(false)}>
        <SellerCategoryForm/>
      </ModalView>
    </ModuleContent>
  );
};

export default CommercialSeller;


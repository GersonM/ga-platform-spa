import React, {useState} from 'react';
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import TableList from "../../../CommonUI/TableList";
import {Space} from "antd";
import IconButton from "../../../CommonUI/IconButton";
import {TbTrash} from "react-icons/tb";
import ModalView from "../../../CommonUI/ModalView";
import SellerForm from "../../Components/SellerForm";

const CommercialSeller = () => {
  const [openSellerForm, setOpenSellerForm] = useState(false);
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
      <ContentHeader title={'Vendedores'} onAdd={() => setOpenSellerForm(true)}/>
      <TableList columns={columns} customStyle={false}/>
      <ModalView open={openSellerForm} onCancel={() => setOpenSellerForm(false)}>
        <SellerForm />
      </ModalView>
    </ModuleContent>
  );
};

export default CommercialSeller;


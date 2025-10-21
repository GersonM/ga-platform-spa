import React, {useEffect, useState} from 'react';
import {TbPencil, TbTrash} from "react-icons/tb";
import {Popconfirm, Space} from "antd";
import axios from "axios";

import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import type {EntityField} from "../../../Types/api.tsx";
import TableList from "../../../CommonUI/TableList";
import IconButton from "../../../CommonUI/IconButton";
import ModalView from "../../../CommonUI/ModalView";
import EntityFieldForm from "../../Components/EntityFieldForm";
import CustomTag from "../../../CommonUI/CustomTag";

const EntityFieldManager = () => {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<EntityField[]>();
  const [reload, setReload] = useState(false);
  const [selectedField, setSelectedField] = useState<EntityField>();
  const [openFieldForm, setOpenFieldForm] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`taxonomy/entity-fields`, config)
      .then(response => {
        if (response) {
          setFields(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const columns = [
    {
      title: 'Código',
      width: 150,
      dataIndex: 'code',
      render: (text: any, record: any) => {
        return <CustomTag>{text}</CustomTag>;
      }
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
    },
    {
      title: 'Grupo',
      dataIndex: 'group',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
    },
    {
      title: 'Unidad',
      dataIndex: 'unit_type',
    },
    {
      width: 100,
      dataIndex: 'uuid',
      render: (_uuid: string, record: EntityField) => (
        <Space>
          <IconButton icon={<TbPencil/>} onClick={() => {
            setSelectedField(record);
            setOpenFieldForm(true);
          }}/>
          <Popconfirm title={'¿Quiere eliminar este campo?'}>
            <IconButton icon={<TbTrash/>} danger/>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <ContentHeader
        title={'Tipos de datos'} description={'Agrega tipos de datos adicionales disponibles en el sistema'}
        onAdd={() => {
          setOpenFieldForm(true);
          setSelectedField(undefined);
        }}
        onRefresh={() => setReload(!reload)}/>
      <TableList dataSource={fields} columns={columns}/>
      <ModalView open={openFieldForm} onCancel={() => setOpenFieldForm(false)}>
        <EntityFieldForm entityField={selectedField} onComplete={() => {
          setReload(!reload);
          setOpenFieldForm(false);
        }}/>
      </ModalView>
    </>

  );
};

export default EntityFieldManager;

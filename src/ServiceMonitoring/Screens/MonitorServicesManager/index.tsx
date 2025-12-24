import React, {useEffect, useState} from 'react';
import {Form, Input, notification, Popconfirm, Space} from "antd";
import axios from "axios";

import type {
  ExternalResource,
  ResponsePagination,
} from "../../../Types/api.tsx";
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import FilterForm from "../../../CommonUI/FilterForm";
import ProductGroupsSelector from "../../../WarehouseManager/Components/ProductGroupsSelector";
import ProductManufacturerSelector from "../../../WarehouseManager/Components/ProductManufacturerSelector";
import TableList from "../../../CommonUI/TableList";
import CustomTag from "../../../CommonUI/CustomTag";
import IconButton from "../../../CommonUI/IconButton";
import {TbPencil} from "react-icons/tb";
import ModalView from "../../../CommonUI/ModalView";
import ExternalResourceForm from "../../Components/ExternalResourceForm";
import {useNavigate} from "react-router-dom";
import {LuEye, LuPower, LuTrash, LuTrash2} from "react-icons/lu";
import TablePagination from "../../../CommonUI/TablePagination";
import ResourceStatus from "../../Components/ResourceStatus";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";

const MonitorServicesManager = () => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<ExternalResource[]>();
  const [reload, setReload] = useState(false);
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddResource, setOpenAddResource] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ExternalResource>();
  const [filters, setFilters] = useState<any>();
  const navigate = useNavigate();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {page: currentPage, with_stock: 1, ...filters},
    };

    setLoading(true);

    axios
      .get(`external-resources`, config)
      .then(response => {
        if (response) {
          setResources(response.data.data);
          setPagination(response.data.meta);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, currentPage, filters]);

  const resetServer = (uuid:string) => {
    setLoading(true);
    axios.post(`external-resources/servers/${uuid}/reset`)
      .then(() => {
        setLoading(false);
        notification.success({message:'Reinicio en proceso'});
      })
      .catch((error) => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      })
  }

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: 'Estado',
      dataIndex: 'uuid',
      width: 100,
      render: (uuid: string) => (<ResourceStatus resourceUuid={uuid}/>)
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      align: 'center',
      width: 100,
      render: (text: string) => (<CustomTag color={'green'}>{text}</CustomTag>)
    },
    {
      title: 'ID',
      dataIndex: 'id',
      render: (text: string) => (<code>{text}</code>)
    },
    {
      title: 'Usuario',
      dataIndex: 'auth_user',
      render: (text: string) => (<code>{text}</code>)
    },
    {
      title: 'Llave',
      dataIndex: 'auth_key_hint',
      render: (text: string) => (<code>{text}</code>)
    },
    {
      title: 'Tiempo activo',
      width: 210,
      dataIndex: 'uptime'
    },
    {
      dataIndex: 'uuid',
      width: 100,
      render: (uuid: string, row: ExternalResource) => (
        <Space>
          <IconButton small icon={<TbPencil/>} onClick={() => {
            setSelectedResource(row);
            setOpenAddResource(true);
          }}/>
          <IconButton small icon={<LuEye/>} onClick={() => navigate(uuid)}/>
          <Popconfirm
            title={'¿Quieres reiniciar el servicio?'} description={'Forzar reinicio del sistema'}
            onConfirm={() => resetServer(uuid)}
          >
            <IconButton small danger icon={<LuPower/>} title={'Reiniciar'}/>
          </Popconfirm>
          <IconButton small danger icon={<LuTrash2/>} onClick={() => navigate(uuid)}/>
        </Space>
      )
    }
  ]

  return (
    <ModuleContent>
      <ContentHeader
        title={'Monitoreo de servicios'}
        loading={loading}
        largeTools
        onRefresh={() => setReload(!reload)}
        onAdd={() => {
          setOpenAddResource(true);
          setSelectedResource(undefined);
        }}>
        <FilterForm
          onInitialValues={values => setFilters(values)}
          onSubmit={values => setFilters(values)}
        >
          <Form.Item name={'search'} label={'Buscar'}>
            <Input.Search
              allowClear
              placeholder={'Buscar por nombre, código o descripción'}
            />
          </Form.Item>
          <Form.Item name={'ip'} label={'IP'}>
            <ProductGroupsSelector/>
          </Form.Item>
          <Form.Item name={'manufacturer'}>
            <ProductManufacturerSelector/>
          </Form.Item>
        </FilterForm>
      </ContentHeader>
      <TableList customStyle={false} columns={columns} dataSource={resources}/>
      {pagination && (
        <TablePagination pagination={pagination} onChange={(page) => setCurrentPage(page)}/>
      )}
      <ModalView
        title={selectedResource ? 'Editar recurso' : 'Nuevo recurso'}
        open={openAddResource} onCancel={() => setOpenAddResource(false)}>
        <ExternalResourceForm
          externalResource={selectedResource} onComplete={() => {
          setOpenAddResource(false);
          setReload(!reload);
        }}/>
      </ModalView>
    </ModuleContent>
  );
};

export default MonitorServicesManager;
